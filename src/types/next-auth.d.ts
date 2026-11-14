import type { DefaultSession } from "next-auth";

export type MemberRole = "member" | "admin";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: MemberRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: MemberRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId?: string;
    role?: MemberRole;
  }
}