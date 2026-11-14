import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findLocalAccount } from "@/lib/auth/localAccounts";
import { verifyPassword } from "@/lib/auth/passwords";
import { loginSchema } from "@/lib/auth/schemas";
import { linkPatreonMember } from "@/lib/members/memberRepository";
import { parseMembership, type PatreonIdentityPayload } from "@/lib/members/membership";
import { saveMembership } from "@/lib/members/membershipRepository";
import type { MemberRole } from "@/types/next-auth";

interface PatreonIdentity extends PatreonIdentityPayload {
  readonly data: {
    readonly id: string;
    readonly attributes: {
      readonly full_name?: string | null;
      readonly email?: string | null;
    };
  };
}

/** Requests the member's name, email, and membership status with this campaign. */
const PATREON_IDENTITY_URL = [
  "https://www.patreon.com/api/oauth2/v2/identity",
  "?include=memberships.campaign",
  "&fields%5Buser%5D=full_name,email",
  "&fields%5Bmember%5D=patron_status,currently_entitled_amount_cents,pledge_relationship_start,next_charge_date,last_charge_date,last_charge_status",
].join("");

export const authConfig: NextAuthConfig = {
  providers: [
    {
      id: "patreon",
      name: "Patreon",
      type: "oauth",
      clientId: process.env.PATREON_CLIENT_ID,
      clientSecret: process.env.PATREON_CLIENT_SECRET,
      authorization: {
        url: "https://www.patreon.com/oauth2/authorize",
        params: { scope: "identity identity[email] identity.memberships" },
      },
      token: { url: "https://www.patreon.com/api/oauth2/token" },
      userinfo: PATREON_IDENTITY_URL,
      client: { token_endpoint_auth_method: "client_secret_post" },
      profile(raw: PatreonIdentity) {
        return {
          id: raw.data.id,
          name: raw.data.attributes.full_name ?? null,
          email: raw.data.attributes.email ?? null,
        };
      },
    },

    Credentials({
      id: "local",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const account = await findLocalAccount(parsed.data.email);
        if (!account) return null;

        const isValid = await verifyPassword(parsed.data.password, account.passwordHash);
        if (!isValid) return null;

        // Assigned to a variable first, so the extra "role" field isn't flagged as an excess property.
        const user = {
          id: account.id,
          name: account.name || null,
          email: parsed.data.email,
          role: account.role,
        };
        return user;
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/community" },

  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "patreon" && profile) {
        const identity = profile as unknown as PatreonIdentity;

        // Attaches to an existing email account with the same email, so one person keeps one record.
        const member = await linkPatreonMember(
          identity.data.id,
          identity.data.attributes.full_name ?? null,
          identity.data.attributes.email ?? null,
        );

        const membership = parseMembership(identity, process.env.PATREON_CAMPAIGN_ID);
        if (membership) {
          await saveMembership(member.id, membership);
        } else {
          console.warn("PATREON_CAMPAIGN_ID is not set. Membership was not refreshed.");
        }

        token.userId = member.id;
        token.role = member.role;
      }

      if (account?.provider === "local" && user) {
        const local = user as unknown as { id: string; role: MemberRole };
        token.userId = local.id;
        token.role = local.role;
      }

      return token;
    },

    session({ session, token }) {
      session.user.id = token.userId ?? "";
      session.user.role = token.role ?? "member";
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);