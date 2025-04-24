import 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    name: string
    role: string
    token: string
    organization: string
  }

  interface Session {
    user: {
      id: string
      name: string
      role: string
      accessToken: string
      organization: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    accessToken?: string
    organization?: string
  }
} 