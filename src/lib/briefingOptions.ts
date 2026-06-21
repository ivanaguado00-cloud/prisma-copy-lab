// ── Jerarquía de programas: Facultad → Vertical → Programa ───────────────────

export interface Program {
  id: string
  name: string
}

export interface Vertical {
  id: string
  name: string
  programs: Program[]
  audienceHint: string
}

export interface Faculty {
  id: string
  name: string
  verticals: Vertical[]
  audienceBase: string
}

export const FACULTIES: Faculty[] = [
  {
    id: 'tech',
    name: 'Tecnología e Innovación',
    audienceBase: 'Profesionales y titulados del ámbito tecnológico, con perfil técnico o mixto, que buscan especialización o actualización en entornos digitales.',
    verticals: [
      {
        id: 'tech-dev',
        name: 'Desarrollo de Software',
        audienceHint: 'Desarrolladores y programadores con experiencia en código que buscan avanzar en arquitectura, frameworks modernos o desarrollo full stack.',
        programs: [
          { id: 'grado-informatica', name: 'Grado en Ingeniería Informática' },
          { id: 'master-fullstack', name: 'Máster en Desarrollo Web Full Stack' },
          { id: 'master-arquitectura', name: 'Máster en Arquitectura de Software' },
        ],
      },
      {
        id: 'tech-data',
        name: 'Datos e Inteligencia Artificial',
        audienceHint: 'Ingenieros y analistas interesados en machine learning, IA aplicada y analítica avanzada de datos para entornos empresariales.',
        programs: [
          { id: 'master-datascience', name: 'Máster en Ciencia de Datos' },
          { id: 'master-ia', name: 'Máster en Inteligencia Artificial Aplicada' },
          { id: 'master-ml', name: 'Máster en Machine Learning e IA' },
        ],
      },
      {
        id: 'tech-cyber',
        name: 'Ciberseguridad',
        audienceHint: 'Técnicos y administradores de sistemas que quieren especializarse en seguridad ofensiva, defensiva o en la nube.',
        programs: [
          { id: 'master-ciberseguridad', name: 'Máster en Ciberseguridad' },
          { id: 'master-cloud-security', name: 'Máster en Seguridad en la Nube' },
        ],
      },
      {
        id: 'tech-design',
        name: 'Diseño y Producto Digital',
        audienceHint: 'Diseñadores y product managers que quieren dominar metodologías de UX/UI y llevar productos digitales de la idea al mercado.',
        programs: [
          { id: 'master-uxui', name: 'Máster en Diseño UX/UI' },
          { id: 'master-producto', name: 'Máster en Diseño de Producto Digital' },
        ],
      },
    ],
  },
  {
    id: 'business',
    name: 'Empresa y Management',
    audienceBase: 'Profesionales con experiencia laboral que buscan dar un salto directivo, mejorar sus habilidades de gestión o especializarse en áreas de negocio clave.',
    verticals: [
      {
        id: 'business-direction',
        name: 'Dirección y Estrategia',
        audienceHint: 'Profesionales de 28 a 45 años con al menos 3 años de experiencia que aspiran a roles de dirección y quieren una visión global del negocio.',
        programs: [
          { id: 'mba', name: 'MBA' },
          { id: 'master-direccion', name: 'Máster en Dirección General' },
          { id: 'master-innovacion', name: 'Máster en Innovación y Transformación Empresarial' },
        ],
      },
      {
        id: 'business-marketing',
        name: 'Marketing y Comercial',
        audienceHint: 'Profesionales de marketing, comunicación y ventas que quieren especializarse en entornos digitales y estrategias de crecimiento.',
        programs: [
          { id: 'master-marketing', name: 'Máster en Marketing Digital' },
          { id: 'master-growth', name: 'Máster en Growth y Performance Marketing' },
          { id: 'master-ecommerce', name: 'Máster en Comercio Electrónico' },
        ],
      },
      {
        id: 'business-finance',
        name: 'Finanzas y Analítica',
        audienceHint: 'Economistas, financieros y analistas de negocio que buscan profundizar en finanzas corporativas, controlling o analítica avanzada.',
        programs: [
          { id: 'master-finanzas', name: 'Máster en Finanzas Corporativas' },
          { id: 'master-analitica', name: 'Máster en Analítica de Negocio' },
          { id: 'master-contabilidad', name: 'Máster en Contabilidad y Auditoría' },
        ],
      },
      {
        id: 'business-people',
        name: 'Personas y Organización',
        audienceHint: 'Responsables de RRHH, talent managers y líderes de equipo que quieren transformar la gestión del talento y la cultura organizacional.',
        programs: [
          { id: 'master-rrhh', name: 'Máster en Dirección de RRHH' },
          { id: 'master-talento', name: 'Máster en Talento y Cultura Organizacional' },
        ],
      },
    ],
  },
  {
    id: 'health',
    name: 'Salud y Bienestar',
    audienceBase: 'Profesionales del sector sanitario, de la salud pública o el bienestar que buscan especialización en gestión, nutrición o psicología aplicada.',
    verticals: [
      {
        id: 'health-management',
        name: 'Gestión Sanitaria',
        audienceHint: 'Médicos, enfermeros y gestores sanitarios que quieren asumir roles de dirección en centros de salud, hospitales o administración sanitaria.',
        programs: [
          { id: 'master-gestion-sanitaria', name: 'Máster en Gestión Sanitaria' },
          { id: 'master-direccion-salud', name: 'Máster en Dirección de Centros de Salud' },
        ],
      },
      {
        id: 'health-nutrition',
        name: 'Nutrición y Salud',
        audienceHint: 'Graduados en ciencias de la salud, dietistas y profesionales del deporte interesados en nutrición clínica, deportiva o salud pública.',
        programs: [
          { id: 'master-nutricion', name: 'Máster en Nutrición y Salud Pública' },
          { id: 'master-nutricion-deportiva', name: 'Máster en Nutrición Deportiva' },
        ],
      },
      {
        id: 'health-psychology',
        name: 'Psicología Aplicada',
        audienceHint: 'Psicólogos y profesionales del bienestar que quieren especializarse en entornos clínicos digitales o psicología organizacional.',
        programs: [
          { id: 'master-psicologia-clinica', name: 'Máster en Psicología Clínica Digital' },
          { id: 'master-psicologia-trabajo', name: 'Máster en Psicología del Trabajo' },
        ],
      },
    ],
  },
  {
    id: 'education',
    name: 'Educación',
    audienceBase: 'Docentes en activo, graduados en educación y profesionales de la formación que quieren actualizar su práctica pedagógica o liderar proyectos de innovación educativa.',
    verticals: [
      {
        id: 'edu-teaching',
        name: 'Formación Docente',
        audienceHint: 'Profesores de enseñanza secundaria, bachillerato o FP que necesitan la habilitación pedagógica o quieren mejorar su práctica orientadora.',
        programs: [
          { id: 'master-profesorado', name: 'Máster en Formación del Profesorado' },
          { id: 'master-orientacion', name: 'Máster en Orientación Educativa' },
        ],
      },
      {
        id: 'edu-innovation',
        name: 'Innovación y Tecnología Educativa',
        audienceHint: 'Docentes y coordinadores TIC que quieren liderar proyectos de innovación, diseñar entornos de aprendizaje digital o gestionar plataformas e-learning.',
        programs: [
          { id: 'master-innovacion-edu', name: 'Máster en Innovación Educativa' },
          { id: 'master-tecnologia-edu', name: 'Máster en Tecnología Educativa' },
          { id: 'master-elearning', name: 'Máster en eLearning y Formación Online' },
        ],
      },
    ],
  },
  {
    id: 'law',
    name: 'Derecho y Ciencias Sociales',
    audienceBase: 'Juristas, comunicadores y profesionales de las ciencias sociales que buscan especialización en áreas regulatorias, comunicación estratégica o relaciones internacionales.',
    verticals: [
      {
        id: 'law-legal',
        name: 'Derecho y Cumplimiento',
        audienceHint: 'Abogados, asesores jurídicos y responsables de cumplimiento que quieren especializarse en compliance, regulación digital o derecho tecnológico.',
        programs: [
          { id: 'grado-derecho', name: 'Grado en Derecho' },
          { id: 'master-compliance', name: 'Máster en Compliance y Regulación' },
          { id: 'master-derecho-digital', name: 'Máster en Derecho Digital' },
        ],
      },
      {
        id: 'law-comms',
        name: 'Comunicación y Relaciones',
        audienceHint: 'Comunicadores, periodistas y relacionistas públicos que quieren gestionar la reputación corporativa o liderar estrategias de comunicación y relaciones internacionales.',
        programs: [
          { id: 'master-comunicacion', name: 'Máster en Comunicación Corporativa' },
          { id: 'master-rrpp', name: 'Máster en Relaciones Públicas y Reputación' },
          { id: 'master-rrll', name: 'Máster en Relaciones Internacionales' },
        ],
      },
    ],
  },
]

