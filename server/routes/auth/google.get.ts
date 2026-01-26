import prisma from '~/server/utils/prisma'

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    // Find or create user in database
    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        image: user.picture
      },
      create: {
        email: user.email,
        name: user.name,
        image: user.picture
      }
    })

    await setUserSession(event, {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.image
      }
    })

    return sendRedirect(event, '/dashboard')
  },
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/?error=auth')
  }
})
