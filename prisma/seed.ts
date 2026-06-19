import 'dotenv/config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'
import bcrypt from 'bcryptjs'
import {
  CHANNEL,
  MODE,
  OVERALL_VERDICT,
  SCORE_STATUS,
  CRITERION_KEY,
} from '../src/types/domain'

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  // ── Usuarios de prueba ────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'ivan.aguado00@gmail.com' },
    update: { role: 'admin' },
    create: {
      name: 'Admin Prisma',
      email: 'ivan.aguado00@gmail.com',
      passwordHash: await bcrypt.hash('adminprisma', 10),
      role: 'admin',
    },
  })

  await prisma.user.upsert({
    where: { email: 'redactor@prisma.es' },
    update: { role: 'redactor', passwordHash: await bcrypt.hash('redactorprisma', 10) },
    create: {
      name: 'Redactor Prisma',
      email: 'redactor@prisma.es',
      passwordHash: await bcrypt.hash('redactorprisma', 10),
      role: 'redactor',
    },
  })

  await prisma.user.upsert({
    where: { email: 'coordinador@prisma.es' },
    update: { role: 'coordinador', passwordHash: await bcrypt.hash('coordinadorprisma', 10) },
    create: {
      name: 'Coordinador Prisma',
      email: 'coordinador@prisma.es',
      passwordHash: await bcrypt.hash('coordinadorprisma', 10),
      role: 'coordinador',
    },
  })

  await prisma.user.upsert({
    where: { email: 'pm@prisma.es' },
    update: { role: 'pm', passwordHash: await bcrypt.hash('pmprisma', 10) },
    create: {
      name: 'PM Prisma',
      email: 'pm@prisma.es',
      passwordHash: await bcrypt.hash('pmprisma', 10),
      role: 'pm',
    },
  })

  await prisma.user.upsert({
    where: { email: 'demo@prisma.local' },
    update: {},
    create: {
      name: 'Demo Prisma',
      email: 'demo@prisma.local',
      passwordHash: await bcrypt.hash('demoprisma', 10),
    },
  })

  // ── Catálogo de programas ─────────────────────────────────────────────────
  // Solo inserta si el catálogo está vacío, para no sobreescribir datos manuales.
  const programCount = await prisma.program.count()
  if (programCount === 0) {
    await prisma.program.createMany({
      data: [

        // ── Tecnología e Innovación — Desarrollo de Software ─────────────────
        {
          name:               'Grado en Ingeniería Informática',
          school:             'Tecnología e Innovación',
          officialPrice:      7200,
          modality:           'Online',
          duration:           '4 años',
          credits:            240,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Bachilleres y técnicos con vocación tecnológica que quieren una titulación universitaria oficial en ingeniería del software.',
          careerOutcomes:     'Desarrollador de software, arquitecto de sistemas, analista de datos, CTO.',
          valueProposition:   'Grado oficial con plan de estudios orientado al mercado real y metodologías ágiles desde el primer año.',
          mainCommercialArgs: 'Titulación oficial reconocida. Formación 100% online compatible con trabajo. Bolsa de empleo activa con más de 200 empresas partners.',
        },
        {
          name:               'Máster en Desarrollo Web Full Stack',
          school:             'Tecnología e Innovación',
          officialPrice:      5900,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Desarrolladores y programadores con experiencia en código que buscan avanzar en arquitectura, frameworks modernos o desarrollo full stack.',
          careerOutcomes:     'Full Stack Developer, Tech Lead, Arquitecto Frontend/Backend.',
          valueProposition:   'El máster más práctico del mercado: 80% de proyectos reales con empresas tecnológicas.',
          mainCommercialArgs: 'Proyectos reales con empresas del sector. Claustro 100% profesional en activo. Salida laboral media en menos de 3 meses.',
        },
        {
          name:               'Máster en Desarrollo de Software y Sistemas',
          school:             'Tecnología e Innovación',
          officialPrice:      6200,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Ingenieros informáticos y desarrolladores que quieren especializarse en arquitectura de software, sistemas distribuidos y metodologías DevOps.',
          careerOutcomes:     'Software Engineer Senior, DevOps Engineer, Systems Architect.',
          valueProposition:   'Formación de alto nivel técnico orientada a los perfiles más demandados en el mercado tech.',
          mainCommercialArgs: 'Acceso a laboratorios cloud. Portfolio profesional real. Red de alumni en las principales tecnológicas.',
        },
        {
          name:               'Máster en Arquitectura de Software',
          school:             'Tecnología e Innovación',
          officialPrice:      6400,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Febrero 2027',
          targetProfile:      'Senior developers con experiencia que quieren dar el salto a roles de arquitectura y liderazgo técnico.',
          careerOutcomes:     'Software Architect, CTO, Engineering Manager.',
          valueProposition:   'Transición de desarrollador a arquitecto con mentoría 1:1 de CTOs en activo.',
          mainCommercialArgs: 'Mentoría personalizada con CTOs reales. Casos de arquitectura de empresas Fortune 500. Proyecto final como consultoría para empresa real.',
        },

        // ── Tecnología e Innovación — Datos e Inteligencia Artificial ─────────
        {
          name:               'Máster en Ciencia de Datos',
          school:             'Tecnología e Innovación',
          officialPrice:      6800,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Ingenieros y analistas interesados en machine learning, estadística avanzada y pipelines de datos para entornos empresariales.',
          careerOutcomes:     'Data Scientist, Data Engineer, ML Engineer.',
          valueProposition:   'El único máster en España que garantiza un proyecto con datos reales de empresa desde el primer mes.',
          mainCommercialArgs: 'Python, SQL, Spark y TensorFlow en un único programa. Dataset real de empresa desde el día 1. Inserción laboral del 91%.',
        },
        {
          name:               'Máster en Inteligencia Artificial Aplicada',
          school:             'Tecnología e Innovación',
          officialPrice:      7000,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Ingenieros y analistas interesados en IA aplicada a entornos de negocio: automatización, NLP, visión artificial y sistemas de recomendación.',
          careerOutcomes:     'AI Engineer, Machine Learning Engineer, Head of AI.',
          valueProposition:   'Formación en IA con aplicación directa a casos de negocio reales, no solo teoría académica.',
          mainCommercialArgs: 'Proyecto con empresa real. Acceso a GPUs en la nube. Claustro formado por ingenieros de Google, Amazon y OpenAI.',
          bestChannel:        'Email',
        },
        {
          name:               'Máster en Inteligencia Artificial para Marketing',
          school:             'Tecnología e Innovación',
          officialPrice:      6500,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Profesionales de marketing digital que quieren integrar IA en sus estrategias: automatización, personalización, análisis predictivo y generación de contenido.',
          careerOutcomes:     'Marketing AI Specialist, Growth Hacker, Head of Digital Marketing.',
          valueProposition:   'El puente entre IA y marketing: aprende a usar las herramientas de IA que ya están transformando el marketing digital.',
          mainCommercialArgs: 'Herramientas de IA aplicadas a campañas reales. Automatización de contenido y segmentación. Perfil diferencial en el mercado.',
        },
        {
          name:               'Máster en Inteligencia Artificial para Finanzas',
          school:             'Tecnología e Innovación',
          officialPrice:      6800,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Financieros, economistas y analistas cuantitativos que quieren aplicar IA y machine learning a trading, riesgo, fraude y análisis financiero.',
          careerOutcomes:     'Quantitative Analyst, FinTech Specialist, Risk AI Manager.',
          valueProposition:   'La formación en IA financiera más completa del mercado hispanohablante.',
          mainCommercialArgs: 'Modelos de predicción financiera con Python. Casos reales de fondos de inversión y bancos. Perfil altamente demandado y bien remunerado.',
        },
        {
          name:               'Máster en Visual Analytics y Big Data',
          school:             'Tecnología e Innovación',
          officialPrice:      6800,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Analistas de datos y business intelligence que quieren dominar la visualización avanzada y los ecosistemas de big data.',
          careerOutcomes:     'Data Visualization Expert, BI Manager, Analytics Lead.',
          valueProposition:   'De los datos al insight: formación completa en visualización y storytelling con datos.',
          mainCommercialArgs: 'Tableau, Power BI y D3.js en un solo programa. Proyecto con dataset masivo real. Perfil diferencial en análisis de negocio.',
        },
        {
          name:               'Máster en Machine Learning e IA',
          school:             'Tecnología e Innovación',
          officialPrice:      7200,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Febrero 2027',
          targetProfile:      'Ingenieros de datos y desarrolladores con base matemática que quieren especializarse en modelos de ML, deep learning y sistemas de IA productivos.',
          careerOutcomes:     'ML Engineer, Research Scientist, AI Product Manager.',
          valueProposition:   'Formación de nivel investigador aplicada a problemas reales de producción.',
          mainCommercialArgs: 'Deep learning, NLP y visión artificial en un único programa. Proyecto fin de máster con publicación académica opcional. Red con labs de investigación.',
        },

        // ── Tecnología e Innovación — Ciberseguridad ──────────────────────────
        {
          name:               'Máster en Ciberseguridad',
          school:             'Tecnología e Innovación',
          officialPrice:      6500,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Técnicos y administradores de sistemas que quieren especializarse en seguridad ofensiva, defensiva y gestión de incidentes.',
          careerOutcomes:     'Analista de Ciberseguridad, Pentester, CISO.',
          valueProposition:   'La única formación con laboratorio de hacking ético certificado y simulación de incidentes reales.',
          mainCommercialArgs: 'Certificación CEH incluida. Laboratorio de hacking ético. Demanda de perfiles +40% año a año.',
        },
        {
          name:               'Máster en Seguridad en la Nube',
          school:             'Tecnología e Innovación',
          officialPrice:      6500,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Febrero 2027',
          targetProfile:      'Administradores cloud y arquitectos de sistemas que quieren especializarse en la securización de entornos AWS, Azure y GCP.',
          careerOutcomes:     'Cloud Security Architect, DevSecOps Engineer.',
          valueProposition:   'Formación especializada en la capa de seguridad más demandada por las empresas en la nube.',
          mainCommercialArgs: 'Certificaciones AWS Security y Azure Security incluidas. Prácticas en entornos cloud reales. Perfil con salario medio superior a 55.000€.',
        },

        // ── Tecnología e Innovación — Diseño y Producto Digital ───────────────
        {
          name:               'Máster en Diseño UX/UI',
          school:             'Tecnología e Innovación',
          officialPrice:      5800,
          modality:           'Online',
          duration:           '10 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Diseñadores y product managers que quieren dominar metodologías centradas en el usuario y construir productos digitales de alto impacto.',
          careerOutcomes:     'UX Designer, UI Designer, Product Designer, Design Lead.',
          valueProposition:   'Del boceto al producto: el máster más práctico de diseño de experiencia de usuario del mercado.',
          mainCommercialArgs: 'Portfolio real de 3+ proyectos. Figma, Maze y Hotjar en el plan de estudios. Mentoría con designers de empresas top.',
        },
        {
          name:               'Máster en Diseño de Producto Digital',
          school:             'Tecnología e Innovación',
          officialPrice:      5900,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Febrero 2027',
          targetProfile:      'Diseñadores y product managers que quieren liderar el ciclo completo de un producto digital, de la visión al lanzamiento.',
          careerOutcomes:     'Product Designer, CPO, Head of Product.',
          valueProposition:   'Formación end-to-end en producto digital: estrategia, diseño, métricas y go-to-market.',
          mainCommercialArgs: 'Proyecto de producto real con usuarios reales. Framework de producto propio de Universidad Prisma. Network con PMs de las mejores scale-ups.',
        },

        // ── Empresa y Management — Dirección y Estrategia ─────────────────────
        {
          name:               'MBA',
          school:             'Empresa y Management',
          officialPrice:      9500,
          modality:           'Online',
          duration:           '18 meses',
          credits:            90,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Profesionales con más de 3 años de experiencia que aspiran a roles de dirección y necesitan una visión integral del negocio.',
          careerOutcomes:     'Director General, CEO, COO, Socio de consultoría.',
          valueProposition:   'El MBA que combina visión estratégica con habilidades de liderazgo y emprendimiento digital.',
          mainCommercialArgs: 'Red de alumni de más de 8.000 directivos. Módulo de venture capital y startups. Simuladores de negocio con IA.',
          bestChannel:        'Email',
        },
        {
          name:               'Máster en Dirección General',
          school:             'Empresa y Management',
          officialPrice:      8200,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Managers y directivos de área que quieren dar el salto a la dirección general con visión estratégica completa.',
          careerOutcomes:     'Director General, VP, Country Manager.',
          valueProposition:   'Formación directiva con casos reales de empresas nacionales e internacionales.',
          mainCommercialArgs: 'Claustro de CEOs y directivos en activo. 12 casos de empresa reales. Módulo de habilidades directivas y comunicación.',
        },
        {
          name:               'Máster en Innovación y Transformación Empresarial',
          school:             'Empresa y Management',
          officialPrice:      7500,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Directivos y managers que lideran procesos de cambio y quieren dotarse de metodologías y herramientas de innovación.',
          careerOutcomes:     'Chief Innovation Officer, Director de Transformación Digital, Innovation Manager.',
          valueProposition:   'El único máster con laboratorio de innovación propio y acceso a startups en fase seed.',
          mainCommercialArgs: 'Metodologías Design Thinking, OKRs e innovación disruptiva. Acceso a hub de startups. Proyecto de innovación real con empresa cliente.',
        },

        // ── Empresa y Management — Marketing y Comercial ──────────────────────
        {
          name:               'Máster en Marketing Digital',
          school:             'Empresa y Management',
          officialPrice:      6200,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Profesionales de marketing y comunicación que quieren especializarse en entornos digitales y estrategias de crecimiento online.',
          careerOutcomes:     'Digital Marketing Manager, CMO, Head of Growth.',
          valueProposition:   'Estrategia, datos y creatividad en un solo programa orientado a resultados de negocio reales.',
          mainCommercialArgs: 'Google Ads, Meta Ads y SEO avanzado en el plan de estudios. Proyecto real con presupuesto de campaña. Certificaciones Google y Meta incluidas.',
        },
        {
          name:               'Máster en Growth y Performance Marketing',
          school:             'Empresa y Management',
          officialPrice:      6400,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Febrero 2027',
          targetProfile:      'Marketers y analistas digitales con experiencia que quieren especializarse en growth hacking, CRO y atribución avanzada.',
          careerOutcomes:     'Growth Manager, Performance Lead, Head of Acquisition.',
          valueProposition:   'La formación de growth más orientada a negocio: métricas, experimentos y escalabilidad.',
          mainCommercialArgs: 'Experimentos de growth reales en empresas partner. Frameworks de North Star Metric y AARRR. Perfil con alta demanda en scale-ups.',
        },
        {
          name:               'Máster en Comercio Electrónico',
          school:             'Empresa y Management',
          officialPrice:      5900,
          modality:           'Online',
          duration:           '10 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Empresarios, marketers y operadores de tiendas online que quieren profesionalizar su estrategia de ecommerce.',
          careerOutcomes:     'Ecommerce Manager, Director de Ventas Online, Amazon Specialist.',
          valueProposition:   'Formación integral de ecommerce que cubre desde la estrategia hasta la operativa diaria.',
          mainCommercialArgs: 'Shopify, WooCommerce y Amazon en el plan de estudios. Tienda de práctica real. Red de mentores con tiendas de 7 cifras.',
        },

        // ── Empresa y Management — Finanzas y Analítica ───────────────────────
        {
          name:               'Máster en Finanzas Corporativas',
          school:             'Empresa y Management',
          officialPrice:      7800,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Economistas y financieros que buscan profundizar en finanzas corporativas, M&A, valoración de empresas y mercados de capitales.',
          careerOutcomes:     'CFO, Director Financiero, Analista de M&A, Investment Banker.',
          valueProposition:   'La formación en finanzas más orientada a operaciones corporativas reales del mercado español.',
          mainCommercialArgs: 'CFA Level 1 preparación incluida. Casos reales de M&A. Acceso a base de datos Bloomberg.',
        },
        {
          name:               'Máster en Analítica de Negocio',
          school:             'Empresa y Management',
          officialPrice:      7000,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Analistas de negocio y controllers que quieren tomar decisiones basadas en datos y dominar herramientas de BI.',
          careerOutcomes:     'Business Intelligence Manager, Head of Analytics, Data-Driven Product Manager.',
          valueProposition:   'Del dato a la decisión: formación completa en analítica aplicada a negocio.',
          mainCommercialArgs: 'Power BI y Tableau avanzado. SQL y Python para análisis. Cuadros de mando reales con datos de empresa.',
        },
        {
          name:               'Máster en Contabilidad y Auditoría',
          school:             'Empresa y Management',
          officialPrice:      6500,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Graduados en ADE, Economía o Finanzas que quieren preparar el acceso al ROAC o especializarse en auditoría y control interno.',
          careerOutcomes:     'Auditor, Controller, Responsable de Contabilidad, Socio de Auditoría.',
          valueProposition:   'Preparación oficial para el ROAC con el claustro más experimentado del sector.',
          mainCommercialArgs: 'Preparación al ROAC incluida. Prácticas en Big Four. 100% de alumnos colocados en los últimos 3 años.',
        },

        // ── Empresa y Management — Personas y Organización ────────────────────
        {
          name:               'Máster en Dirección de RRHH',
          school:             'Empresa y Management',
          officialPrice:      6800,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Responsables de RRHH, talent managers y directivos de área que quieren transformar la gestión del talento en sus organizaciones.',
          careerOutcomes:     'HR Director, People Manager, Chief People Officer.',
          valueProposition:   'Formación directiva en RRHH con enfoque en datos, tecnología y bienestar organizacional.',
          mainCommercialArgs: 'HR Analytics integrado. People Tech y IA en RRHH. Proyecto de plan de personas para empresa real.',
        },
        {
          name:               'Máster en Talento y Cultura Organizacional',
          school:             'Empresa y Management',
          officialPrice:      6600,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Febrero 2027',
          targetProfile:      'HR Business Partners y consultores de cultura que quieren especializarse en transformación organizacional y employee experience.',
          careerOutcomes:     'Culture Manager, Organizational Development Consultant, Head of People Experience.',
          valueProposition:   'La única formación especializada en cultura organizacional con metodología propia y casos de empresas referentes.',
          mainCommercialArgs: 'Framework de cultura propio de Universidad Prisma. Casos de Airbnb, Netflix y Spotify. Evaluación de Employee Experience con herramientas reales.',
        },

        // ── Salud y Bienestar ─────────────────────────────────────────────────
        {
          name:               'Máster en Gestión Sanitaria',
          school:             'Salud y Bienestar',
          officialPrice:      6800,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Médicos, enfermeros y gestores sanitarios que quieren asumir roles directivos en centros de salud, hospitales o administración sanitaria.',
          careerOutcomes:     'Gerente Hospitalario, Director Médico, Jefe de Servicio.',
          valueProposition:   'El máster de referencia en gestión sanitaria: combina gestión, liderazgo y digitalización del sistema de salud.',
          mainCommercialArgs: 'Casos de hospitales públicos y privados. Módulo de salud digital e IA médica. Red alumni en el sistema sanitario español.',
        },
        {
          name:               'Máster en Dirección de Centros de Salud',
          school:             'Salud y Bienestar',
          officialPrice:      7200,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Febrero 2027',
          targetProfile:      'Profesionales sanitarios que dirigen o aspiran a dirigir centros, clínicas o unidades de salud.',
          careerOutcomes:     'Director de Clínica, Gerente de Centro, Responsable de Unidad.',
          valueProposition:   'Formación directiva específica para el sector salud con foco en gestión económica y liderazgo clínico.',
          mainCommercialArgs: 'Plan de negocio clínico real. Mentores con dirección de hospitales. Visitas a centros de referencia.',
        },
        {
          name:               'Máster en Nutrición y Salud Pública',
          school:             'Salud y Bienestar',
          officialPrice:      5500,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Graduados en ciencias de la salud, dietistas y profesionales interesados en nutrición clínica y políticas de salud pública.',
          careerOutcomes:     'Nutricionista Clínica, Responsable de Salud Pública, Investigadora en Nutrición.',
          valueProposition:   'Formación en nutrición con base científica y enfoque en aplicación clínica real.',
          mainCommercialArgs: 'Casos clínicos reales. Acceso a consulta de nutrición supervisada. Proyecto de intervención en salud pública.',
        },
        {
          name:               'Máster en Nutrición Deportiva',
          school:             'Salud y Bienestar',
          officialPrice:      5200,
          modality:           'Online',
          duration:           '10 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Dietistas, fisioterapeutas y profesionales del deporte interesados en la nutrición aplicada al rendimiento físico.',
          careerOutcomes:     'Nutricionista Deportivo, Consultor de Alto Rendimiento, Entrenador Personal con especialización en nutrición.',
          valueProposition:   'La formación más completa en nutrición deportiva con aplicación a todos los niveles de rendimiento.',
          mainCommercialArgs: 'Colaboración con clubes deportivos profesionales. Herramientas de evaluación antropométrica. Portfolio de planes nutricionales.',
        },
        {
          name:               'Máster en Psicología Clínica Digital',
          school:             'Salud y Bienestar',
          officialPrice:      6000,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Psicólogos y profesionales del bienestar que quieren especializarse en terapia online y el uso de tecnología en la intervención clínica.',
          careerOutcomes:     'Psicólogo Clínico Digital, Fundador de Clínica Online, Responsable de Salud Mental Corporativa.',
          valueProposition:   'La única formación que combina psicología clínica con herramientas digitales para la consulta online.',
          mainCommercialArgs: 'Plataformas de tele-terapia incluidas. Supervisión de casos reales. Marco legal y ético de la terapia digital.',
        },
        {
          name:               'Máster en Psicología del Trabajo',
          school:             'Salud y Bienestar',
          officialPrice:      5800,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Febrero 2027',
          targetProfile:      'Psicólogos y responsables de bienestar laboral que quieren especializarse en salud mental en organizaciones y gestión del estrés.',
          careerOutcomes:     'Psicólogo Organizacional, Chief Wellness Officer, Coach Ejecutivo.',
          valueProposition:   'Formación en bienestar laboral con aplicación a la realidad organizacional española.',
          mainCommercialArgs: 'Herramientas de evaluación del clima laboral. Casos de programas de bienestar en empresas Fortune 500. Evaluación por competencias.',
        },

        // ── Educación ─────────────────────────────────────────────────────────
        {
          name:               'Máster en Formación del Profesorado',
          school:             'Educación',
          officialPrice:      4800,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Graduados universitarios que quieren habilitar para la enseñanza en educación secundaria, bachillerato o FP.',
          careerOutcomes:     'Profesor de Secundaria, Profesor de Bachillerato, Orientador Educativo.',
          valueProposition:   'Habilitación oficial para la docencia con prácticas reales en centros educativos de referencia.',
          mainCommercialArgs: 'Título oficial habilitante. Prácticas en centros concertados y públicos. Tasa de inserción docente del 87%.',
        },
        {
          name:               'Máster en Orientación Educativa',
          school:             'Educación',
          officialPrice:      5200,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Docentes y orientadores educativos que quieren especializarse en orientación académica, vocacional y atención a la diversidad.',
          careerOutcomes:     'Orientador Escolar, Psicopedagogo, Coordinador de Inclusión.',
          valueProposition:   'Formación especializada en orientación con metodologías de intervención actualizadas.',
          mainCommercialArgs: 'Prácticas en departamentos de orientación reales. Herramientas de evaluación psicopedagógica. Red de orientadores colaboradores.',
        },
        {
          name:               'Máster en Innovación Educativa',
          school:             'Educación',
          officialPrice:      5500,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Docentes y coordinadores que quieren liderar proyectos de innovación pedagógica y transformar sus centros educativos.',
          careerOutcomes:     'Coordinador de Innovación, Director de Centro, Formador de Formadores.',
          valueProposition:   'Metodologías de innovación educativa aplicadas a proyectos de transformación real en centros escolares.',
          mainCommercialArgs: 'Proyecto de innovación real en tu centro. Red de centros innovadores colaboradores. Metodologías Agile aplicadas a la educación.',
        },
        {
          name:               'Máster en Tecnología Educativa',
          school:             'Educación',
          officialPrice:      5400,
          modality:           'Online',
          duration:           '10 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Docentes y coordinadores TIC que quieren diseñar entornos de aprendizaje digital y gestionar plataformas educativas.',
          careerOutcomes:     'Coordinador TIC, eLearning Specialist, Diseñador Instruccional.',
          valueProposition:   'Formación práctica en las tecnologías más usadas en el aula del siglo XXI.',
          mainCommercialArgs: 'Diseño de cursos online reales. Herramientas de gamificación y realidad aumentada. Creación de portfolio educativo digital.',
        },
        {
          name:               'Máster en eLearning y Formación Online',
          school:             'Educación',
          officialPrice:      5200,
          modality:           'Online',
          duration:           '10 meses',
          credits:            60,
          convocationStart:   'Febrero 2027',
          targetProfile:      'Formadores, diseñadores instruccionales y responsables de formación corporativa que quieren diseñar y gestionar programas de formación online.',
          careerOutcomes:     'eLearning Manager, L&D Specialist, Diseñador Instruccional.',
          valueProposition:   'La formación más completa en diseño y gestión de programas eLearning del mercado.',
          mainCommercialArgs: 'Moodle, Canvas y herramientas de autor incluidas. Proyecto de curso real con alumnos reales. Certificación en Learning Design.',
        },

        // ── Derecho y Ciencias Sociales — Derecho y Cumplimiento ──────────────
        {
          name:               'Grado en Derecho',
          school:             'Derecho y Ciencias Sociales',
          officialPrice:      7500,
          modality:           'Online',
          duration:           '4 años',
          credits:            240,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Estudiantes y profesionales interesados en el ejercicio del Derecho, la Administración Pública o el asesoramiento jurídico empresarial.',
          careerOutcomes:     'Abogado, Asesor Jurídico, Notario, Juez (vía oposiciones), Compliance Officer.',
          valueProposition:   'Grado oficial con acceso a prácticas en despachos de referencia y orientación a la abogacía corporativa.',
          mainCommercialArgs: 'Titulación oficial. Acceso a prácticas en despachos de Tier 1. Módulo de derecho digital y compliance desde el primer año.',
        },
        {
          name:               'Máster en Compliance y Regulación',
          school:             'Derecho y Ciencias Sociales',
          officialPrice:      6500,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Abogados, asesores jurídicos y responsables de cumplimiento que quieren especializarse en compliance corporativo y regulación sectorial.',
          careerOutcomes:     'Compliance Officer, Responsable de Cumplimiento, Abogado Regulatorio.',
          valueProposition:   'Formación especializada en compliance con el marco regulatorio más actual: ESG, IA y GDPR.',
          mainCommercialArgs: 'Certificación en Compliance incluida. Casos reales de procedimientos sancionadores. Módulo de compliance en IA y datos.',
        },
        {
          name:               'Máster en Derecho Digital',
          school:             'Derecho y Ciencias Sociales',
          officialPrice:      6200,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Abogados y juristas que quieren especializarse en el marco legal del entorno digital: contratos tech, protección de datos y regulación de IA.',
          careerOutcomes:     'Abogado Tech, DPO (Delegado de Protección de Datos), Legal Tech Specialist.',
          valueProposition:   'La formación jurídica más actualizada en el entorno digital: GDPR, AI Act y contratos tecnológicos.',
          mainCommercialArgs: 'Preparación para el examen de DPO. Casos de litigios tech reales. Network con legal tech startups.',
        },

        // ── Derecho y Ciencias Sociales — Comunicación y Relaciones ──────────
        {
          name:               'Máster en Comunicación Corporativa',
          school:             'Derecho y Ciencias Sociales',
          officialPrice:      5800,
          modality:           'Online',
          duration:           '10 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Comunicadores, periodistas y responsables de comunicación que quieren gestionar la comunicación estratégica de organizaciones.',
          careerOutcomes:     'Director de Comunicación, Dircom, PR Manager.',
          valueProposition:   'Formación integral en comunicación corporativa con énfasis en comunicación de crisis y reputación.',
          mainCommercialArgs: 'Simulacro de comunicación de crisis real. Network con Dircoms de grandes empresas. Proyecto de plan de comunicación completo.',
        },
        {
          name:               'Máster en Relaciones Públicas y Reputación',
          school:             'Derecho y Ciencias Sociales',
          officialPrice:      5600,
          modality:           'Online',
          duration:           '10 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Profesionales de la comunicación y las relaciones públicas que quieren especializarse en gestión de reputación corporativa y stakeholders.',
          careerOutcomes:     'PR Manager, Responsable de RSC, Gestora de Reputación.',
          valueProposition:   'La única formación en España especializada en construcción y defensa de reputación con herramientas de escucha activa.',
          mainCommercialArgs: 'Herramientas de monitorización de reputación. Proyecto real con marca corporativa. Red de profesionales en agencias de comunicación top.',
        },
        {
          name:               'Máster en Relaciones Internacionales',
          school:             'Derecho y Ciencias Sociales',
          officialPrice:      6000,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Politólogos, juristas y profesionales interesados en la geopolítica, la diplomacia y los organismos internacionales.',
          careerOutcomes:     'Analista de Política Internacional, Diplomático, Responsable de Asuntos Internacionales.',
          valueProposition:   'Análisis geopolítico con perspectiva práctica: de la teoría de relaciones internacionales a la realidad del sistema global.',
          mainCommercialArgs: 'Módulo de geopolítica aplicada. Simulaciones de Naciones Unidas. Colaboración con think tanks internacionales.',
        },

        // ── Industria e Ingeniería — Grados ───────────────────────────────────
        {
          name:               'Grado en Ingeniería en Organización Industrial',
          school:             'Industria e Ingeniería',
          officialPrice:      7000,
          modality:           'Online',
          duration:           '4 años',
          credits:            240,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Estudiantes y técnicos industriales que quieren una titulación oficial en gestión y optimización de procesos industriales.',
          careerOutcomes:     'Ingeniero de Organización, Project Manager Industrial, Responsable de Operaciones.',
          valueProposition:   'Grado oficial orientado a la industria manufacturera y los entornos de producción modernos.',
          mainCommercialArgs: 'Titulación oficial reconocida. Prácticas en empresa industrial garantizadas. Doble competencia técnica y de gestión.',
        },
        {
          name:               'Grado en Ingeniería en Diseño Industrial y Desarrollo de Producto',
          school:             'Industria e Ingeniería',
          officialPrice:      7200,
          modality:           'Online',
          duration:           '4 años',
          credits:            240,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Estudiantes con vocación técnica y creativa que quieren diseñar y desarrollar productos industriales con herramientas CAD/CAM.',
          careerOutcomes:     'Diseñador Industrial, Product Developer, Ingeniero de Producto.',
          valueProposition:   'El único grado online de diseño industrial con laboratorio físico de prototipado y fabricación aditiva.',
          mainCommercialArgs: 'Titulación oficial. Laboratorio de impresión 3D. Software CAD (SolidWorks, Fusion 360) con licencia incluida.',
        },
        {
          name:               'Grado en Ingeniería Electrónica Industrial y Automática',
          school:             'Industria e Ingeniería',
          officialPrice:      7400,
          modality:           'Online',
          duration:           '4 años',
          credits:            240,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Estudiantes y técnicos electrónicos que quieren obtener titulación oficial en electrónica industrial, automatización y control de sistemas.',
          careerOutcomes:     'Ingeniero Electrónico, Responsable de Automatización, Especialista en Robótica.',
          valueProposition:   'Formación oficial en la rama más demandada por la industria 4.0: electrónica, PLCs y robótica colaborativa.',
          mainCommercialArgs: 'Titulación oficial habilitante. Kit de electrónica incluido. Prácticas en plantas de producción automatizadas.',
        },

        // ── Industria e Ingeniería — Másteres Universitarios ──────────────────
        {
          name:               'Máster Universitario en Dirección Logística',
          school:             'Industria e Ingeniería',
          officialPrice:      6800,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Ingenieros y profesionales de la cadena de suministro que quieren liderar operaciones logísticas globales con visión estratégica.',
          careerOutcomes:     'Director de Logística, Supply Chain Manager, Operations Director.',
          valueProposition:   'El máster de referencia en logística y cadena de suministro con foco en digitalización y sostenibilidad.',
          mainCommercialArgs: 'SAP SCM y WMS en el plan de estudios. Visita a centros logísticos de Amazon y Inditex. Red de alumni en las principales operadoras logísticas.',
          bestChannel:        'Email',
        },
        {
          name:               'Máster Universitario en Industria 4.0',
          school:             'Industria e Ingeniería',
          officialPrice:      7200,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Ingenieros y técnicos industriales que quieren liderar la transformación digital de plantas y procesos de producción.',
          careerOutcomes:     'Director de Transformación Digital Industrial, Plant Manager, Industry 4.0 Consultant.',
          valueProposition:   'La única titulación con laboratorio de robótica colaborativa y entorno de gemelos digitales.',
          mainCommercialArgs: 'Laboratorio propio de robótica y gemelos digitales. IoT, IA y Big Data aplicados a la industria. Proyecto en planta industrial real.',
          bestChannel:        'Email',
        },
        {
          name:               'Máster Universitario en Internet of Things (IoT)',
          school:             'Industria e Ingeniería',
          officialPrice:      7000,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Ingenieros electrónicos, informáticos y de telecomunicación que quieren especializarse en el diseño y despliegue de sistemas IoT.',
          careerOutcomes:     'IoT Architect, Embedded Systems Engineer, Smart City Specialist.',
          valueProposition:   'Formación end-to-end en IoT: hardware, conectividad, cloud y analítica de datos de sensor.',
          mainCommercialArgs: 'Kit de hardware IoT incluido (Raspberry Pi + Arduino). Proyectos en smart factories y smart cities. Red con empresas del ecosistema IoT.',
        },
        {
          name:               'Máster Universitario en Diseño Industrial y Desarrollo de Producto',
          school:             'Industria e Ingeniería',
          officialPrice:      7500,
          modality:           'Online',
          duration:           '12 meses',
          credits:            60,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Ingenieros de producto y diseñadores industriales que quieren especializarse en el ciclo completo de desarrollo de producto físico.',
          careerOutcomes:     'Product Development Manager, Ingeniero de Producto, Design Engineer.',
          valueProposition:   'Del concepto al prototipo: el único máster con taller de fabricación aditiva y fondo de innovación en producto.',
          mainCommercialArgs: 'Software CAD avanzado con licencia incluida. Laboratorio de prototipos en campus físico. Proyecto con empresa del sector.',
        },
        {
          name:               'Máster Universitario en Ingeniería de Telecomunicación',
          school:             'Industria e Ingeniería',
          officialPrice:      8000,
          modality:           'Online',
          duration:           '18 meses',
          credits:            90,
          convocationStart:   'Octubre 2026',
          targetProfile:      'Ingenieros de telecomunicaciones que quieren obtener el título oficial habilitante o especializarse en redes 5G, comunicaciones ópticas o sistemas de radio.',
          careerOutcomes:     'Ingeniero de Telecomunicación, Network Architect, RF Engineer.',
          valueProposition:   'El único máster universitario online de telecomunicaciones con laboratorio de redes 5G propio.',
          mainCommercialArgs: 'Título oficial habilitante. Laboratorio de 5G y comunicaciones ópticas. Becas de excelencia del 20%.',
        },
      ],
    })
    console.log('  Catálogo de programas: cargado ✓')
  } else {
    console.log(`  Catálogo de programas: ya existían ${programCount} programas, no se sobreescribieron`)
  }

  // ── Brief 1: WhatsApp captación máster ─────────────────────────────────────
  const brief1 = await prisma.brief.upsert({
    where: { userId_briefNumber: { userId: admin.id, briefNumber: 1 } },
    update: {},
    create: {
      userId: admin.id,
      briefNumber: 1,
      title: 'Captación Máster Marketing Digital — Convocatoria Septiembre',
      programOrTitulation: 'Máster en Marketing Digital y Estrategia de Contenidos',
      objective: 'Conseguir que el lead solicite información sobre el máster',
      audience: 'Graduados en Comunicación o ADE, 24-35 años, con experiencia laboral de 1-3 años',
      channel: CHANNEL.whatsapp,
      mode: MODE.produccion,
      valueProposition: 'Único máster con prácticas garantizadas en agencia digital partner de Google',
      cta: 'Solicitar plaza para sesión informativa del 15 de septiembre',
      constraints: 'Sin mencionar precios. Tono cercano, no vendedor. Máximo 180 palabras.',
    },
  })

  const mv1 = await prisma.messageVersion.upsert({
    where: { briefId_versionNumber: { briefId: brief1.id, versionNumber: 1 } },
    update: {},
    create: {
      briefId: brief1.id,
      versionNumber: 1,
      content:
        'Hola [Nombre], soy Elena del equipo de Universidad Prisma.\n\n' +
        'Sé que llevas tiempo explorando cómo dar el salto al marketing digital de verdad.\n\n' +
        'Nuestro Máster en Marketing Digital tiene algo que lo diferencia: prácticas garantizadas en agencia digital partner de Google. No un convenio genérico, sino proyectos reales con clientes reales.\n\n' +
        'La próxima sesión informativa es el 15 de septiembre. Son 45 minutos donde puedes hablar directamente con el director del programa y resolver todas tus dudas.\n\n' +
        '¿Te reservo una plaza?',
      llmProvider: 'openai',
      llmModel: 'gpt-4o-mini',
      generationPromptVersion: 'v1.0',
    },
  })

  const existingRun1 = await prisma.validationRun.findFirst({ where: { messageVersionId: mv1.id } })
  const run1 = existingRun1 ?? await prisma.validationRun.create({
    data: {
      messageVersionId: mv1.id,
      overallVerdict: OVERALL_VERDICT.aprobada,
      summary:
        'La pieza cumple todos los criterios de validación sin observaciones relevantes. ' +
        'El tono es cercano y profesional, la CTA es clara y el canal está bien aprovechado.',
      validatorModel: 'gpt-4o-mini',
      validatorPromptVersion: 'v1.0',
      criteriaVersion: 'v1.0',
    },
  })

  if (!existingRun1) await prisma.validationScore.createMany({
    data: [
      {
        validationRunId: run1.id,
        criterionKey: CRITERION_KEY.alineacion_estrategica,
        criterionName: 'Alineación estratégica',
        status: SCORE_STATUS.bien,
        comment: 'El objetivo de captación está claro y el mensaje responde al momento del funnel de forma adecuada.',
      },
      {
        validationRunId: run1.id,
        criterionKey: CRITERION_KEY.claridad_estructura,
        criterionName: 'Claridad y estructura',
        status: SCORE_STATUS.bien,
        comment: 'La idea principal se comprende en una lectura. Estructura ordenada con cierre que conduce a la CTA.',
      },
      {
        validationRunId: run1.id,
        criterionKey: CRITERION_KEY.tono_coherencia_marca,
        criterionName: 'Tono y coherencia de marca',
        status: SCORE_STATUS.bien,
        comment: 'Tono cercano, profesional e institucional. Sin excesos promocionales ni artificialidad.',
      },
      {
        validationRunId: run1.id,
        criterionKey: CRITERION_KEY.calidad_argumental,
        criterionName: 'Calidad argumental y propuesta de valor',
        status: SCORE_STATUS.bien,
        comment: 'La propuesta de valor (prácticas garantizadas en agencia Google partner) está priorizada y bien comunicada.',
      },
      {
        validationRunId: run1.id,
        criterionKey: CRITERION_KEY.adaptacion_canal,
        criterionName: 'Adaptación al canal',
        status: SCORE_STATUS.bien,
        comment: 'Longitud adecuada para WhatsApp, estructura conversacional y CTA coherente con el canal.',
      },
      {
        validationRunId: run1.id,
        criterionKey: CRITERION_KEY.precision_fiabilidad,
        criterionName: 'Precisión y fiabilidad del contenido',
        status: SCORE_STATUS.bien,
        comment: 'El nombre del programa es correcto, la fecha es concreta y no hay afirmaciones sin respaldo.',
      },
      {
        validationRunId: run1.id,
        criterionKey: CRITERION_KEY.calidad_ejecucion,
        criterionName: 'Calidad final de ejecución',
        status: SCORE_STATUS.bien,
        comment: 'Sin errores ortográficos ni gramaticales. Texto fluido y profesional, publicable directamente.',
      },
    ],
  })

  // ── Brief 2: Email reactivación leads fríos ─────────────────────────────────
  const brief2 = await prisma.brief.upsert({
    where: { userId_briefNumber: { userId: admin.id, briefNumber: 2 } },
    update: {},
    create: {
      userId: admin.id,
      briefNumber: 2,
      title: 'Reactivación Leads Fríos — Grado en Psicología',
      programOrTitulation: 'Grado en Psicología',
      objective: 'Reactivar el interés de leads que solicitaron información hace más de 6 meses y no matricularon',
      audience: 'Leads fríos que consultaron el Grado en Psicología, mayores de 25 años, posible segunda oportunidad académica',
      channel: CHANNEL.email,
      mode: MODE.exploracion,
      valueProposition: 'Modalidad semipresencial que permite compaginar trabajo y estudios con acompañamiento personalizado',
      cta: 'Descargar guía de acceso al grado con requisitos actualizados',
      constraints: 'No mencionar el tiempo transcurrido desde su consulta. Evitar presión.',
    },
  })

  const mv2 = await prisma.messageVersion.upsert({
    where: { briefId_versionNumber: { briefId: brief2.id, versionNumber: 1 } },
    update: {},
    create: {
      briefId: brief2.id,
      versionNumber: 1,
      content:
        'Asunto: Retoma tu camino hacia la Psicología — nueva convocatoria abierta\n\n' +
        'Hola [Nombre],\n\n' +
        'En algún momento te planteaste estudiar Psicología. Quizá las circunstancias no acompañaron entonces. Hoy queremos que sepas que el camino sigue abierto.\n\n' +
        'El Grado en Psicología de Universidad Prisma tiene una modalidad semipresencial diseñada para personas como tú: con responsabilidades, con experiencia y con las ideas claras sobre lo que quieren conseguir.\n\n' +
        'El acompañamiento personalizado no es un recurso extra. Es la forma en que trabajamos desde el primer día.\n\n' +
        'Si quieres saber qué se necesita para acceder este año, hemos preparado una guía práctica con todos los requisitos actualizados.\n\n' +
        '→ Descarga la guía de acceso\n\n' +
        'Estamos aquí cuando lo necesites.\n\n' +
        'Equipo de Admisiones\nUniversidad Prisma',
      llmProvider: 'openai',
      llmModel: 'gpt-4o-mini',
      generationPromptVersion: 'v1.0',
    },
  })

  const existingRun2 = await prisma.validationRun.findFirst({ where: { messageVersionId: mv2.id } })
  const run2 = existingRun2 ?? await prisma.validationRun.create({
    data: {
      messageVersionId: mv2.id,
      overallVerdict: OVERALL_VERDICT.aprobada_con_ajustes,
      summary:
        'La pieza es sólida en tono y estructura pero la propuesta de valor queda algo diluida en el cuerpo central. ' +
        'La longitud del email podría ajustarse para aumentar la tasa de apertura completa. ' +
        'Ajustes menores antes de activar.',
      suggestedRewrite:
        'Hola [Nombre],\n\n' +
        'Queremos recordarte que el Grado en Psicología de Universidad Prisma sigue siendo una opción real para ti.\n\n' +
        'Con modalidad semipresencial y acompañamiento personalizado desde el primer día, puedes compaginar estudios y trabajo sin renunciar a ninguno de los dos.\n\n' +
        'Hemos preparado una guía con todos los requisitos de acceso actualizados este año.\n\n' +
        '→ Descarga la guía de acceso\n\n' +
        'Equipo de Admisiones — Universidad Prisma',
      validatorModel: 'gpt-4o-mini',
      validatorPromptVersion: 'v1.0',
      criteriaVersion: 'v1.0',
    },
  })

  if (!existingRun2) await prisma.validationScore.createMany({
    data: [
      {
        validationRunId: run2.id,
        criterionKey: CRITERION_KEY.alineacion_estrategica,
        criterionName: 'Alineación estratégica',
        status: SCORE_STATUS.bien,
        comment: 'El objetivo de reactivación está implícito y bien manejado. El enfoque es adecuado para leads fríos.',
      },
      {
        validationRunId: run2.id,
        criterionKey: CRITERION_KEY.claridad_estructura,
        criterionName: 'Claridad y estructura',
        status: SCORE_STATUS.bien,
        comment: 'Estructura clara con párrafos cortos. La CTA es visible y directa.',
      },
      {
        validationRunId: run2.id,
        criterionKey: CRITERION_KEY.tono_coherencia_marca,
        criterionName: 'Tono y coherencia de marca',
        status: SCORE_STATUS.bien,
        comment: 'Tono empático y no presionante, coherente con la identidad de Universidad Prisma.',
      },
      {
        validationRunId: run2.id,
        criterionKey: CRITERION_KEY.calidad_argumental,
        criterionName: 'Calidad argumental y propuesta de valor',
        status: SCORE_STATUS.mejorable,
        comment: 'La propuesta de valor (semipresencial + acompañamiento) está presente pero algo dispersa en el cuerpo del email. Podría priorizarse mejor.',
        suggestedFix: 'Condensar la propuesta de valor en el segundo párrafo y eliminar el penúltimo párrafo redundante.',
      },
      {
        validationRunId: run2.id,
        criterionKey: CRITERION_KEY.adaptacion_canal,
        criterionName: 'Adaptación al canal',
        status: SCORE_STATUS.mejorable,
        comment: 'El email es algo largo para una reactivación en frío. La tasa de lectura completa puede verse afectada.',
        suggestedFix: 'Reducir el cuerpo a tres párrafos máximos para mejorar la probabilidad de lectura completa.',
      },
      {
        validationRunId: run2.id,
        criterionKey: CRITERION_KEY.precision_fiabilidad,
        criterionName: 'Precisión y fiabilidad del contenido',
        status: SCORE_STATUS.bien,
        comment: 'No hay fechas, cifras ni condiciones que requieran verificación. Sin afirmaciones de riesgo.',
      },
      {
        validationRunId: run2.id,
        criterionKey: CRITERION_KEY.calidad_ejecucion,
        criterionName: 'Calidad final de ejecución',
        status: SCORE_STATUS.bien,
        comment: 'Sin errores ortográficos ni gramaticales. Redacción natural y profesional.',
      },
    ],
  })

  // ── Brief 3: WhatsApp matrícula grado ──────────────────────────────────────
  const brief3 = await prisma.brief.upsert({
    where: { userId_briefNumber: { userId: admin.id, briefNumber: 3 } },
    update: {},
    create: {
      userId: admin.id,
      briefNumber: 3,
      title: 'Cierre Matrícula Grado en Derecho — Último Aviso',
      programOrTitulation: 'Grado en Derecho',
      objective: 'Urgir al lead a formalizar la matrícula antes del cierre del plazo',
      audience: 'Leads con solicitud de plaza confirmada que aún no han completado el pago',
      channel: CHANNEL.whatsapp,
      mode: MODE.produccion,
      valueProposition: 'Plaza reservada a punto de liberarse si no se formaliza en 24 horas',
      cta: 'Completar el proceso de matrícula ahora',
      constraints: 'Mensaje de urgencia, máximo 120 palabras.',
    },
  })

  const mv3 = await prisma.messageVersion.upsert({
    where: { briefId_versionNumber: { briefId: brief3.id, versionNumber: 1 } },
    update: {},
    create: {
      briefId: brief3.id,
      versionNumber: 1,
      content:
        '⚠️ ÚLTIMA OPORTUNIDAD — Tu plaza en el Grado en Derecho caduca HOY a las 23:59.\n\n' +
        '¡No pierdas lo que has conseguido! Miles de estudiantes han pasado por este proceso y los que no actúan a tiempo se arrepienten para siempre.\n\n' +
        'Formaliza tu matrícula AHORA o perderás tu plaza definitivamente. No hay segundas oportunidades.\n\n' +
        'Haz clic aquí para no arruinar tu futuro: [ENLACE]\n\n' +
        '⏰ 24 horas. Decide.',
      llmProvider: 'openai',
      llmModel: 'gpt-4o-mini',
      generationPromptVersion: 'v1.0',
    },
  })

  const existingRun3 = await prisma.validationRun.findFirst({ where: { messageVersionId: mv3.id } })
  const run3 = existingRun3 ?? await prisma.validationRun.create({
    data: {
      messageVersionId: mv3.id,
      overallVerdict: OVERALL_VERDICT.no_aprobada,
      summary:
        'La pieza presenta problemas de fondo en tono y coherencia de marca que impiden su activación. ' +
        'El lenguaje es agresivo, usa presión emocional inadecuada y no es reconocible como comunicación de Universidad Prisma. ' +
        'Debe rehacerse completamente.',
      validatorModel: 'gpt-4o-mini',
      validatorPromptVersion: 'v1.0',
      criteriaVersion: 'v1.0',
    },
  })

  if (!existingRun3) await prisma.validationScore.createMany({
    data: [
      {
        validationRunId: run3.id,
        criterionKey: CRITERION_KEY.alineacion_estrategica,
        criterionName: 'Alineación estratégica',
        status: SCORE_STATUS.bien,
        comment: 'El objetivo de urgir a la matrícula está claro y el momento del funnel es el adecuado.',
      },
      {
        validationRunId: run3.id,
        criterionKey: CRITERION_KEY.claridad_estructura,
        criterionName: 'Claridad y estructura',
        status: SCORE_STATUS.mejorable,
        comment: 'El mensaje es directo pero la estructura es caótica por el exceso de mayúsculas y emojis. La CTA queda enterrada.',
        suggestedFix: 'Eliminar mayúsculas innecesarias y usar una sola llamada a la acción al final.',
      },
      {
        validationRunId: run3.id,
        criterionKey: CRITERION_KEY.tono_coherencia_marca,
        criterionName: 'Tono y coherencia de marca',
        status: SCORE_STATUS.critico,
        comment:
          'El tono es agresivo, usa presión emocional inapropiada ("arruinar tu futuro", "se arrepienten para siempre") y no es reconocible como comunicación institucional de Universidad Prisma. Incumplimiento grave.',
        suggestedFix:
          'Reescribir completamente con tono profesional y cercano. Mantener la urgencia factual (plazo real) sin manipulación emocional.',
      },
      {
        validationRunId: run3.id,
        criterionKey: CRITERION_KEY.calidad_argumental,
        criterionName: 'Calidad argumental y propuesta de valor',
        status: SCORE_STATUS.mejorable,
        comment: 'Solo se comunica urgencia, no valor. No hay argumento positivo que refuerce la decisión de matricularse.',
        suggestedFix: 'Añadir una frase que recuerde brevemente por qué la plaza vale la pena formalizar.',
      },
      {
        validationRunId: run3.id,
        criterionKey: CRITERION_KEY.adaptacion_canal,
        criterionName: 'Adaptación al canal',
        status: SCORE_STATUS.mejorable,
        comment: 'La longitud es adecuada para WhatsApp pero el abuso de emojis y mayúsculas resta credibilidad en el canal.',
        suggestedFix: 'Limitar a un emoji funcional (⏰) y eliminar mayúsculas no estructurales.',
      },
      {
        validationRunId: run3.id,
        criterionKey: CRITERION_KEY.precision_fiabilidad,
        criterionName: 'Precisión y fiabilidad del contenido',
        status: SCORE_STATUS.bien,
        comment: 'La fecha límite es concreta. No hay afirmaciones inventadas sobre el programa.',
      },
      {
        validationRunId: run3.id,
        criterionKey: CRITERION_KEY.calidad_ejecucion,
        criterionName: 'Calidad final de ejecución',
        status: SCORE_STATUS.mejorable,
        comment: 'Sin errores ortográficos, pero el resultado final no es profesional ni publicable en el estado actual.',
        suggestedFix: 'Revisar completamente el registro expresivo antes de considerar la ejecución satisfactoria.',
      },
    ],
  })

  // ── SendMetrics demo data (módulo de análisis) ────────────────────────────
  // Brief 1: aprobado, enviado — métricas de WhatsApp captación
  await prisma.sendMetrics.upsert({
    where: { briefId: brief1.id },
    update: {},
    create: {
      briefId:          brief1.id,
      utmCampaign:      'marketing-digital-sep26',
      utmSource:        'whatsapp',
      utmMedium:        'crm',
      utmContent:       'captacion-v1',
      sentCount:        3800,
      deliveredCount:   3724,
      bouncedCount:     76,
      opensCount:       1676,
      clicksCount:      234,
      leadsReactivated: 42,
      enrollments:      8,
      programPrice:     4200,
      programDiscount:  0,
      isSuccessCase:    true,
      successNote:      'Tono cercano + CTA "¿Te reservo una plaza?" generó la mejor tasa de respuesta para captación WhatsApp en este segmento.',
      sentAt:           daysAgo(28),
    },
  })

  // Brief 2: aprobado con ajustes, enviado — email reactivación leads fríos
  await prisma.sendMetrics.upsert({
    where: { briefId: brief2.id },
    update: {},
    create: {
      briefId:          brief2.id,
      utmCampaign:      'reactivacion-psicologia-jun26',
      utmSource:        'email',
      utmMedium:        'crm',
      utmContent:       'leads-frios-v1',
      sentCount:        6200,
      deliveredCount:   6138,
      bouncedCount:     62,
      opensCount:       2056,
      clicksCount:      288,
      leadsReactivated: 68,
      enrollments:      10,
      programPrice:     5600,
      programDiscount:  0.1,
      isSuccessCase:    false,
      sentAt:           daysAgo(14),
    },
  })

  // Brief 4: WhatsApp MBA — datos adicionales para comparativas
  const brief4 = await prisma.brief.upsert({
    where: { userId_briefNumber: { userId: admin.id, briefNumber: 4 } },
    update: {},
    create: {
      userId:             admin.id,
      briefNumber:        4,
      title:              'Captación MBA Executive — Convocatoria Octubre',
      programOrTitulation: 'MBA Executive',
      objective:          'Generar solicitudes de información cualificadas para el MBA',
      audience:           'Directivos y mandos intermedios, 32-48 años, empresas +50 empleados',
      channel:            CHANNEL.whatsapp,
      mode:               MODE.produccion,
      valueProposition:   'MBA enfocado en habilidades directivas reales con casos del IBEX 35',
      cta:                'Solicitar sesión de orientación personalizada',
      constraints:        'Tono ejecutivo. Máximo 160 palabras. Sin mencionar precio.',
      reviewStatus:       'approved',
      crmStatus:          'sent_to_crm',
      crmSentAt:          daysAgo(21),
      crmSentBy:          'pm@prisma.es',
      crmEmailHtml:       '',
      crmEmailPlainText:  '',
      crmInternalSubject: 'MBA Executive — WhatsApp Captación oct-26',
    },
  })

  await prisma.messageVersion.upsert({
    where: { briefId_versionNumber: { briefId: brief4.id, versionNumber: 1 } },
    update: {},
    create: {
      briefId:                 brief4.id,
      versionNumber:           1,
      content:
        'Buenos días [Nombre],\n\n' +
        'Llevas años demostrando que puedes con la operativa. Ahora es el momento de dar el salto a la dirección estratégica.\n\n' +
        'El MBA Executive de Universidad Prisma está diseñado para profesionales como tú: casos reales de empresas del IBEX 35, metodología enfocada en decisión bajo incertidumbre y un network que abre puertas.\n\n' +
        'La próxima convocatoria es en octubre. Los perfiles que más se benefician son directivos y mandos intermedios con experiencia sólida y ambición de crecer.\n\n' +
        '¿Tienes 20 minutos esta semana para una sesión de orientación personalizada?\n\n' +
        'Te cuento cómo encaja el programa en tu trayectoria específica.',
      llmProvider:             'openai',
      llmModel:                'gpt-4o-mini',
      generationPromptVersion: 'v1.0',
    },
  })

  await prisma.sendMetrics.upsert({
    where: { briefId: brief4.id },
    update: {},
    create: {
      briefId:          brief4.id,
      utmCampaign:      'mba-executive-oct26',
      utmSource:        'whatsapp',
      utmMedium:        'crm',
      utmContent:       'directivos-v1',
      sentCount:        1200,
      deliveredCount:   1188,
      bouncedCount:     12,
      opensCount:       714,
      clicksCount:      143,
      leadsReactivated: 31,
      enrollments:      5,
      programPrice:     9500,
      programDiscount:  0,
      isSuccessCase:    true,
      successNote:      'Apertura del 60% — el más alto registrado. La apertura con pregunta retórica sobre el salto profesional resonó especialmente bien en mandos intermedios.',
      sentAt:           daysAgo(21),
    },
  })

  // Brief 5: Email industria 4.0 — enviado hace menos tiempo
  const brief5 = await prisma.brief.upsert({
    where: { userId_briefNumber: { userId: admin.id, briefNumber: 5 } },
    update: {},
    create: {
      userId:             admin.id,
      briefNumber:        5,
      title:              'Industria 4.0 — Reactivación Leads Templados',
      programOrTitulation: 'Máster en Industria 4.0 y Transformación Digital',
      objective:          'Reactivar leads que consultaron hace 3-6 meses',
      audience:           'Ingenieros y técnicos industriales, 28-45 años, empresa manufacturera',
      channel:            CHANNEL.email,
      mode:               MODE.produccion,
      valueProposition:   'Única titulación con laboratorio de robótica colaborativa y gemelos digitales',
      cta:                'Ver el plan de estudios actualizado para 2026',
      constraints:        'Tono técnico pero accesible. Máximo 200 palabras.',
      reviewStatus:       'approved',
      crmStatus:          'sent_to_crm',
      crmSentAt:          daysAgo(7),
      crmSentBy:          'pm@prisma.es',
      crmEmailHtml:       '',
      crmEmailPlainText:  '',
      crmInternalSubject: 'Industria 4.0 — Email Reactivación jun-26',
    },
  })

  await prisma.messageVersion.upsert({
    where: { briefId_versionNumber: { briefId: brief5.id, versionNumber: 1 } },
    update: {},
    create: {
      briefId:                 brief5.id,
      versionNumber:           1,
      content:
        'Asunto: El plan de estudios de Industria 4.0 que pedías — actualizado para 2026\n\n' +
        'Hola [Nombre],\n\n' +
        'La transformación digital en el sector industrial ya no es opcional. Las plantas que no integran IA, robótica colaborativa y gemelos digitales en los próximos 3 años van a quedar fuera de los contratos de la cadena de valor global.\n\n' +
        'El Máster en Industria 4.0 de Universidad Prisma ha actualizado su plan de estudios para 2026 con dos módulos nuevos: automatización con visión artificial y análisis predictivo de mantenimiento.\n\n' +
        'Además, seguimos siendo la única titulación con laboratorio propio de robótica colaborativa y entorno de gemelos digitales.\n\n' +
        'Hemos preparado el nuevo plan de estudios en PDF.\n\n' +
        '→ Descarga el plan de estudios 2026\n\n' +
        'Equipo Académico — Universidad Prisma',
      llmProvider:             'openai',
      llmModel:                'gpt-4o-mini',
      generationPromptVersion: 'v1.0',
    },
  })

  await prisma.sendMetrics.upsert({
    where: { briefId: brief5.id },
    update: {},
    create: {
      briefId:          brief5.id,
      utmCampaign:      'industria-4-reactivacion-jun26',
      utmSource:        'email',
      utmMedium:        'crm',
      utmContent:       'leads-templados-v1',
      sentCount:        4500,
      deliveredCount:   4446,
      bouncedCount:     54,
      opensCount:       1958,
      clicksCount:      391,
      leadsReactivated: 89,
      enrollments:      15,
      programPrice:     6800,
      programDiscount:  0.15,
      isSuccessCase:    false,
      sentAt:           daysAgo(7),
    },
  })

  console.log('✓ Seed completado:')
  console.log('  Usuarios: ivan.aguado00@gmail.com (admin), redactor@prisma.es, coordinador@prisma.es, pm@prisma.es, demo@prisma.local')
  console.log('  Contraseña local de desarrollo: prisma2024')
  console.log(`  Brief 1: ${brief1.title}`)
  console.log(`  Brief 2: ${brief2.title}`)
  console.log(`  Brief 3: ${brief3.title}`)
  console.log(`  Brief 4: ${brief4.title}`)
  console.log(`  Brief 5: ${brief5.title}`)
  console.log('  SendMetrics: 4 registros de análisis creados')
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
