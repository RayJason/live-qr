import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const reportSchema = z.object({
  productId: z.string(),
  finderContact: z.string().min(1, 'Contact info is required'),
  message: z.string().optional()
})

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const validation = reportSchema.safeParse(body)
    
    if (!validation.success) {
        throw createError({ statusCode: 400, statusMessage: 'Validation Failed', data: validation.error.flatten() })
    }
    
    const { productId, finderContact, message } = validation.data
    
    // Verify product exists and get owner/webhook info
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { user: true }
    })
    
    if (!product) {
         throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    }
    
    // Save Report
    const report = await prisma.report.create({
        data: {
            productId,
            finderContact,
            message
        }
    })
    
    // Send Notification (Feishu)
    // Use product-specific webhook if set, otherwise use env default (system admin channel)
    const webhookUrl = product.feishuWebhookUrl || process.env.FEISHU_WEBHOOK_URL
    
    if (webhookUrl) {
        try {
            await $fetch(webhookUrl, {
                method: 'POST',
                body: {
                    msg_type: 'interactive',
                    card: {
                        config: { wide_screen_mode: true },
                        header: {
                            title: {
                                tag: 'plain_text',
                                content: `🚨 Item Found: ${product.name}`
                            },
                            template: 'red'
                        },
                        elements: [
                            {
                                tag: 'div',
                                text: {
                                    tag: 'lark_md',
                                    content: `**Finder Contact:** ${finderContact}\n**Message:** ${message || 'No message'}\n**Product Status:** ${product.status}`
                                }
                            },
                            {
                                tag: 'action',
                                actions: [
                                    {
                                        tag: 'button',
                                        text: { tag: 'plain_text', content: 'View Dashboard' },
                                        type: 'primary',
                                        url: `${process.env.AUTH_ORIGIN}/dashboard/products/${product.id}`
                                    }
                                ]
                            }
                        ]
                    }
                }
            })
        } catch (e) {
            console.error('Failed to send Feishu notification', e)
        }
    }
    
    return { success: true, reportId: report.id }
})
