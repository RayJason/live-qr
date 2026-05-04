import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    
    // Public access, no session check needed
    // But we should limit fields exposed
    const product = await prisma.product.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            type: true,
            status: true,
            description: true,
            contactEmail: true,
            contactPhone: true,
            lostMessage: true,
            showContactWhenSafe: true,
            qrCustomText: true,
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
