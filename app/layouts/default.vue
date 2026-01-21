<script setup lang="ts">
import { QrCodeIcon } from "lucide-vue-next";
const { status, signIn, signOut } = useAuth();

const handleLogin = () => signIn("google");
const handleLogout = () => signOut();
</script>

<template>
  <div
    class="flex min-h-screen flex-col bg-background font-sans text-foreground"
  >
    <!-- Header -->
    <header
      class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div class="container flex h-14 max-w-screen-2xl items-center">
        <div class="mr-4 flex">
          <NuxtLink to="/" class="mr-6 flex items-center space-x-2">
            <QrCodeIcon class="h-6 w-6" />
            <span class="hidden font-bold sm:inline-block"> Anti-Lost </span>
          </NuxtLink>
        </div>
        <div class="flex flex-1 items-center justify-end space-x-2">
          <nav class="flex items-center space-x-2">
            <template v-if="status === 'authenticated'">
              <NuxtLink to="/dashboard">
                <UiButton variant="ghost" size="sm">Dashboard</UiButton>
              </NuxtLink>
              <UiButton variant="ghost" size="sm" @click="handleLogout"
                >Logout</UiButton
              >
            </template>
            <template v-else>
              <UiButton variant="default" size="sm" @click="handleLogin"
                >Login</UiButton
              >
            </template>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="py-6 md:px-8 md:py-0">
      <div
        class="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row"
      >
        <p
          class="text-center text-sm leading-loose text-muted-foreground md:text-left"
        >
          Built by Antigravity.
        </p>
      </div>
    </footer>
  </div>
</template>
