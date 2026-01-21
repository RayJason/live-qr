import { getServerSession } from '#auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    const id = getRouterParam(event, 'id')
    
    if (!session || !session.user || !session.user.email) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })
    
    if (!user) throw createError({ statusCode: 401, statusMessage: 'User not found' })
    
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
