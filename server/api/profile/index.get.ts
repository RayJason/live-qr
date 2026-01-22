import { getServerSession } from '#auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    
    if (!session?.user?.email) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
    
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
        }
    })
    
    if (!user) {
        throw createError({ statusCode: 404, message: 'User not found' })
    }
    
    return user
})
