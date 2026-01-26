import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            feishuWebhookUrl: true,
        }
    })

    if (!dbUser) {
        throw createError({ statusCode: 404, message: 'User not found' })
    }

    return dbUser
})
