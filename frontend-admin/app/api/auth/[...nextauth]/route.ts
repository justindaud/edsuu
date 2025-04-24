import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('Attempting to authenticate with backend...')
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: credentials?.username,
              password: credentials?.password,
            }),
          })

          const data = await res.json()
          console.log('Backend response:', JSON.stringify(data))

          if (res.ok && data.user) {
            return {
              id: data.user._id,
              name: data.user.username,
              role: data.user.role,
              token: data.token,
              organization: data.user.organization
            }
          }

          console.log('Authentication failed:', data.message)
          throw new Error(data.message || 'Authentication failed')
        } catch (error: any) {
          console.error('Auth error:', error)
          throw new Error(error.message || 'Authentication failed')
        }
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login', // Redirect to login page on error
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.accessToken = user.token
        token.organization = user.organization
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.accessToken = token.accessToken as string
        session.user.organization = token.organization as string
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST } 