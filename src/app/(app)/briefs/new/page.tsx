import { BriefingForm } from '../../../../components/briefing/BriefingForm'

export const metadata = {
  title: 'Nuevo briefing — PRISMA Copy Lab',
}

type Props = { searchParams: Promise<{ channel?: string }> }

export default async function NewBriefPage({ searchParams }: Props) {
  const { channel } = await searchParams

  return (
    <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto">

      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-on-surface"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Nuevo briefing
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Rellena los datos del briefing para generar el mensaje de captación.
          Los campos marcados con <span className="text-error-cp">*</span> son obligatorios.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 md:p-8">
        <BriefingForm defaultChannel={channel} />
      </div>

    </div>
  )
}
