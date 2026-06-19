import type { MessageVersion } from '../generated/prisma/client'

export interface VersionNode {
  version: MessageVersion
  children: VersionNode[]
}

export function buildVersionTree(versions: MessageVersion[]): VersionNode[] {
  const nodeMap = new Map<string, VersionNode>()

  for (const v of versions) {
    nodeMap.set(v.id, { version: v, children: [] })
  }

  const roots: VersionNode[] = []

  for (const v of versions) {
    const node = nodeMap.get(v.id)!
    if (v.parentVersionId && nodeMap.has(v.parentVersionId)) {
      nodeMap.get(v.parentVersionId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
