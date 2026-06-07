import { BriefingForm } from '../../../components/briefing/BriefingForm'

export const metadata = {
  title: 'Nuevo briefing — PRISMA Copy Lab',
}

export default function NewBriefPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#e3e2e5]">Nuevo briefing</h1>
        <p className="text-sm text-[#c4c9ac] mt-1">
          Rellena los datos del briefing para generar el mensaje de captación.
          Los campos marcados con <span className="text-[#ffb4ab]">*</span> son obligatorios.
        </p>
      </div>

      <div
        className="rounded-lg p-6"
        style={{
          background: '#1b1c1e',
          border: '1px solid #444933',
          boxShadow: '0 0 32px rgba(195,244,0,0.05)',
        }}
      >
        <BriefingForm />
      </div>

    </div>
  )
}
