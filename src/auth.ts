import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user?.passwordHash) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        )

        if (!isValid) return null

        const role = user.email === 'ivan.aguado00@gmail.com' ? 'admin' : user.role
        return { id: user.id, email: user.email, name: user.name, role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id)   token.id   = user.id
      if (user?.role) token.role = user.role
      if (token.email === 'ivan.aguado00@gmail.com') token.role = 'admin'
      return token
    },
    session({ session, token }) {
      if (token.id)   session.user.id   = token.id   as string
      if (token.role) session.user.role = token.role as string
      // Safety net: token.role may be absent in JWTs minted before the role
      // was added to the jwt callback. In that case fall back to the email override.
      if (!session.user.role && token.email === 'ivan.aguado00@gmail.com') {
        session.user.role = 'admin'
      }
      return session
    },
  },
})
