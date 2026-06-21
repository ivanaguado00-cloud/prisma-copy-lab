import Link from 'next/link'
import { BriefingForm } from '../../../../components/briefing/BriefingForm'
import { CHANNEL, EMAIL_TEMPLATE, EMAIL_TEMPLATE_LABELS, EMAIL_TEMPLATE_DESCRIPTIONS, type Channel, type EmailTemplate } from '../../../../types/domain'
import { listPrograms } from '../../../../dao/programDao'
import type { DbProgram } from '../../../../components/briefing/BriefingForm'

export const metadata = {
  title: 'Nuevo briefing — PRISMA Copy Lab',
}

type Props = { searchParams: Promise<{ channel?: string; template?: string }> }

// ── 1. Selector de canal ──────────────────────────────────────────────────────

function ChannelSelector() {
  return (
    <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'var(--font-heading)' }}>
          ¿Qué tipo de mensaje quieres crear?
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Elige el canal para mostrar el formulario adecuado.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/briefs/new?channel=whatsapp"
          className="group flex flex-col gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:border-[#1b1c1c] hover:bg-surface-container-low transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-xl">💬</div>
          <div>
            <p className="font-semibold text-on-surface text-base">WhatsApp</p>
            <p className="text-sm text-on-surface-variant mt-0.5">Mensaje directo, conversacional. Optimizado para el formato de chat.</p>
          </div>
          <span className="text-xs font-medium text-[#1b1c1c] opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
            Crear brief WhatsApp →
          </span>
        </Link>

        <Link
          href="/briefs/new?channel=email"
          className="group flex flex-col gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:border-[#1b1c1c] hover:bg-surface-container-low transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-xl">✉️</div>
          <div>
            <p className="font-semibold text-on-surface text-base">Email</p>
            <p className="text-sm text-on-surface-variant mt-0.5">Pieza de captación por correo. Incluye asunto, preheader y plantilla.</p>
          </div>
          <span className="text-xs font-medium text-[#1b1c1c] opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
            Crear brief Email →
          </span>
        </Link>
      </div>
    </div>
  )
}

// ── 2. Selector de plantilla de email (con preview de estructura) ─────────────

function EmailStructurePreview({ type }: { type: string }) {
  // Wireframe blocks representing each email layout
  const Block = ({ h, w = 'w-full', dark = false, rounded = false }: { h: string; w?: string; dark?: boolean; rounded?: boolean }) => (
    <div className={`${h} ${w} ${dark ? 'bg-[#1b1c1c]' : 'bg-[#cfc4c5]/60'} ${rounded ? 'rounded' : ''} shrink-0`} />
  )

  const accent = 'h-1 w-8 bg-[#1b1c1c] rounded'

  if (type === EMAIL_TEMPLATE.standard) return (
    <div className="flex flex-col gap-1.5 p-3 bg-[#f5f3f3] rounded border border-[#e9e8e7]">
      <Block h="h-4" dark />
      <div className="h-1" />
      <Block h="h-2.5" w="w-3/4" />
      <Block h="h-1.5" />
      <Block h="h-1.5" />
      <Block h="h-1.5" w="w-5/6" />
      <div className="h-0.5" />
      <Block h="h-1.5" />
      <Block h="h-1.5" w="w-4/5" />
      <div className="h-1 flex justify-center">
        <div className="h-5 w-20 bg-[#1b1c1c] rounded mt-1" />
      </div>
      <div className="h-1" />
      <Block h="h-1.5" w="w-1/2 mx-auto" />
    </div>
  )

  if (type === EMAIL_TEMPLATE.palancas) return (
    <div className="flex flex-col gap-1.5 p-3 bg-[#f5f3f3] rounded border border-[#e9e8e7]">
      <Block h="h-4" dark />
      <div className="h-1" />
      <Block h="h-3.5" w="w-full" />
      <Block h="h-3.5" w="w-4/5" />
      <Block h="h-2" w="w-3/4" />
      <div className="h-0.5" />
      <Block h="h-1.5" />
      <Block h="h-1.5" w="w-5/6" />
      <Block h="h-1.5" w="w-full" />
      <div className="h-1 flex justify-center">
        <div className="h-6 w-24 bg-[#1b1c1c] rounded-sm mt-1" />
      </div>
      <div className="h-1" />
      <Block h="h-1.5" w="w-1/2 mx-auto" />
    </div>
  )

  if (type === EMAIL_TEMPLATE.descuentos) return (
    <div className="flex flex-col gap-1.5 p-3 bg-[#f5f3f3] rounded border border-[#e9e8e7]">
      <Block h="h-4" dark />
      <div className="h-1" />
      <Block h="h-3.5" w="w-full" />
      <Block h="h-3.5" w="w-3/4" />
      <div className="h-1 flex items-center justify-center">
        <div className="h-7 w-28 bg-[#1b1c1c]/10 border-2 border-[#1b1c1c] rounded mt-1 flex items-center justify-center">
          <div className="h-2 w-16 bg-[#1b1c1c] rounded" />
        </div>
      </div>
      <div className="h-1.5" />
      <Block h="h-1.5" />
      <Block h="h-1.5" w="w-5/6" />
      <div className="h-1 flex justify-center">
        <div className="h-6 w-24 bg-[#1b1c1c] rounded-sm mt-1" />
      </div>
      <div className="h-1" />
      <Block h="h-1.5" w="w-1/2 mx-auto" />
    </div>
  )

  if (type === EMAIL_TEMPLATE.reminder) return (
    <div className="flex flex-col gap-1.5 p-3 bg-[#f5f3f3] rounded border border-[#e9e8e7]">
      <Block h="h-4" dark />
      <div className="h-1" />
      <div className="flex gap-1.5 items-stretch">
        <div className="w-1 bg-[#1b1c1c] rounded shrink-0" />
        <div className="flex flex-col gap-1 flex-1">
          <Block h="h-2.5" w="w-3/4" />
          <Block h="h-1.5" w="w-full" />
        </div>
      </div>
      <div className="h-0.5" />
      <Block h="h-1.5" />
      <Block h="h-1.5" w="w-5/6" />
      <Block h="h-1.5" w="w-4/5" />
      <div className="h-1 flex">
        <div className="h-5 w-20 bg-[#1b1c1c] rounded mt-1" />
      </div>
      <div className="h-1" />
      <Block h="h-1.5" w="w-1/2 mx-auto" />
    </div>
  )

  if (type === EMAIL_TEMPLATE.newsletter) return (
    <div className="flex flex-col gap-1.5 p-3 bg-[#1b1c1c] rounded border border-[#1b1c1c]">
      <div className="h-2 w-16 bg-white/70 rounded" />
      <div className="flex flex-col gap-1 bg-white rounded p-2 mt-0.5">
        <Block h="h-3" w="w-full" />
        <Block h="h-3" w="w-4/5 mx-auto" />
        <Block h="h-1.5" w="w-3/4 mx-auto" />
        <div className="h-0.5" />
        <div className="flex justify-center">
          <div className="h-5 w-20 bg-[#1b1c1c] rounded" />
        </div>
        <div className="h-1" />
        <Block h="h-1.5" />
        <Block h="h-1.5" w="w-5/6" />
        <Block h="h-1.5" w="w-full" />
        <Block h="h-1.5" w="w-4/5" />
        <div className="h-1" />
        <Block h="h-1.5" w="w-1/2 mx-auto" />
      </div>
    </div>
  )

  return null
}

