import { describe, it, expect } from 'vitest'
import { buildVersionTree } from '../../src/lib/versionTreeUtils'
import type { MessageVersion } from '../../src/generated/prisma/client'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeVersion(
  id: string,
  versionNumber: number,
  parentVersionId: string | null = null,
  userInstruction: string | null = null,
): MessageVersion {
  return {
    id,
    versionNumber,
    parentVersionId,
    userInstruction,
    briefId: 'brief-1',
    content: `Contenido de ${id}`,
    llmProvider: 'openai',
    llmModel: 'gpt-4o-mini',
    generationPromptVersion: 'v1.0',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  }
}

// ── Casos base ────────────────────────────────────────────────────────────────

describe('buildVersionTree — lista vacía', () => {
  it('devuelve un array vacío si no hay versiones', () => {
    expect(buildVersionTree([])).toEqual([])
  })
})

describe('buildVersionTree — versión única', () => {
  it('devuelve un único nodo raíz sin hijos', () => {
    const versions = [makeVersion('v1', 1)]
    const tree = buildVersionTree(versions)

    expect(tree).toHaveLength(1)
    expect(tree[0]!.version.id).toBe('v1')
    expect(tree[0]!.children).toHaveLength(0)
  })
})

// ── Cadena lineal ─────────────────────────────────────────────────────────────

describe('buildVersionTree — cadena lineal', () => {
  it('construye una cadena v1 → v2 → v3 correctamente', () => {
    const versions = [
      makeVersion('v1', 1, null),
      makeVersion('v2', 2, 'v1'),
      makeVersion('v3', 3, 'v2'),
    ]
    const tree = buildVersionTree(versions)

    expect(tree).toHaveLength(1)
    const root = tree[0]!
    expect(root.version.id).toBe('v1')
    expect(root.children).toHaveLength(1)

    const child = root.children[0]!
    expect(child.version.id).toBe('v2')
    expect(child.children).toHaveLength(1)

    const grandchild = child.children[0]!
    expect(grandchild.version.id).toBe('v3')
    expect(grandchild.children).toHaveLength(0)
  })
})

// ── Árbol con ramas ───────────────────────────────────────────────────────────

describe('buildVersionTree — ramas múltiples', () => {
  it('asigna dos hijos a la misma raíz', () => {
    const versions = [
      makeVersion('v1', 1, null),
      makeVersion('v2', 2, 'v1'),
      makeVersion('v3', 3, 'v1'),
    ]
    const tree = buildVersionTree(versions)

    expect(tree).toHaveLength(1)
    expect(tree[0]!.children).toHaveLength(2)
    const childIds = tree[0]!.children.map((c) => c.version.id)
    expect(childIds).toContain('v2')
    expect(childIds).toContain('v3')
  })

  it('maneja un árbol con dos raíces independientes', () => {
    const versions = [
      makeVersion('v1', 1, null),
      makeVersion('v2', 2, null),
      makeVersion('v3', 3, 'v1'),
    ]
    const tree = buildVersionTree(versions)

    expect(tree).toHaveLength(2)
    const rootIds = tree.map((n) => n.version.id)
    expect(rootIds).toContain('v1')
    expect(rootIds).toContain('v2')

    const v1Root = tree.find((n) => n.version.id === 'v1')!
    expect(v1Root.children).toHaveLength(1)
    expect(v1Root.children[0]!.version.id).toBe('v3')
  })

  it('construye árbol profundo: v1 → v2 → v3, y v1 → v4', () => {
    const versions = [
      makeVersion('v1', 1, null),
      makeVersion('v2', 2, 'v1'),
      makeVersion('v3', 3, 'v2'),
      makeVersion('v4', 4, 'v1'),
    ]
    const tree = buildVersionTree(versions)

    expect(tree).toHaveLength(1)
    const root = tree[0]!
    expect(root.children).toHaveLength(2)

    const childIds = root.children.map((c) => c.version.id)
    expect(childIds).toContain('v2')
    expect(childIds).toContain('v4')

    const v2 = root.children.find((c) => c.version.id === 'v2')!
    expect(v2.children).toHaveLength(1)
    expect(v2.children[0]!.version.id).toBe('v3')
  })
})

// ── Casos borde ───────────────────────────────────────────────────────────────

describe('buildVersionTree — casos borde', () => {
  it('trata como raíz una versión cuyo parentVersionId no existe en la lista', () => {
    const versions = [makeVersion('v2', 2, 'v-inexistente')]
    const tree = buildVersionTree(versions)

    expect(tree).toHaveLength(1)
    expect(tree[0]!.version.id).toBe('v2')
    expect(tree[0]!.children).toHaveLength(0)
  })

  it('preserva la referencia a la versión original en cada nodo', () => {
    const v = makeVersion('v1', 1, null, 'instrucción de prueba')
    const tree = buildVersionTree([v])

    expect(tree[0]!.version).toBe(v)
  })
})
