import prisma from '~/server/utils/prisma'
import { z } from 'zod'

const createProductSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50),
    description: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    feishuWebhookUrl: z.string().optional(),
    type: z.enum(['STICKER', 'KEYCHAIN', 'LUGGAGE_TAG', 'SNOWBOARD_STICKER', 'BOARDING_PASS']).optional().default('STICKER'),
    qrDotsColor: z.string().optional(),
    qrCornerColor: z.string().optional(),
    qrBackgroundColor: z.string().optional(),
    qrLogoUrl: z.string().optional(),
    qrCustomText: z.string().optional(),
})

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)

    const body = await readBody(event)
    const validation = createProductSchema.safeParse(body)

    if (!validation.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Validation Failed',
            data: validation.error.flatten()
        })
    }

    const d = validation.data
    const product = await prisma.product.create({
        data: {
            name: d.name,
            description: d.description || null,
            contactEmail: d.contactEmail || null,
            contactPhone: d.contactPhone || null,
            feishuWebhookUrl: d.feishuWebhookUrl || null,
            type: d.type,
            qrDotsColor: d.qrDotsColor || null,
            qrCornerColor: d.qrCornerColor || null,
            qrBackgroundColor: d.qrBackgroundColor || null,
            qrLogoUrl: d.qrLogoUrl || null,
            qrCustomText: d.qrCustomText || null,
            userId: user.id,
            status: 'NORMAL'
        }
    })

    return product
})
