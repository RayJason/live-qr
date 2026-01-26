import prisma from '~/server/utils/prisma'
import { z } from 'zod'

const updateSchema = z.object({
    name: z.string().min(1).max(50).optional(),
    phone: z.string().max(20).optional(),
    feishuWebhookUrl: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)

    const body = await readBody(event)
    const validated = updateSchema.parse(body)

    const dbUser = await prisma.user.update({
        where: { id: user.id },
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

    return dbUser
})
