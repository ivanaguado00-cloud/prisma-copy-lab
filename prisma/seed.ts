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

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  // ── Usuarios de prueba ────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('prisma2024', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@prisma.es' },
    update: {},
    create: {
      name: 'Admin Prisma',
      email: 'admin@prisma.es',
      passwordHash,
    },
  })

  await prisma.user.upsert({
    where: { email: 'redactor@prisma.es' },
    update: {},
    create: {
      name: 'Redactor Prisma',
      email: 'redactor@prisma.es',
      passwordHash,
    },
  })

  await prisma.user.upsert({
    where: { email: 'demo@prisma.local' },
    update: {},
    create: {
      name: 'Demo Prisma',
      email: 'demo@prisma.local',
      passwordHash,
    },
  })

  // ── Brief 1: WhatsApp captación máster ─────────────────────────────────────
  const brief1 = await prisma.brief.create({
    data: {
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

  const mv1 = await prisma.messageVersion.create({
    data: {
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

  const run1 = await prisma.validationRun.create({
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

  await prisma.validationScore.createMany({
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
  const brief2 = await prisma.brief.create({
    data: {
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

  const mv2 = await prisma.messageVersion.create({
    data: {
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

  const run2 = await prisma.validationRun.create({
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

  await prisma.validationScore.createMany({
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
  const brief3 = await prisma.brief.create({
    data: {
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

  const mv3 = await prisma.messageVersion.create({
    data: {
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

  const run3 = await prisma.validationRun.create({
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

  await prisma.validationScore.createMany({
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

  console.log('✓ Seed completado:')
  console.log('  Usuarios: admin@prisma.es, redactor@prisma.es, demo@prisma.local')
  console.log('  Contraseña local de desarrollo: prisma2024')
  console.log(`  Brief 1: ${brief1.title}`)
  console.log(`  Brief 2: ${brief2.title}`)
  console.log(`  Brief 3: ${brief3.title}`)
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
