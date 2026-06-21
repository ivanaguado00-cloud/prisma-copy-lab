import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'
import { buttonVariants } from '../../../../components/ui/button'

export const metadata = {
  title: 'Solicita información — Universidad Prisma',
  description: 'Pide orientación académica sobre las titulaciones online de Universidad Prisma.',
}

export default function RequestInformationPage() {
  return (
    <main className="min-h-screen bg-surface-bright px-6 py-8 md:px-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/universidad-prisma#titulos" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a titulaciones
        </Link>

        <section className="mt-10 border border-outline-variant bg-white p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-outline">Admisiones</p>
          <h1
            className="mt-3 text-4xl font-bold leading-tight text-on-surface md:text-5xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Solicita información
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant">
            Déjanos tus datos y un orientador académico podrá ayudarte a elegir el título, mercado y convocatoria que mejor encajan con tu perfil.
          </p>

          <form className="mt-8 grid gap-5">
            <FormField label="Nombre completo" name="name" placeholder="Tu nombre" />
            <FormField label="Email" name="email" placeholder="tu@email.com" type="email" />
            <FormField label="Teléfono" name="phone" placeholder="+34 600 000 000" type="tel" />
            <FormField label="Programa de interés" name="program" placeholder="Ej. Máster en Inteligencia Artificial Aplicada" />

            <label className="grid gap-2 text-sm font-medium text-on-surface">
              Mensaje
              <textarea
                name="message"
                rows={4}
                placeholder="Cuéntanos qué necesitas saber."
                className="resize-none border border-outline-variant bg-surface-bright px-3 py-2 text-sm font-normal text-on-surface outline-none focus:border-on-surface"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className={buttonVariants({ className: 'h-10 px-4' })}>
                Enviar solicitud
                <Send className="size-4" aria-hidden="true" />
              </button>
              <p className="text-xs leading-5 text-outline">
                Formulario visual V1 preparado para conectar con CRM.
              </p>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

interface FormFieldProps {
  label: string
  name: string
  placeholder: string
  type?: string
}

function FormField({ label, name, placeholder, type = 'text' }: FormFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-on-surface">
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="h-10 border border-outline-variant bg-surface-bright px-3 text-sm font-normal text-on-surface outline-none focus:border-on-surface"
      />
    </label>
  )
}