const TEMPLATE_TAGS: Record<string, string[]> = {
  standard:   ['Informativo', 'Presentación'],
  palancas:   ['Beneficio', 'Sin descuento', 'Conversión'],
  descuentos: ['Oferta', 'Urgencia', 'Precio'],
  reminder:   ['Recordatorio', 'Fechas', 'Reactivación'],
  newsletter: ['Sector', 'Contenido', 'Nutrición'],
}

function EmailTemplateSelector() {
  const types = Object.values(EMAIL_TEMPLATE) as EmailTemplate[]

  return (
    <div className="px-6 md:px-10 py-8 max-w-5xl mx-auto">
      <div className="mb-2 flex items-center gap-2">
        <Link href="/briefs/new" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
          ← Cambiar canal
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'var(--font-heading)' }}>
          Selecciona el tipo de email
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Cada tipo tiene una estructura y propósito distintos. Elige el que mejor encaje con tu objetivo de campaña.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {types.map((type) => (
          <Link
            key={type}
            href={`/briefs/new?channel=email&template=${type}`}
            className="group flex flex-col bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden hover:border-[#1b1c1c] hover:shadow-sm transition-all"
          >
            {/* Structure preview */}
            <div className="p-3 border-b border-outline-variant bg-white">
              <EmailStructurePreview type={type} />
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col gap-2 flex-1">
              <p className="text-sm font-semibold text-on-surface leading-snug">
                {EMAIL_TEMPLATE_LABELS[type]}
              </p>
              <p className="text-[11px] text-on-surface-variant leading-snug flex-1">
                {EMAIL_TEMPLATE_DESCRIPTIONS[type]}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {TEMPLATE_TAGS[type]?.map((tag) => (
                  <span key={tag} className="text-[10px] bg-surface-container-low border border-outline-variant rounded-full px-2 py-0.5 text-on-surface-variant">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs font-medium text-[#1b1c1c] opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                Usar esta plantilla →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── 3. Página del formulario ──────────────────────────────────────────────────

const CHANNEL_LABEL: Record<Channel, string> = {
  whatsapp: 'WhatsApp',
  email:    'Email',
}

// ── Página principal ──────────────────────────────────────────────────────────

export default async function NewBriefPage({ searchParams }: Props) {
  const { channel, template } = await searchParams

  // Sin canal → selector de canal
  if (!channel || !Object.values(CHANNEL).includes(channel as Channel)) {
    return <ChannelSelector />
  }

  const validChannel = channel as Channel

  // Email sin plantilla → selector de plantilla con preview
  if (validChannel === 'email' && (!template || !Object.values(EMAIL_TEMPLATE).includes(template as EmailTemplate))) {
    return <EmailTemplateSelector />
  }

  const validTemplate = template as EmailTemplate | undefined

  // Load active programs from DB for the program selector
  const rawPrograms = await listPrograms()
  const programs: DbProgram[] = (rawPrograms as unknown as Array<{ id: string; name: string; school: string; targetProfile?: string | null; isActive: boolean }>)
    .filter((p) => p.isActive)
    .map((p) => ({ id: p.id, name: p.name, school: p.school, targetProfile: p.targetProfile }))

  return (
    <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <Link href="/briefs/new" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            ← Canal
          </Link>
          {validChannel === 'email' && (
            <>
              <span className="text-on-surface-variant/40 text-sm">/</span>
              <Link href="/briefs/new?channel=email" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                Tipo de email
              </Link>
            </>
          )}
        </div>
        <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'var(--font-heading)' }}>
          Nuevo briefing
          <span className="ml-2 text-base font-normal text-on-surface-variant">
            — {CHANNEL_LABEL[validChannel]}
            {validTemplate && ` · ${EMAIL_TEMPLATE_LABELS[validTemplate]}`}
          </span>
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Los campos marcados con <span className="text-[#ba1a1a]">*</span> son obligatorios.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 md:p-8">
        <BriefingForm channel={validChannel} initialEmailTemplate={validTemplate} programs={programs} />
      </div>
    </div>
  )
}
