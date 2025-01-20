// src/app/api/auth/[...nextauth]/option.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Change this line to check for identifier instead of email
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Missing identifier or password");
        }

        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.identifier },
                { username: credentials.identifier },
              ],
            },
          });

          console.log("DB Query params:", {
            identifier: credentials.identifier,
          });
          console.log("User found:", user);

          if (!user) {
            throw new Error("No user found with this email or username");
          }

          if (!user.isEmailVerified) {
            throw new Error("Please verify your account before logging in");
          }

          if (!user.password) {
            throw new Error("Password is missing");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("Incorrect password");
          }

          // Transform the Prisma User into NextAuth User
          return {
            id: user.id,
            email: user.email || undefined,
            username: user.username || undefined,
            isEmailVerified: user.isEmailVerified,
          };
        } catch (err: unknown) {
          const error =
            err instanceof Error ? err.message : "An error occurred";
          console.error("Authorize Error:", error);
          throw new Error(error);
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") {
        return true;
      }

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: {
            email: user.email!,
          },
          include: {
            accounts: true,
          },
        });

        if (!existingUser) {
          // Create new user
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              username:
                profile?.name?.replace(/\s+/g, "").toLowerCase() ||
                user.email?.split("@")[0],
              isEmailVerified: true,
              avatarUrl: user.image || "/DefaultAvatar.png",
              firstName: profile?.name,
              lastName: profile?.name,
            },
          });

          // Create account
          await prisma.account.create({
            data: {
              userId: newUser.id,
              type: account?.type ?? "oauth",
              provider: account?.provider ?? "unknown",
              providerAccountId: account?.providerAccountId ?? "",
              access_token: account?.access_token,
              expires_at: account?.expires_at,
              token_type: account?.token_type,
              scope: account?.scope,
              id_token: account?.id_token,
            },
          });

          return true;
        }

        // If user exists but no account, create account
        if (
          !existingUser.accounts?.some(
            (acc) => acc.provider === account?.provider
          )
        ) {
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account?.type ?? "oauth",
              provider: account?.provider ?? "unknown",
              providerAccountId: account?.providerAccountId ?? "",
              access_token: account?.access_token,
              expires_at: account?.expires_at,
              token_type: account?.token_type,
              scope: account?.scope,
              id_token: account?.id_token,
            },
          });
        }

        return true;
      } catch (error) {
        console.error("SignIn Error:", error);
        return false;
      }
    },
    async session({ session }) {
      if (session.user) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email! },
          select: {
            id: true,
            username: true,
            role: true,
            isEmailVerified: true,
          },
        });

        if (user) {
          session.user.id = user.id;
          session.user.username = user.username ?? undefined;
          session.user.role = user.role;
          session.user.isEmailVerified = user.isEmailVerified;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};
