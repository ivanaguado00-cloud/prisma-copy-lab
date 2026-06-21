import { getActiveProgramById, listActivePrograms } from '../dao/programDao'

export interface PublicProgramSummary {
  id: string
  name: string
  school: string
  programType: string
  market: string
  modality: string
  duration: string | null
  credits: number | null
  valueProposition: string
  careerOutcomes: string | null
}

export interface PublicProgramDetail extends PublicProgramSummary {
  targetProfile: string | null
  mainFocuses: string | null
  mainCommercialArgs: string | null
  convocationStart: string | null
  enrollmentUrl: string
}

const DEFAULT_MARKETS = 'Europa, Colombia, Ecuador y Perú'
const DEFAULT_VALUE_PROPOSITION =
  'Programa online de Universidad Prisma orientado a desarrollar competencias aplicables desde el primer módulo.'

export async function listPublicPrograms(): Promise<PublicProgramSummary[]> {
  const programs = await listActivePrograms()
  if (programs.length === 0) return FALLBACK_PUBLIC_PROGRAMS
  return programs.map(mapPublicProgramSummary)
}

export async function getPublicProgramDetail(id: string): Promise<PublicProgramDetail | null> {
  const program = await getActiveProgramById(id)
  if (!program) return FALLBACK_PUBLIC_PROGRAM_DETAILS.find((fallbackProgram) => fallbackProgram.id === id) ?? null

  return {
    ...mapPublicProgramSummary(program),
    targetProfile: program.targetProfile,
    mainFocuses: program.mainFocuses,
    mainCommercialArgs: program.mainCommercialArgs,
    convocationStart: program.convocationStart,
    enrollmentUrl: buildEnrollmentUrl(program.name),
  }
}

function mapPublicProgramSummary(program: Awaited<ReturnType<typeof listActivePrograms>>[number]): PublicProgramSummary {
  return {
    id: program.id,
    name: program.name,
    school: program.school,
    programType: inferProgramType(program.name),
    market: DEFAULT_MARKETS,
    modality: program.modality ?? 'Online',
    duration: program.duration,
    credits: program.credits,
    valueProposition: program.valueProposition ?? DEFAULT_VALUE_PROPOSITION,
    careerOutcomes: program.careerOutcomes,
  }
}

function inferProgramType(programName: string): string {
  const normalizedName = programName.toLocaleLowerCase('es-ES')
  if (normalizedName.startsWith('grado')) return 'Grado'
  if (normalizedName.startsWith('máster universitario')) return 'Máster universitario'
  if (normalizedName.startsWith('master universitario')) return 'Máster universitario'
  if (normalizedName.startsWith('máster')) return 'Máster'
  if (normalizedName.startsWith('master')) return 'Máster'
  return 'Título propio'
}

function buildEnrollmentUrl(programName: string): string {
  const slug = programName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `/universidad-prisma/solicita-informacion?programa=${encodeURIComponent(slug)}`
}

