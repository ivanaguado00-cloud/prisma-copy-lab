import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, Clock, GraduationCap } from 'lucide-react'
import { buttonVariants } from '../../../../../components/ui/button'
import { getPublicProgramDetail } from '../../../../../services/publicCatalogService'

interface ProgramPublicDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProgramPublicDetailPageProps) {
  const { id } = await params
  const program = await getPublicProgramDetail(id)
  if (!program) return { title: 'Programa no encontrado — Universidad Prisma' }

  return {
    title: `${program.name} — Universidad Prisma`,
    description: program.valueProposition,
  }
}

export default async function ProgramPublicDetailPage({ params }: ProgramPublicDetailPageProps) {
  const { id } = await params
  const program = await getPublicProgramDetail(id)
  if (!program) notFound()

  return (
    <main className="bg-surface-bright">
      <section className="px-6 py-8 md:px-16">
        <div className="mx-auto max-w-[1280px]">
          <Link href="/universidad-prisma#titulos" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver al catálogo
          </Link>
        </div>
      </section>

      <section className="px-6 pb-14 md:px-16 md:pb-20">
        <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-outline">{program.school}</p>
            <h1
              className="mt-3 max-w-4xl text-4xl font-bold leading-tight text-on-surface md:text-6xl"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {program.name}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-on-surface-variant">
              {program.valueProposition}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={program.enrollmentUrl} className={buttonVariants({ size: 'lg', className: 'h-11 px-4' })}>
                Solicitar admisión
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/universidad-prisma#titulos" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'h-11 px-4' })}>
                Comparar títulos
              </Link>
            </div>
          </div>

          <aside className="border border-outline-variant bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-outline">Ficha rápida</h2>
            <dl className="mt-5 space-y-4">
              <ProgramFact icon={GraduationCap} label="Tipo" value={program.programType} />
              <ProgramFact icon={Clock} label="Duración" value={program.duration ?? 'Flexible'} />
              <ProgramFact icon={CalendarDays} label="Convocatoria" value={program.convocationStart ?? 'Próxima apertura'} />
              <ProgramFact icon={BriefcaseBusiness} label="Mercado" value={program.market} />
            </dl>
          </aside>
        </div>
      </section>

      <section className="border-y border-outline-variant bg-white px-6 py-14 md:px-16">
        <div className="mx-auto grid max-w-[1280px] gap-8 md:grid-cols-3">
          <ContentBlock title="Metodología online">
            Formación flexible, acompañamiento académico y trabajo aplicado para avanzar sin pausar tu actividad profesional.
          </ContentBlock>
          <ContentBlock title="Perfil recomendado">
            {program.targetProfile ?? 'Personas que buscan una formación online práctica para progresar en su área profesional.'}
          </ContentBlock>
          <ContentBlock title="Salidas profesionales">
            {program.careerOutcomes ?? 'Roles especializados vinculados al área del programa y a nuevas oportunidades de crecimiento.'}
          </ContentBlock>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-14 md:px-16">
        <div className="mx-auto grid max-w-[1280px] gap-8 md:grid-cols-2">
          <ContentBlock title="Qué trabajarás">
            {program.mainFocuses ?? 'Competencias técnicas, visión estratégica y proyectos orientados a casos reales.'}
          </ContentBlock>
          <ContentBlock title="Por qué elegirlo">
            {program.mainCommercialArgs ?? 'Una propuesta académica online, práctica y conectada a necesidades reales del mercado.'}
          </ContentBlock>
        </div>
      </section>
    </main>
  )
}

interface ProgramFactProps {
  icon: typeof GraduationCap
  label: string
  value: string
}

function ProgramFact({ icon: Icon, label, value }: ProgramFactProps) {
  return (
    <div className="flex gap-3 border-b border-outline-variant pb-4 last:border-b-0 last:pb-0">
      <Icon className="mt-0.5 size-4 text-outline" aria-hidden="true" />
      <div>
        <dt className="text-xs text-outline">{label}</dt>
        <dd className="mt-1 text-sm font-medium leading-6 text-on-surface">{value}</dd>
      </div>
    </div>
  )
}

function ContentBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article>
      <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: 'var(--font-heading)' }}>
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-on-surface-variant">{children}</p>
    </article>
  )
}
