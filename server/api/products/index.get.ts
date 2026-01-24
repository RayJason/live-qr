import { getServerSession } from '#auth'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    
    if (!session || !session.user || !session.user.email) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }
    
    // Find user by email to get ID (Auth.js session usually has email)
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })
    
    if (!user) {
         throw createError({
            statusCode: 401,
            statusMessage: 'User not found'
        })
    }
    
    const products = await prisma.product.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            // Include report count or similar if needed
            _count: {
                select: { reports: true }
            }
        }
    })
    
    return products
})
