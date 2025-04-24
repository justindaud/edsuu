import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt'

type Organization = 'EDSU' | 'TokoBuku'
type Role = 'admin' | 'editor'

declare module 'next-auth' {
  interface User {
    id: string
    username: string
    role: string
    organization: string
    token: string
  }

  interface Session {
    user: {
      id: string
      name: string
      role: string
      organization: string
      accessToken: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    role: string
    organization: string
    accessToken: string
  }
} 