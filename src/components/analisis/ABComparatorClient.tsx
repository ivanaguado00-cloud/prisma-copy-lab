'use client'

import { useState } from 'react'
import type { SendMetricsWithBrief } from '../../dao/sendMetricsDao'

interface Props {
  sends: SendMetricsWithBrief[]
}

interface ABMetric {
  label: string
  valueA: string | number
  valueB: string | number
  higherIsBetter: boolean
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
}

function pct(part: number, whole: number): string {
  if (whole === 0) return '—'
  return `${Math.round((part / whole) * 100)}%`
}

function formatEur(n: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)
}

function computeRevenue(s: SendMetricsWithBrief): number {
  if (!s.programPrice) return 0
  return s.enrollments * s.programPrice * (1 - (s.programDiscount ?? 0))
}

export function ABComparatorClient({ sends }: Props) {
  const [open, setOpen]     = useState(false)
  const [idA, setIdA]       = useState(sends[0]?.briefId ?? '')
  const [idB, setIdB]       = useState(sends[1]?.briefId ?? '')

  if (sends.length < 2) return null

  const sendA = sends.find((s) => s.briefId === idA)
  const sendB = sends.find((s) => s.briefId === idB)

  const metrics: ABMetric[] = sendA && sendB
    ? [
        {
          label: 'Apertura',
          valueA: pct(sendA.opensCount, sendA.deliveredCount),
          valueB: pct(sendB.opensCount, sendB.deliveredCount),
          higherIsBetter: true,
        },
        {
          label: 'CTR',
          valueA: pct(sendA.clicksCount, sendA.opensCount),
          valueB: pct(sendB.clicksCount, sendB.opensCount),
          higherIsBetter: true,
        },
        {
          label: 'Leads react.',
          valueA: sendA.leadsReactivated,
          valueB: sendB.leadsReactivated,
          higherIsBetter: true,
        },
        {
          label: 'Matrículas',
          valueA: sendA.enrollments,
          valueB: sendB.enrollments,
          higherIsBetter: true,
        },
        {
          label: 'Ingresos',
          valueA: formatEur(computeRevenue(sendA)),
          valueB: formatEur(computeRevenue(sendB)),
          higherIsBetter: true,
        },
      ]
    : []

  // Determine winner by enrollments
  const winnerLabel =
    sendA && sendB && sendA.enrollments !== sendB.enrollments
      ? sendA.enrollments > sendB.enrollments
        ? 'Variante A'
        : 'Variante B'
      : null

  function isNumericBetter(a: string | number, b: string | number, higher: boolean): boolean | null {
    const numA = parseFloat(String(a).replace('%', '').replace(/[.]/g, '').replace(',', '.'))
    const numB = parseFloat(String(b).replace('%', '').replace(/[.]/g, '').replace(',', '.'))
    if (isNaN(numA) || isNaN(numB)) return null
    return higher ? numA > numB : numA < numB
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#4c4546]">
          Compara el rendimiento de dos comunicaciones enviadas.
        </p>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-sm font-medium border border-[#cfc4c5] rounded px-4 py-2 text-[#1b1c1c] hover:border-[#1b1c1c] transition-all"
        >
          {open ? 'Cerrar comparador' : 'Comparar comunicaciones'}
        </button>
      </div>

      {open && (
        <div className="space-y-4">
          {/* Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-[#4c4546] mb-1">Variante A</p>
              <select
                value={idA}
                onChange={(e) => setIdA(e.target.value)}
                className="w-full text-sm border border-[#cfc4c5] rounded px-3 py-2 bg-[#ffffff] text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c]"
              >
                {sends.map((s) => (
                  <option key={s.briefId} value={s.briefId} disabled={s.briefId === idB}>
                    {CHANNEL_LABELS[s.brief.channel] ?? s.brief.channel} · {s.brief.title.substring(0, 35)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs font-medium text-[#4c4546] mb-1">Variante B</p>
              <select
                value={idB}
                onChange={(e) => setIdB(e.target.value)}
                className="w-full text-sm border border-[#cfc4c5] rounded px-3 py-2 bg-[#ffffff] text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c]"
              >
                {sends.map((s) => (
                  <option key={s.briefId} value={s.briefId} disabled={s.briefId === idA}>
                    {CHANNEL_LABELS[s.brief.channel] ?? s.brief.channel} · {s.brief.title.substring(0, 35)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison table */}
          {sendA && sendB && idA !== idB && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center text-sm font-medium text-[#1b1c1c] bg-[#f5f3f3] rounded py-2">
                  {sendA.brief.title.substring(0, 40)}
                </div>
                <div className="text-center text-sm font-medium text-[#1b1c1c] bg-[#f5f3f3] rounded py-2">
                  {sendB.brief.title.substring(0, 40)}
                </div>
              </div>

              <div className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_1fr] text-xs font-semibold text-[#7e7576] px-4 py-2 border-b border-[#e9e8e7] bg-[#f5f3f3]">
                  <span>Métrica</span>
                  <span className="text-center">A</span>
                  <span className="text-center">B</span>
                </div>
                {metrics.map(({ label, valueA, valueB, higherIsBetter }) => {
                  const aBetter = isNumericBetter(valueA, valueB, higherIsBetter)
                  const bBetter = isNumericBetter(valueB, valueA, higherIsBetter)
                  return (
                    <div
                      key={label}
                      className="grid grid-cols-[1fr_1fr_1fr] items-center text-sm px-4 py-2.5 border-b border-[#f5f3f3] last:border-b-0"
                    >
                      <span className="text-[#4c4546]">{label}</span>
                      <span
                        className={`text-center font-medium tabular-nums ${
                          aBetter ? 'text-[#1a6639]' : 'text-[#1b1c1c]'
                        }`}
                      >
                        {valueA}
                      </span>
                      <span
                        className={`text-center font-medium tabular-nums ${
                          bBetter ? 'text-[#1a6639]' : 'text-[#1b1c1c]'
                        }`}
                      >
                        {valueB}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Winner */}
              {winnerLabel && (
                <div className="bg-[#e3f5ec] border border-[#b2dfcc] rounded-lg px-4 py-3 text-sm text-[#1a6639]">
                  <span className="font-semibold">Ganador: {winnerLabel}</span>
                  {' — '}
                  {winnerLabel === 'Variante A'
                    ? `${sendA.enrollments} matrículas frente a ${sendB.enrollments} de B.`
                    : `${sendB.enrollments} matrículas frente a ${sendA.enrollments} de A.`}
                  {' '}
                  Considera usar este enfoque como base para comunicaciones similares.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
