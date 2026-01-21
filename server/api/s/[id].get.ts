import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    
    // Public access, no session check needed
    // But we should limit fields exposed
    const product = await prisma.product.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            status: true,
            description: true,
            contactInfo: true, // Only show if LOST theoretically? Or always?
            lostMessage: true,
            user: {
                select: {
                    name: true // "This item belongs to Ray"
                    // Do NOT expose user email
                }
            }
        }
    })
    
    if (!product) {
        throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    }
    
    return product
})
