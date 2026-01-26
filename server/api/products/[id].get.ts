import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const id = getRouterParam(event, 'id')

    const product = await prisma.product.findFirst({
        where: {
            id,
            userId: user.id
        },
        include: {
            reports: {
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!product) {
        throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    }

    return product
})
