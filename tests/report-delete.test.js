import { describe, expect, test } from 'bun:test'
import { runInNewContext } from 'node:vm'

const source = await Bun.file(new URL('../server/api/products/[id]/reports/[reportId].delete.ts', import.meta.url)).text()

function setup({ userId = 'owner', productId = 'product', reportId = 'report', authenticated = true } = {}) {
  const reports = [
    { id: 'report', productId: 'product', userId: 'owner' },
    { id: 'other-report', productId: 'other-product', userId: 'other-owner' },
  ]
  const handler = runInNewContext(source.replace(/^import .*\n/, '').replace('export default ', ''), {
    defineEventHandler: handler => handler,
    requireUserSession: async () => {
      if (!authenticated) throw { statusCode: 401 }
      return { user: { id: userId } }
    },
    getRouterParam: (_, name) => name === 'id' ? productId : reportId,
    createError: error => error,
    prisma: { report: { deleteMany: async ({ where }) => {
      const index = reports.findIndex(report => report.id === where.id && report.productId === where.productId && report.userId === where.product.userId)
      if (index < 0) return { count: 0 }
      reports.splice(index, 1)
      return { count: 1 }
    } } },
  })
  return { handler, reports }
}

describe('report deletion authorization', () => {
  test('deletes only the selected report owned by the current user', async () => {
    const { handler, reports } = setup()
    expect(await handler({})).toEqual({ success: true })
    expect(reports.map(report => report.id)).toEqual(['other-report'])
    await expect(handler({})).rejects.toMatchObject({ statusCode: 404 })
  })

  for (const [name, options, statusCode] of [
    ['unauthenticated', { authenticated: false }, 401],
    ['another owner', { userId: 'other-owner' }, 404],
    ['wrong product', { productId: 'other-product' }, 404],
    ['missing report', { reportId: 'missing' }, 404],
    ['missing parameter', { reportId: '' }, 400],
  ]) {
    test(`rejects ${name} without deleting reports`, async () => {
      const { handler, reports } = setup(options)
      await expect(handler({})).rejects.toMatchObject({ statusCode })
      expect(reports).toHaveLength(2)
    })
  }
})
