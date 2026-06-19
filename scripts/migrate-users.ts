/**
 * migrate-users.ts
 * Aplica los cambios de roles a la base de datos:
 *   - redactor@prisma.es  → role: 'redactor'
 *   - Crea coordinador@prisma.es con role: 'coordinador'
 *   - Crea pm@prisma.es con role: 'pm'
 *
 * Uso:
 *   npx tsx scripts/migrate-users.ts
 */
import 'dotenv/config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  // 1. Actualizar rol y contraseña de redactor@prisma.es
  const redactor = await prisma.user.update({
    where: { email: 'redactor@prisma.es' },
    data: { role: 'redactor', passwordHash: await bcrypt.hash('redactorprisma', 10) },
  })
  console.log(`✓ ${redactor.email} → role: ${redactor.role}`)

  // 2. Crear coordinador@prisma.es
  const coordinador = await prisma.user.upsert({
    where: { email: 'coordinador@prisma.es' },
    update: { role: 'coordinador', passwordHash: await bcrypt.hash('coordinadorprisma', 10) },
    create: {
      name: 'Coordinador Prisma',
      email: 'coordinador@prisma.es',
      passwordHash: await bcrypt.hash('coordinadorprisma', 10),
      role: 'coordinador',
    },
  })
  console.log(`✓ ${coordinador.email} → role: ${coordinador.role}`)

  // 3. Crear pm@prisma.es
  const pm = await prisma.user.upsert({
    where: { email: 'pm@prisma.es' },
    update: { role: 'pm', passwordHash: await bcrypt.hash('pmprisma', 10) },
    create: {
      name: 'PM Prisma',
      email: 'pm@prisma.es',
      passwordHash: await bcrypt.hash('pmprisma', 10),
      role: 'pm',
    },
  })
  console.log(`✓ ${pm.email} → role: ${pm.role}`)

  // Resumen final
  const users = await prisma.user.findMany({ select: { email: true, name: true, role: true }, orderBy: { createdAt: 'asc' } })
  console.log('\nUsuarios actuales:')
  for (const u of users) {
    console.log(`  ${u.email.padEnd(30)} ${u.role}`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
