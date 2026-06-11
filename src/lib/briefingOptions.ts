export interface ProgramGroup {
  school: string
  programs: string[]
}

export const PROGRAM_GROUPS: ProgramGroup[] = [
  {
    school: 'Escuela de Tecnología e Innovación',
    programs: [
      'Grado en Ingeniería Informática',
      'Máster en Inteligencia Artificial Aplicada',
      'Máster en Ciencia de Datos',
      'Máster en Ciberseguridad',
      'Máster en Diseño de Producto Digital',
    ],
  },
  {
    school: 'Escuela de Empresa y Marketing',
    programs: [
      'Grado en Administración y Dirección de Empresas',
      'Máster en Marketing Digital',
      'MBA',
      'Máster en Analítica de Negocio',
      'Máster en Innovación y Transformación Empresarial',
    ],
  },
  {
    school: 'Escuela de Educación',
    programs: [
      'Máster en Formación del Profesorado',
      'Máster en Innovación Educativa',
      'Máster en Tecnología Educativa',
      'Programas de actualización docente',
    ],
  },
  {
    school: 'Escuela de Salud y Bienestar',
    programs: [
      'Máster en Gestión Sanitaria',
      'Máster en Nutrición y Salud Pública',
      'Máster en Psicología aplicada a entornos digitales',
    ],
  },
  {
    school: 'Escuela de Ciencias Sociales y Jurídicas',
    programs: [
      'Grado en Derecho',
      'Máster en Compliance',
      'Máster en Comunicación Corporativa',
      'Máster en Relaciones Internacionales',
    ],
  },
]

export const PREDEFINED_CTAS = [
  '¿Te gustaría recibir más información?',
  '¿Quieres que te comparta los detalles del programa?',
  '¿Te interesa conocer el plan de estudios?',
  'Descubre el programa',
  'Solicita información',
  'Consulta aquí los detalles',
  '¿Quieres que revisemos si encaja contigo?',
] as const

export const CTA_CUSTOM_SENTINEL = '__otro__'
