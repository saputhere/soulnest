import NextAuth, { type NextAuthConfig } from "next-auth";
import { saveMember } from "@/lib/members/memberRepository";
import { parseMembership, type PatreonIdentityPayload } from "@/lib/members/membership";
import { saveMembership } from "@/lib/members/membershipRepository";

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
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/community" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "patreon" && profile) {
        const identity = profile as unknown as PatreonIdentity;

        const member = await saveMember(
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