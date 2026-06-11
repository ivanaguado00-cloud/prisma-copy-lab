'use client'

import { useActionState } from 'react'
import { loginAction } from '../../actions/authActions'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">

      <div className="w-full max-w-sm space-y-7">

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1b1c1c] mb-2">
            <span className="text-white font-bold text-lg tracking-tight">P</span>
          </div>
          <h1
            className="text-2xl font-bold text-[#1b1c1c]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            PRISMA Copy Lab
          </h1>
          <p className="text-sm text-[#4c4546]">Accede con tu cuenta institucional</p>
        </div>

        {/* Card */}
        <div className="bg-[#ffffff] border border-[#cfc4c5] p-6 space-y-5">
          <form action={formAction} className="space-y-5">

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-[#1b1c1c] block">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="usuario@prisma.es"
                className="w-full border-0 border-b-2 border-[#cfc4c5] bg-transparent px-0 py-2 text-sm text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c] placeholder:text-[#7e7576] transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-[#1b1c1c] block">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full border-0 border-b-2 border-[#cfc4c5] bg-transparent px-0 py-2 text-sm text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c] placeholder:text-[#7e7576] transition-colors"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-[#ba1a1a] bg-[#ffdad6] border border-[#ffb4ab] px-4 py-2.5">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#1b1c1c] text-white py-3 px-4 text-sm font-semibold hover:bg-[#4c4546] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Accediendo…' : 'Authenticate Access'}
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-[#7e7576]">
          Universidad Prisma — uso interno
        </p>
      </div>
    </div>
  )
}
