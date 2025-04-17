import { Account, AuthOptions, Profile, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import { loginCollectionUser } from "@/service/user/user-service";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "NormalLogin",
      credentials: {
        id: { label: "id", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(
        credentials: Record<"id" | "password", string> | undefined
      ): Promise<User | null> {
        if (!credentials) return null;
        const res = await loginCollectionUser(credentials);

        if (!res.success || !res.data) {
          throw new Error(res.message || "로그인 실패");
        }

        return res.data;
      },
    }),
  ],
  callbacks: {
    async signIn({
                   // user, account, profile, email, credentials
    }) {
      return true;
    },
    async jwt({
      token,
      user,
      // account,
      // profile,
      trigger,
      // isNewUser,
      session,
    }: {
      token: JWT;
      user: User | AdapterUser;
      account: Account | null;
      profile?: Profile;
      trigger?: "signIn" | "signUp" | "update";
      isNewUser?: boolean;
      session?: Session;
    }) {
      if (user) {
        token.user = user;
      }

      if (trigger === "update" && session) {
        token.user = session.user;
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user = token.user;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 1시간 세션
  },
};
