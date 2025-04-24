import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import 'next-auth/jwt'

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please define NEXTAUTH_SECRET in your environment variables')
}

type Organization = 'EDSU' | 'TokoBuku'
type Role = 'admin' | 'editor'

interface AuthResponse {
  user: {
    _id: string
    username: string
    role: string
    organization: string
  }
  token: string
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.username || !credentials?.password) {
          console.error('Auth Error: Missing credentials')
          return null
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            console.error('Auth Error:', data)
            return null
          }

          return {
            id: data.user._id,
            username: data.user.username,
            role: data.user.role,
            organization: data.user.organization,
            token: data.token
          }
        } catch (error) {
          console.error('Auth Error:', error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id
          token.username = user.username
          token.role = user.role
          token.organization = user.organization
          token.accessToken = user.token
        }
        return token
      } catch (error) {
        console.error('JWT Callback Error:', error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (token && session.user) {
          session.user.id = token.id as string
          session.user.name = token.username as string
          session.user.role = token.role as string
          session.user.organization = token.organization as string
          session.user.accessToken = token.accessToken as string
        }
        return session
      } catch (error) {
        console.error('Session Callback Error:', error)
        return session
      }
    },
  },
} 