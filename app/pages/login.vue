<script setup lang="ts">
definePageMeta({
  layout: 'default',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/dashboard',
  },
})

const { signIn } = useAuth()

const handleLogin = () => {
  signIn('google', { callbackUrl: '/dashboard' })
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-14rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-muted-foreground">
          Or
          <NuxtLink to="/" class="font-medium text-primary hover:text-primary/90">
            return to home
          </NuxtLink>
        </p>
      </div>
      <div class="mt-8 space-y-6">
        <UiButton class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" @click="handleLogin">
          Sign in with Google
        </UiButton>
      </div>
    </div>
  </div>
</template>
