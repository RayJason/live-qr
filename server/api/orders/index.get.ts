import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)

    const orders = await prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            product: {
                select: { id: true, name: true, type: true }
            }
        }
    })

    return orders
})
