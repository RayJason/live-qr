<script setup lang="ts">
import { Button } from '@/components/ui/button'

const { status, signIn, signOut, data: session } = useAuth()

const handleLogin = () => {
  signIn('google', { callbackUrl: '/dashboard' })
}

const handleLogout = () => {
  signOut({ callbackUrl: '/' })
}
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-14 items-center">
      <div class="mr-4 hidden md:flex">
        <NuxtLink to="/" class="mr-6 flex items-center space-x-2">
          <span class="hidden font-bold sm:inline-block">Anti-Lost QR</span>
        </NuxtLink>
        <nav class="flex items-center space-x-6 text-sm font-medium">
          <NuxtLink to="/dashboard" class="transition-colors hover:text-foreground/80 text-foreground/60">
            Dashboard
          </NuxtLink>
        </nav>
      </div>
      <div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        <div class="w-full flex-1 md:w-auto md:flex-none">
          <!-- Search or other controls could go here -->
        </div>
        <nav class="flex items-center space-x-2">
          <template v-if="status === 'authenticated'">
            <div class="text-sm text-muted-foreground mr-2">
              {{ session?.user?.name }}
            </div>
            <Button variant="ghost" @click="handleLogout">
              Sign Out
            </Button>
          </template>
          <template v-else>
            <Button @click="handleLogin">
              Sign In with Google
            </Button>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>
