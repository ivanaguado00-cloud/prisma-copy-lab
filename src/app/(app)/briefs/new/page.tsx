import { BriefingForm } from '../../../../components/briefing/BriefingForm'

export const metadata = {
  title: 'Nuevo briefing — PRISMA Copy Lab',
}

export default function NewBriefPage() {
  return (
    <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto">

      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-[#1b1c1c]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Nuevo briefing
        </h1>
        <p className="text-sm text-[#4c4546] mt-1">
          Rellena los datos del briefing para generar el mensaje de captación.
          Los campos marcados con <span className="text-[#ba1a1a]">*</span> son obligatorios.
        </p>
      </div>

      <div className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg p-6 md:p-8">
        <BriefingForm />
      </div>

    </div>
  )
}
