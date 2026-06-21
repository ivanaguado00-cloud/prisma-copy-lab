import Link from 'next/link'
import { ArrowRight, BookOpen, BriefcaseBusiness, GraduationCap, MonitorCheck } from 'lucide-react'
import { PublicProgramExplorer } from '../../../components/public/PublicProgramExplorer'
import { buttonVariants } from '../../../components/ui/button'
import { listPublicPrograms } from '../../../services/publicCatalogService'

export const metadata = {
  title: 'Universidad Prisma — Titulaciones online',
  description: 'Universidad digital, práctica y flexible conectada al mercado laboral.',
}

const valueProps = [
  {
    title: 'Online y flexible',
    description: 'Aprende con una metodología diseñada para compaginar estudio, trabajo y vida personal.',
    icon: MonitorCheck,
  },
  {
    title: 'Aplicación práctica',
    description: 'Programas orientados a proyectos, casos reales y competencias útiles desde el primer módulo.',
    icon: BookOpen,
  },
  {
    title: 'Conexión laboral',
    description: 'Titulaciones pensadas para perfiles demandados en tecnología, diseño, software, industria y sostenibilidad.',
    icon: BriefcaseBusiness,
  },
]

const facultyLinks = [
  'Tecnología e Innovación',
  'Software',
  'Diseño',
  'Industria e Ingeniería',
  'Ambientales y Sostenibilidad',
]

export default async function UniversidadPrismaPage() {
  const programs = await listPublicPrograms()

  return (
    <main className="flex flex-col">
      <section className="bg-surface-bright px-6 py-8 md:px-16">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
          <Link href="/universidad-prisma" className="text-lg font-bold text-on-surface" style={{ fontFamily: 'var(--font-heading)' }}>
            Universidad Prisma
          </Link>
          <Link href="/" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Prisma Copilab
          </Link>
        </div>
      </section>

      <section className="bg-surface-bright px-6 pb-14 pt-8 md:px-16 md:pb-20">
        <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 border border-outline-variant bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              Universidad digital
            </p>
            <h1
              className="mt-6 text-5xl font-bold leading-[1.04] text-on-surface sm:text-6xl md:text-7xl"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Universidad Prisma
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-on-surface-variant">
              Titulaciones online para avanzar con criterio: formación práctica, flexible y conectada a los perfiles que demanda el mercado.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#titulos" className={buttonVariants({ size: 'lg', className: 'h-11 px-4' })}>
                Encuentra tu título
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/universidad-prisma/solicita-informacion" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'h-11 px-4' })}>
                Solicita información
              </Link>
            </div>
          </div>

          <div className="border border-outline-variant bg-white p-5">
            <div className="flex items-center gap-3 border-b border-outline-variant pb-5">
              <div className="flex size-11 items-center justify-center bg-on-surface text-white">
                <GraduationCap className="size-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-3xl font-bold text-on-surface">{programs.length}</p>
                <p className="text-sm text-on-surface-variant">títulos activos en el catálogo</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {facultyLinks.map((faculty) => (
                <a
                  key={faculty}
                  href="#titulos"
                  className="border border-outline-variant px-3 py-3 font-medium text-on-surface transition-colors hover:border-on-surface hover:bg-surface-container-low"
                >
                  {faculty}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-outline-variant bg-white px-6 py-10 md:px-16">
        <div className="mx-auto grid max-w-[1280px] gap-5 md:grid-cols-3">
          {valueProps.map(({ title, description, icon: Icon }) => (
            <article key={title} className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center bg-surface-container text-on-surface">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-semibold text-on-surface">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <PublicProgramExplorer programs={programs} />

      <section className="bg-on-surface px-6 py-14 text-white md:px-16">
        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-white">Admisiones</p>
            <h2 className="mt-2 text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              Da el siguiente paso con orientación personalizada.
            </h2>
          </div>
          <Link href="/universidad-prisma/solicita-informacion" className={buttonVariants({ variant: 'secondary', size: 'lg', className: 'h-11 px-4' })}>
            Solicitar admisión
          </Link>
        </div>
      </section>

      <footer className="bg-surface-bright px-6 py-8 md:px-16">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 text-sm text-on-surface-variant md:flex-row md:items-center md:justify-between">
          <p>Universidad Prisma</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="hover:text-on-surface">Prisma Copilab</Link>
            <Link href="/universidad-prisma/solicita-informacion" className="hover:text-on-surface">Contacto</Link>
            <span>Información legal</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