// ── Helpers de selección ──────────────────────────────────────────────────────

export function getFacultyById(id: string): Faculty | undefined {
  return FACULTIES.find((f) => f.id === id)
}

export function getVerticalById(id: string): Vertical | undefined {
  for (const f of FACULTIES) {
    const v = f.verticals.find((v) => v.id === id)
    if (v) return v
  }
}

export function getProgramById(id: string): Program | undefined {
  for (const f of FACULTIES) {
    for (const v of f.verticals) {
      const p = v.programs.find((p) => p.id === id)
      if (p) return p
    }
  }
}

export type SelectionItem =
  | { type: 'faculty'; id: string }
  | { type: 'vertical'; id: string }
  | { type: 'program'; id: string }

export function selectionToLabel(item: SelectionItem): string {
  if (item.type === 'faculty') {
    const f = getFacultyById(item.id)
    return f ? `Facultad de ${f.name}` : item.id
  }
  if (item.type === 'vertical') {
    const v = getVerticalById(item.id)
    return v ? v.name : item.id
  }
  const p = getProgramById(item.id)
  return p ? p.name : item.id
}

export function deriveAudience(selection: SelectionItem[]): string {
  if (selection.length === 0) return ''

  const facultyIds = new Set(selection.filter((s) => s.type === 'faculty').map((s) => s.id))
  const verticalIds = new Set(selection.filter((s) => s.type === 'vertical').map((s) => s.id))
  const programIds = new Set(selection.filter((s) => s.type === 'program').map((s) => s.id))

  const hints: string[] = []

  // Full faculties selected
  for (const fid of facultyIds) {
    const f = getFacultyById(fid)
    if (f) hints.push(f.audienceBase)
  }

  // Verticals selected (only if faculty not already included)
  for (const vid of verticalIds) {
    const v = getVerticalById(vid)
    if (!v) continue
    const parentFaculty = FACULTIES.find((f) => f.verticals.some((vv) => vv.id === vid))
    if (parentFaculty && facultyIds.has(parentFaculty.id)) continue
    hints.push(v.audienceHint)
  }

  // Individual programs (only if vertical and faculty not already included)
  for (const pid of programIds) {
    let parentVertical: Vertical | undefined
    let parentFaculty: Faculty | undefined
    for (const f of FACULTIES) {
      for (const v of f.verticals) {
        if (v.programs.some((p) => p.id === pid)) {
          parentVertical = v
          parentFaculty = f
          break
        }
      }
      if (parentFaculty) break
    }
    if (!parentFaculty || !parentVertical) continue
    if (facultyIds.has(parentFaculty.id)) continue
    if (verticalIds.has(parentVertical.id)) continue
    hints.push(parentVertical.audienceHint)
  }

  // Deduplicate
  const unique = [...new Set(hints)]
  return unique.join(' ')
}

