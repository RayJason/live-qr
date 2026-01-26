import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)

    const products = await prisma.product.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { reports: true }
            }
        }
    })

    return products
})
