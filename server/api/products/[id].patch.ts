import prisma from '~/server/utils/prisma'
import { z } from 'zod'

const updateProductSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    contactEmail: z.string().optional().nullable(),
    contactPhone: z.string().optional().nullable(),
    lostMessage: z.string().optional().nullable(),
    feishuWebhookUrl: z.string().optional().nullable(),
    status: z.enum(['NORMAL', 'LOST']).optional(),
    showContactWhenSafe: z.boolean().optional(),
    type: z.enum(['STICKER', 'KEYCHAIN', 'LUGGAGE_TAG', 'SNOWBOARD_STICKER', 'BOARDING_PASS']).optional(),
    qrDotsColor: z.string().optional().nullable(),
    qrCornerColor: z.string().optional().nullable(),
    qrBackgroundColor: z.string().optional().nullable(),
    qrLogoUrl: z.string().optional().nullable(),
    qrCustomText: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const id = getRouterParam(event, 'id')

    const body = await readBody(event)
    const validation = updateProductSchema.safeParse(body)

    if (!validation.success) {
        throw createError({ statusCode: 400, statusMessage: 'Validation Failed', data: validation.error.flatten() })
    }

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
