import { prisma } from '../lib/prisma'

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  })
}

export async function getUsersByRole(role: string) {
  return prisma.user.findMany({
    where: { role },
    select: { id: true, email: true, name: true },
  })
}
