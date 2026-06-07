import { NextResponse } from 'next/server'
import { auth } from './src/auth'

export default auth((req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)'],
}
