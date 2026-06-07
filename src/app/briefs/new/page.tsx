import { BriefingForm } from '../../../components/briefing/BriefingForm'

export const metadata = {
  title: 'Nuevo briefing — PRISMA Copy Lab',
}

export default function NewBriefPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Nuevo briefing</h1>
        <p className="text-sm text-slate-400 mt-1">
          Rellena los datos del briefing para generar el mensaje de captación.
          Los campos marcados con <span className="text-[#f87171]">*</span> son obligatorios.
        </p>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{
          background: '#0f0f1a',
          border: '1px solid #1e1e3a',
          boxShadow: '0 0 32px rgba(124,58,237,0.08)',
        }}
      >
        <BriefingForm />
      </div>

    </div>
  )
}
