import prisma from '~/server/utils/prisma'
import { z } from 'zod'
import { qrColorSchema, qrDesignSchema } from '~/lib/qr-design'

const createProductSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50),
    description: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    feishuWebhookUrl: z.string().optional(),
    type: z.enum(['STICKER', 'KEYCHAIN', 'LUGGAGE_TAG', 'SNOWBOARD_STICKER', 'BOARDING_PASS']).optional().default('STICKER'),
    qrDotsColor: qrColorSchema.or(z.literal('')).optional(),
    qrCornerColor: qrColorSchema.or(z.literal('')).optional(),
    qrBackgroundColor: qrColorSchema.or(z.literal('')).optional(),
    qrLogoUrl: z.string().optional(),
    qrCustomText: z.string().optional(),
    qrStyle: qrDesignSchema.optional(),
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
            qrStyle: d.qrStyle,
            userId: user.id,
            status: 'NORMAL'
        }
    })

    return product
})
