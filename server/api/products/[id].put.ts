import { getServerSession } from '#auth'
import prisma from '~/server/utils/prisma'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  contactEmail: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  lostMessage: z.string().optional().nullable(),
  feishuWebhookUrl: z.string().optional().nullable(),
  status: z.enum(['NORMAL', 'LOST']).optional(),
  showContactWhenSafe: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    const id = getRouterParam(event, 'id')

    if (!session || !session.user || !session.user.email) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    
    const body = await readBody(event)
    const validation = updateProductSchema.safeParse(body)
    
    if (!validation.success) {
        throw createError({ statusCode: 400, statusMessage: 'Validation Failed', data: validation.error.flatten() })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw createError({ statusCode: 401, statusMessage: 'User not found' })

    // Verify ownership
    const existing = await prisma.product.findFirst({
        where: { id, userId: user.id }
    })
    
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Product not found' })

    const updated = await prisma.product.update({
        where: { id },
        data: validation.data
    })
    
    return updated
})