export function selectionToText(selection: SelectionItem[]): string {
  return selection.map(selectionToLabel).join(', ')
}

// ── Opciones de formulario ────────────────────────────────────────────────────

export const OBJECTIVES = [
  'Captación de nuevos leads',
  'Reactivación de interés',
  'Conversión a matrícula',
  'Seguimiento de interés previo',
  'Nutrición de lead (lead nurturing)',
  'Cierre de matrícula',
  'Fidelización y upsell',
] as const
export type Objective = (typeof OBJECTIVES)[number]

export const PALANCAS = [
  'Empleabilidad y salidas profesionales',
  'Flexibilidad horaria y compatibilidad con trabajo',
  'Red de alumni consolidada',
  'Metodología práctica y aplicada',
  'Reconocimiento oficial y acreditación',
  'Internacionalización',
  'Prácticas garantizadas en empresa',
  'Cuerpo docente con experiencia real',
  'Formación 100% online',
  'Bolsa de empleo activa',
] as const
export type Palanca = (typeof PALANCAS)[number]

export const NEWSLETTER_SECTORS = [
  'Tecnología e Innovación Digital',
  'Inteligencia Artificial y Automatización',
  'Transformación Digital de Empresas',
  'Mercado Laboral y Empleo',
  'Educación y Formación Continua',
  'Marketing, Ventas y Comunicación',
  'Finanzas, Economía y Mercados',
  'Salud Digital y Bienestar',
  'Sostenibilidad y ESG',
  'Regulación, Compliance y Derecho Digital',
] as const
export type NewsletterSector = (typeof NEWSLETTER_SECTORS)[number]

export const EDITORIAL_ANGLES = [
  'Tendencias del sector',
  'Dato o estadística reveladora',
  'Caso de éxito o ejemplo real',
  'Reto o problema emergente del sector',
  'Normativa o regulación reciente',
  'Innovación o tecnología emergente',
  'Perspectiva del mercado laboral',
  'Opinión o posición de la universidad',
] as const
export type EditorialAngle = (typeof EDITORIAL_ANGLES)[number]

export const OFFER_TYPES = [
  'Descuento en matrícula',
  'Beca parcial',
  'Financiación sin intereses',
  'Precio especial por tiempo limitado',
  'Descuento para alumni',
  'Beca de excelencia académica',
  'Pago fraccionado sin coste adicional',
] as const
export type OfferType = (typeof OFFER_TYPES)[number]

