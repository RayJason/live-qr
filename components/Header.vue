<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Settings, LogOut } from 'lucide-vue-next'

const { status, signIn, signOut, data: session, getSession } = useAuth()

const profileDialogOpen = ref(false)

const handleLogin = () => {
  signIn('google', { callbackUrl: '/dashboard' })
}

const handleLogout = () => {
  signOut({ callbackUrl: '/' })
}

const openProfileSettings = () => {
  profileDialogOpen.value = true
}

// Refresh session when profile is saved to update displayed name
const handleProfileSaved = async () => {
  await getSession({ force: true })
}

const userInitials = computed(() => {
  const name = session.value?.user?.name || ''
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
})
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
          <ClientOnly>
            <template v-if="status === 'authenticated'">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" class="relative h-9 px-2 hover:bg-accent">
                    <Avatar class="h-7 w-7 mr-2">
                      <AvatarImage :src="session?.user?.image || ''" :alt="session?.user?.name || ''" />
                      <AvatarFallback class="text-xs">{{ userInitials }}</AvatarFallback>
                    </Avatar>
                    <span class="hidden sm:inline-block text-sm font-medium">{{ session?.user?.name }}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-56" align="end">
                  <DropdownMenuLabel class="font-normal">
                    <div class="flex flex-col space-y-1">
                      <p class="text-sm font-medium leading-none">{{ session?.user?.name }}</p>
                      <p class="text-xs leading-none text-muted-foreground">{{ session?.user?.email }}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="openProfileSettings" class="cursor-pointer">
                    <Settings class="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="handleLogout" class="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut class="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <!-- Profile Settings Dialog -->
              <ProfileSettingsDialog 
                v-model:open="profileDialogOpen" 
                :show-trigger="false" 
                @saved="handleProfileSaved"
              />
            </template>
            <template v-else-if="status === 'unauthenticated'">
              <Button @click="handleLogin">
                Sign In with Google
              </Button>
            </template>
          </ClientOnly>
        </nav>
      </div>
    </div>
  </header>
</template>

