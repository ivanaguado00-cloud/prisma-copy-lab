import Link from 'next/link'
import { BriefingForm } from '../../../../components/briefing/BriefingForm'
import { CHANNEL, type Channel } from '../../../../types/domain'

export const metadata = {
  title: 'Nuevo briefing — PRISMA Copy Lab',
}

type Props = { searchParams: Promise<{ channel?: string }> }

// ── Selector de canal ─────────────────────────────────────────────────────────

function ChannelSelector() {
  return (
    <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto">
      <div className="mb-10">
        <h1
          className="text-2xl font-bold text-on-surface"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          ¿Qué tipo de mensaje quieres crear?
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Elige el canal para mostrar el formulario adecuado.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/briefs/new?channel=whatsapp"
          className="group flex flex-col gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:border-brand-lime hover:bg-surface-container-low transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-xl">
            💬
          </div>
          <div>
            <p className="font-semibold text-on-surface text-base">WhatsApp</p>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Mensaje directo, conversacional. Optimizado para el formato de chat.
            </p>
          </div>
          <span className="text-xs font-medium text-brand-lime opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
            Crear brief WhatsApp →
          </span>
        </Link>

        <Link
          href="/briefs/new?channel=email"
          className="group flex flex-col gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:border-brand-lime hover:bg-surface-container-low transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-xl">
            ✉️
          </div>
          <div>
            <p className="font-semibold text-on-surface text-base">Email</p>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Pieza de captación por correo. Incluye asunto, preheader y plantilla.
            </p>
          </div>
          <span className="text-xs font-medium text-brand-lime opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
            Crear brief Email →
          </span>
        </Link>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default async function NewBriefPage({ searchParams }: Props) {
  const { channel } = await searchParams

  if (!channel || !Object.values(CHANNEL).includes(channel as Channel)) {
    return <ChannelSelector />
  }

  const validChannel = channel as Channel

  const CHANNEL_LABEL: Record<Channel, string> = {
    whatsapp: 'WhatsApp',
    email:    'Email',
  }

  return (
    <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto">

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/briefs/new"
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ← Cambiar canal
          </Link>
        </div>
        <h1
          className="text-2xl font-bold text-on-surface"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Nuevo briefing
          <span className="ml-2 text-base font-normal text-on-surface-variant">
            — {CHANNEL_LABEL[validChannel]}
          </span>
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Los campos marcados con <span className="text-[#ba1a1a]">*</span> son obligatorios.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 md:p-8">
        <BriefingForm channel={validChannel} />
      </div>

    </div>
  )
}
