import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const id = getRouterParam(event, 'id')

    // Verify ownership
    const existing = await prisma.product.findFirst({
        where: { id, userId: user.id }
    })

    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Product not found' })

    await prisma.product.delete({
        where: { id }
    })

    return { success: true }
})
