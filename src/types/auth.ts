import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    subscriptionTier?: string
    isActiveHunter?: boolean
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      role?: string
      subscriptionTier?: string
      isActiveHunter?: boolean
    } & DefaultSession["user"]
  }

  interface Token {
    role?: string
    subscriptionTier?: string
    isActiveHunter?: boolean
  }
}