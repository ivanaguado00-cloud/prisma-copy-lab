'use client'

import { useActionState } from 'react'
import { loginAction } from '../actions/authActions'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0d0e10] relative overflow-hidden">

      {/* Radial lime glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(195,244,0,0.10) 0%, rgba(13,14,16,0) 70%)',
        }}
      />

      <div className="w-full max-w-sm space-y-7 relative z-10">

        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-1 prisma-gradient-bg shadow-lg shadow-[#abd600]/25">
            <span className="text-[#283500] font-bold text-lg tracking-tight">P</span>
          </div>
          <h1 className="text-2xl font-bold prisma-gradient-text">PRISMA Copy Lab</h1>
          <p className="text-sm text-[#c4c9ac]">Accede con tu cuenta institucional</p>
        </div>

        {/* Card */}
        <div
          className="rounded-lg p-6 space-y-5"
          style={{
            background: '#1b1c1e',
            border: '1px solid #444933',
            boxShadow: '0 0 40px rgba(195,244,0,0.06), 0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          <form action={formAction} className="space-y-4">

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#e3e2e5] block">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="usuario@prisma.es"
                className="w-full rounded border border-[#444933] bg-[#0d0e10] px-4 py-2.5 text-sm text-[#e3e2e5] focus:outline-none focus:ring-2 focus:ring-[#c3f400]/30 focus:border-[#c3f400] placeholder:text-[#c4c9ac]/40 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#e3e2e5] block">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded border border-[#444933] bg-[#0d0e10] px-4 py-2.5 text-sm text-[#e3e2e5] focus:outline-none focus:ring-2 focus:ring-[#c3f400]/30 focus:border-[#c3f400] placeholder:text-[#c4c9ac]/40 transition-all"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-[#ffb4ab] bg-[#1c0000] border border-[#ffb4ab]/30 rounded px-4 py-2.5">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded px-4 py-2.5 text-sm font-semibold text-[#283500] prisma-gradient-bg hover:opacity-90 active:opacity-80 transition-all shadow-lg shadow-[#abd600]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Accediendo…' : 'Entrar'}
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-[#c4c9ac]/50">
          Universidad Prisma — uso interno
        </p>
      </div>
    </div>
  )
}
