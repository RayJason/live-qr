import { getServerSession } from '#auth'
import prisma from '~/server/utils/prisma'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  description: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
})

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    
    if (!session || !session.user || !session.user.email) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }
    
    const body = await readBody(event)
    const validation = createProductSchema.safeParse(body)
    
    if (!validation.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Validation Failed',
            data: validation.error.flatten()
        })
    }
    
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })
    
    if (!user) {
         throw createError({
            statusCode: 401,
            statusMessage: 'User not found'
        })
    }
    
    const product = await prisma.product.create({
        data: {
            name: validation.data.name,
            description: validation.data.description,
            contactEmail: validation.data.contactEmail || null,
            contactPhone: validation.data.contactPhone || null,
            userId: user.id,
            status: 'NORMAL'
        }
    })
    
    return product
})
