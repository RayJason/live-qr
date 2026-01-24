import { getServerSession } from '#auth'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    const id = getRouterParam(event, 'id')

    if (!session || !session.user || !session.user.email) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw createError({ statusCode: 401, statusMessage: 'User not found' })

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
