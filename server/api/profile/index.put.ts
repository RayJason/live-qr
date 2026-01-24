import { getServerSession } from '#auth'
import prisma from '~/server/utils/prisma'
import { z } from 'zod'

const updateSchema = z.object({
    name: z.string().min(1).max(50).optional(),
    phone: z.string().max(20).optional(),
    feishuWebhookUrl: z.string().optional().nullable(),
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
            feishuWebhookUrl: true,
        }
    })
    
    return user
})
