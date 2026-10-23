import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  const reportId = getRouterParam(event, 'reportId')

  if (!id || !reportId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing product or report ID' })
  }

  const { count } = await prisma.report.deleteMany({
    where: { id: reportId, productId: id, product: { userId: user.id } },
  })

  if (!count) {
    throw createError({ statusCode: 404, statusMessage: 'Report not found' })
  }

  return { success: true }
})
