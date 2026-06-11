import Link from 'next/link'

export const metadata = {
  title: 'PRISMA Copy Lab',
  description: 'Generador de mensajes de captación para Universidad Prisma',
}

const featureCards = [
  {
    title: 'Genera',
    description: 'Crea mensajes de captación adaptados al canal, programa y objetivo de cada campaña.',
  },
  {
    title: 'Valida',
    description: 'Cada mensaje pasa por criterios pedagógicos y de compliance de Universidad Prisma.',
  },
  {
    title: 'Refina',
    description: 'Itera sobre el mensaje con instrucciones precisas hasta conseguir la versión definitiva.',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-16 py-20 md:py-28 max-w-[1280px] mx-auto w-full">
        <div className="max-w-2xl">

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#4c4546] bg-[#e9e8e7] border border-[#cfc4c5] rounded-full px-3 py-1 mb-6 uppercase tracking-widest">
            Marketing Automation 2.0
          </div>

          <h1
            className="text-5xl sm:text-6xl font-bold text-[#1b1c1c] leading-tight mb-6 tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            PRISMA<br />Copy Lab
          </h1>

          <p className="text-lg text-[#4c4546] max-w-lg leading-relaxed mb-8">
            Genera, refina y valida mensajes de captación con inteligencia artificial.
            Optimizado para los estándares de comunicación de Universidad Prisma.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/briefs/new"
              className="rounded px-6 py-3 text-sm font-semibold bg-[#1b1c1c] text-white hover:bg-[#4c4546] transition-colors"
            >
              Nuevo Brief
            </Link>
            <Link
              href="/dashboard"
              className="rounded px-6 py-3 text-sm font-semibold border border-[#1b1c1c] text-[#1b1c1c] hover:bg-[#e9e8e7] transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#f5f3f3] border-t border-[#cfc4c5] px-6 md:px-16 py-16">
        <div className="max-w-[1280px] mx-auto">

          <p className="text-xs font-semibold text-[#7e7576] uppercase tracking-widest mb-8">
            Cómo funciona
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {featureCards.map(({ title, description }) => (
              <div
                key={title}
                className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg p-6"
              >
                <h2
                  className="text-lg font-bold text-[#1b1c1c] mb-2"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {title}
                </h2>
                <p className="text-sm text-[#4c4546] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="px-6 md:px-16 py-6 border-t border-[#cfc4c5]">
        <p className="text-xs text-[#7e7576] text-center">
          Universidad Prisma — uso interno
        </p>
      </footer>

    </div>
  )
}
