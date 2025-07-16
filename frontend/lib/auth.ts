import GoogleProvider from "next-auth/providers/google";
import { AuthOptions, DefaultSession } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../backend/lib/prisma";

// Extend the JWT type to include our custom properties
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}

// Extend the Session type to include our custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    } & DefaultSession["user"];
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },

  session: {
    strategy: "jwt", // required for cookie + backend verification
  },

  callbacks: {
    async jwt({ token, account, user }) {
      // On first login, attach user info to token
      if (account && user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      // Pass token data into session object
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
};
