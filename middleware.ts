import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

function isSecureRequest(req: NextRequest): boolean {
  const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL
  if (authUrl) {
    return authUrl.startsWith('https://')
  }

  return req.nextUrl.protocol === 'https:'
}

export default async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET or NEXTAUTH_SECRET is required for auth middleware')
  }

  const token = await getToken({
    req,
    secret,
    secureCookie: isSecureRequest(req),
  })

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)'],
}