const FALLBACK_PROGRAM_NAMES_BY_SCHOOL: Record<string, string[]> = {
  Tecnología: [
    'Grado en Ingeniería Informática',
    'Grado en Ciencia de Datos',
    'Grado en Inteligencia Artificial',
    'Máster en Ciencia de Datos',
    'Máster en Inteligencia Artificial Aplicada',
    'Máster en Machine Learning e IA',
    'Máster en Visual Analytics y Big Data',
    'Máster en Ciberseguridad',
    'Máster en Seguridad en la Nube',
    'Máster en Cloud Computing',
    'Máster en Blockchain y Web3',
    'Máster en Robótica Aplicada',
    'Máster en Internet of Things',
    'Máster en Transformación Digital',
    'Máster en Tecnología Educativa',
    'Máster en Sistemas de Información',
    'Máster en Gobierno del Dato',
    'Máster en Inteligencia Artificial para Marketing',
    'Máster en Inteligencia Artificial para Finanzas',
    'Título propio en Automatización con IA',
    'Título propio en Analítica Predictiva',
    'Título propio en Productividad Digital',
    'Título propio en Innovación Tecnológica',
  ],
  Diseño: [
    'Grado en Diseño Digital',
    'Grado en Diseño Multimedia',
    'Máster en Diseño UX/UI',
    'Máster en Diseño de Producto Digital',
    'Máster en Investigación de Usuarios',
    'Máster en Service Design',
    'Máster en Diseño Estratégico',
    'Máster en Dirección Creativa Digital',
    'Máster en Branding y Sistemas Visuales',
    'Máster en Diseño Editorial Digital',
    'Máster en Motion Graphics',
    'Máster en Diseño de Interfaces Conversacionales',
    'Máster en Accesibilidad Digital',
    'Máster en Diseño de Experiencias Inmersivas',
    'Título propio en Figma Avanzado',
    'Título propio en Portfolio UX',
    'Título propio en Prototipado Digital',
    'Título propio en Design Systems',
  ],
  Software: [
    'Grado en Desarrollo de Software',
    'Máster en Desarrollo Web Full Stack',
    'Máster en Desarrollo de Software y Sistemas',
    'Máster en Arquitectura de Software',
    'Máster en Ingeniería DevOps',
    'Máster en Desarrollo Frontend Avanzado',
    'Máster en Desarrollo Backend y APIs',
    'Máster en Apps Móviles',
    'Máster en QA y Automatización de Testing',
    'Máster en Plataformas SaaS',
    'Título propio en React y Next.js',
    'Título propio en APIs con TypeScript',
  ],
  Ambientales: [
    'Grado en Ciencias Ambientales',
    'Máster en Gestión Ambiental',
    'Máster en Energías Renovables',
    'Máster en Economía Circular',
    'Máster en Sostenibilidad Corporativa',
    'Máster en Gestión del Agua',
    'Máster en Cambio Climático',
    'Título propio en ESG y Reporting',
    'Título propio en Huella de Carbono',
  ],
  Industria: [
    'Grado en Ingeniería en Organización Industrial',
    'Grado en Ingeniería en Diseño Industrial y Desarrollo de Producto',
    'Grado en Ingeniería Electrónica Industrial y Automática',
    'Máster Universitario en Dirección Logística',
    'Máster Universitario en Industria 4.0',
    'Máster Universitario en Diseño Industrial y Desarrollo de Producto',
    'Máster en Supply Chain Management',
    'Máster en Lean Manufacturing',
  ],
}

const FALLBACK_PUBLIC_PROGRAM_DETAILS: PublicProgramDetail[] = Object.entries(FALLBACK_PROGRAM_NAMES_BY_SCHOOL).flatMap(
  ([school, names]) =>
    names.map((name) => {
      const programType = inferProgramType(name)
      return {
        id: buildFallbackId(name),
        name,
        school,
        programType,
        market: DEFAULT_MARKETS,
        modality: 'Online',
        duration: programType === 'Grado' ? '4 años' : '10-12 meses',
        credits: programType === 'Grado' ? 240 : 60,
        valueProposition: buildFallbackValueProposition(name, school),
        careerOutcomes: buildFallbackCareerOutcomes(school),
        targetProfile: 'Personas que buscan una titulación online práctica, flexible y conectada con oportunidades profesionales reales.',
        mainFocuses: 'Proyecto aplicado, acompañamiento docente, casos reales y competencias digitales transferibles al puesto de trabajo.',
        mainCommercialArgs: 'Metodología online, claustro profesional, orientación a empleabilidad y disponibilidad para Europa, Colombia, Ecuador y Perú.',
        convocationStart: 'Octubre 2026',
        enrollmentUrl: buildEnrollmentUrl(name),
      }
    }),
)

const FALLBACK_PUBLIC_PROGRAMS: PublicProgramSummary[] = FALLBACK_PUBLIC_PROGRAM_DETAILS.map(
  ({
    id,
    name,
    school,
    programType,
    market,
    modality,
    duration,
    credits,
    valueProposition,
    careerOutcomes,
  }) => ({
    id,
    name,
    school,
    programType,
    market,
    modality,
    duration,
    credits,
    valueProposition,
    careerOutcomes,
  }),
)

function buildFallbackId(programName: string): string {
  return `fallback-${buildEnrollmentUrl(programName).split('=').at(1) ?? programName.toLowerCase()}`
}

function buildFallbackValueProposition(programName: string, school: string): string {
  return `${programName} de Universidad Prisma combina metodología online, práctica aplicada y foco profesional dentro del área de ${school}.`
}

function buildFallbackCareerOutcomes(school: string): string {
  const outcomesBySchool: Record<string, string> = {
    Tecnología: 'Especialista tecnológico, consultor digital, responsable de innovación.',
    Diseño: 'Product Designer, UX/UI Designer, Design Lead.',
    Software: 'Software Developer, Tech Lead, Arquitecto de Software.',
    Ambientales: 'Consultor de sostenibilidad, técnico ambiental, responsable ESG.',
    Industria: 'Responsable de operaciones, project manager industrial, consultor de procesos.',
  }

  return outcomesBySchool[school] ?? 'Especialista del área, consultor y responsable de proyectos.'
}
