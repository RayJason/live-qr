import { getServerSession } from '#auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateSchema = z.object({
    name: z.string().min(1).max(50).optional(),
    phone: z.string().max(20).optional(),
})

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    
    if (!session?.user?.email) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
    
    const body = await readBody(event)
    const validated = updateSchema.parse(body)
    
    const user = await prisma.user.update({
        where: { email: session.user.email },
        data: validated,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
        }
    })
    
    return user
})
