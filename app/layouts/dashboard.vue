<script setup lang="ts">
import {
  LayoutDashboardIcon,
  LogOutIcon,
  PackageIcon,
  QrCodeIcon,
  SettingsIcon,
} from "lucide-vue-next";

const { signOut, data } = useAuth();

const handleLogout = () => signOut({ callbackUrl: "/" });

const links = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboardIcon },
  { name: "Products", href: "/dashboard/products/new", icon: PackageIcon }, // Direct to new as simple start
];
</script>

<template>
  <div
    class="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
  >
    <div class="hidden border-r bg-muted/40 md:block">
      <div class="flex h-full max-h-screen flex-col gap-2">
        <div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <NuxtLink to="/" class="flex items-center gap-2 font-semibold">
            <QrCodeIcon class="h-6 w-6" />
            <span class="">Anti-Lost</span>
          </NuxtLink>
        </div>
        <div class="flex-1">
          <nav class="grid items-start px-2 text-sm font-medium lg:px-4">
            <NuxtLink
              v-for="link in links"
              :key="link.href"
              :to="link.href"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              active-class="bg-muted text-primary"
            >
              <component :is="link.icon" class="h-4 w-4" />
              {{ link.name }}
            </NuxtLink>
          </nav>
        </div>
        <div class="mt-auto p-4">
          <div
            v-if="data?.user"
            class="flex items-center gap-2 mb-4 px-2 text-sm"
          >
            <UiAvatar class="h-8 w-8">
              <UiAvatarImage
                :src="data.user.image || ''"
                :alt="data.user.name || ''"
              />
              <UiAvatarFallback>{{
                data.user.name?.[0] || "U"
              }}</UiAvatarFallback>
            </UiAvatar>
            <div class="grid gap-0.5">
              <span class="font-medium">{{ data.user.name }}</span>
              <span
                class="text-xs text-muted-foreground truncate max-w-[140px]"
                >{{ data.user.email }}</span
              >
            </div>
          </div>
          <UiButton
            size="sm"
            variant="outline"
            class="w-full justify-start gap-2"
            @click="handleLogout"
          >
            <LogOutIcon class="h-4 w-4" />
            Logout
          </UiButton>
        </div>
      </div>
    </div>
    <div class="flex flex-col">
      <header
        class="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden"
      >
        <NuxtLink to="/" class="flex items-center gap-2 font-semibold">
          <QrCodeIcon class="h-6 w-6" />
          <span class="">Anti-Lost</span>
        </NuxtLink>
        <div class="ml-auto w-full flex-1">
          <!-- Mobile Header Content -->
        </div>
        <UiButton size="icon" variant="ghost" @click="handleLogout">
          <LogOutIcon class="h-5 w-5" />
        </UiButton>
      </header>
      <main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
