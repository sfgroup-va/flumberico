import NextAuth from "next-auth"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "./prisma"
import bcrypt from "bcryptjs"

async function authorizeCredentials(credentials: Record<string, string> | undefined) {
  if (!credentials?.email || !credentials?.password) {
    return null
  }

  // Check for admin credentials first
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (credentials.email === adminEmail && credentials.password === adminPassword) {
    // Create or update admin user in database
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: "Flumberico Admin",
        role: "admin",
      },
      create: {
        email: adminEmail,
        name: "Flumberico Admin",
        role: "admin",
        password: await bcrypt.hash(adminPassword, 10),
      },
    })

    return {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role
    }
  }

  // Check regular user credentials
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
    include: { profile: true }
  })

  if (!user || !user.password) {
    return null
  }

  const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

  if (!isPasswordValid) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        // Add bypass for development/testing
        if (process.env.NODE_ENV === 'development') {
          console.log('🔓 Development mode - Checking credentials...');
          return await authorizeCredentials(credentials);
        }
        return await authorizeCredentials(credentials);
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "user"
        token.subscriptionTier = user.subscriptionTier || "free"
        token.isActiveHunter = user.isActiveHunter || false
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id || token.sub) as string
        session.user.role = (token.role || 'user') as string
        session.user.subscriptionTier = (token.subscriptionTier || 'free') as string
        session.user.isActiveHunter = (token.isActiveHunter || false) as boolean
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
  }
}

export default NextAuth(authOptions)