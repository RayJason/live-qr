import prisma from '~/server/utils/prisma'
import { z } from 'zod'

const createOrderSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(100).default(1),
    size: z.string().optional(),
    recipientName: z.string().min(1, '收件人姓名必填'),
    address: z.string().min(1, '收件地址必填'),
    phone: z.string().min(1, '联系电话必填'),
    notes: z.string().optional(),
})

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)

    const body = await readBody(event)
    const validation = createOrderSchema.safeParse(body)

    if (!validation.success) {
        throw createError({ statusCode: 400, statusMessage: 'Validation Failed', data: validation.error.flatten() })
    }

    const d = validation.data

    // Verify product belongs to user
    const product = await prisma.product.findFirst({
        where: { id: d.productId, userId: user.id }
    })
    if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })

    const order = await prisma.order.create({
        data: {
            productId: d.productId,
            userId: user.id,
            quantity: d.quantity,
            size: d.size || null,
            recipientName: d.recipientName,
            address: d.address,
            phone: d.phone,
            notes: d.notes || null,
        }
    })

    return order
})