export const TONES = [
  'Cercano y conversacional',
  'Profesional y directo',
  'Aspiracional e inspirador',
  'Urgente y persuasivo',
  'Informativo y claro',
] as const
export type Tone = (typeof TONES)[number]

export const EMAIL_VARIANTS: Record<string, readonly string[]> = {
  standard:   ['A — Titular + cuerpo + CTA', 'B — Pregunta de apertura', 'C — Lista de puntos clave'],
  palancas:   ['A — Palanca única desarrollada', 'B — Triple palanca', 'C — Testimonio o prueba social'],
  descuentos: ['A — Oferta directa', 'B — Urgencia de plazo', 'C — Comparativa de ahorro'],
  reminder:   ['A — Aviso directo', 'B — Secuencia de pasos', 'C — Reactivación personal'],
  newsletter: ['A — Noticia principal + 2 breves', 'B — Resumen de tendencias', 'C — Noticia + opinión de la universidad'],
}

export const PREDEFINED_CTAS = [
  'Solicita información sin compromiso',
  'Descubre el programa',
  '¿Te gustaría recibir más información?',
  '¿Quieres que revisemos si encaja contigo?',
  '¿Te interesa conocer el plan de estudios?',
  'Consulta aquí los detalles',
  'Reserva tu plaza ahora',
  'Aprovecha la oferta antes de que expire',
] as const

export const CTA_CUSTOM_SENTINEL = '__otro__'

// ── Formato de programas para prompts LLM ────────────────────────────────────

/**
 * Convierte la cadena `programOrTitulation` (puede ser un nombre único, una
 * lista separada por comas de nombres de programas, verticales o facultades)
 * en un texto optimizado para incluir en el prompt de generación.
 *
 * Regla de agrupación:
 * - 0 ítems  → "no especificado"
 * - 1-3 ítems → lista directa en lenguaje natural ("X, Y y Z")
 * - >3 ítems → intenta agrupar por vertical única o facultad única;
 *              si no es posible, lista igualmente.
 */
export function formatProgramsForPrompt(
  programOrTitulation: string | null | undefined
): string {
  if (!programOrTitulation?.trim()) return 'no especificado'

  const items = programOrTitulation
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (items.length === 0) return 'no especificado'

  // Para ≤3 ítems: lista en lenguaje natural
  if (items.length <= 3) {
    if (items.length === 1) return items[0]!
    if (items.length === 2) return `${items[0]} y ${items[1]}`
    return `${items[0]}, ${items[1]} y ${items[2]}`
  }

  // Para >3 ítems: busca el grupo padre (vertical o facultad) más representativo
  const verticalHits = new Map<string, string>()   // verticalId → verticalName
  const facultyHits  = new Map<string, string>()   // facultyId  → facultyName

  for (const item of items) {
    // ¿Es una facultad completa? (label: "Facultad de X" o nombre exacto de facultad)
    const matchedFaculty = FACULTIES.find(
      (f) => item === f.name || item === `Facultad de ${f.name}`
    )
    if (matchedFaculty) {
      facultyHits.set(matchedFaculty.id, matchedFaculty.name)
      continue
    }

    // ¿Es una vertical?
    let found = false
    for (const faculty of FACULTIES) {
      const vertical = faculty.verticals.find((v) => v.name === item)
      if (vertical) {
        verticalHits.set(vertical.id, vertical.name)
        facultyHits.set(faculty.id, faculty.name)
        found = true
        break
      }
    }
    if (found) continue

    // ¿Es un programa individual?
    for (const faculty of FACULTIES) {
      for (const vertical of faculty.verticals) {
        if (vertical.programs.some((p) => p.name === item)) {
          verticalHits.set(vertical.id, vertical.name)
          facultyHits.set(faculty.id, faculty.name)
          found = true
          break
        }
      }
      if (found) break
    }
  }

  // Todos los ítems pertenecen a una única vertical
  if (verticalHits.size === 1) {
    const verticalName = [...verticalHits.values()][0]
    if (verticalName) return `programas del área de ${verticalName}`
  }

  // Todos los ítems pertenecen a una única facultad
  if (facultyHits.size === 1) {
    const facultyName = [...facultyHits.values()][0]
    if (facultyName) return `formaciones de la Facultad de ${facultyName}`
  }

  // Sin agrupación posible: lista completa
  return items.join(', ')
}

// Legacy — mantenido por compatibilidad con WhatsApp form
export interface ProgramGroup {
  school: string
  programs: string[]
}

export const PROGRAM_GROUPS: ProgramGroup[] = FACULTIES.map((f) => ({
  school: f.name,
  programs: f.verticals.flatMap((v) => v.programs.map((p) => p.name)),
}))
