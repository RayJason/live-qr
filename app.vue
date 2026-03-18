<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'

const { locale } = useI18n()

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
  },
}))
</script>

<template>
  <div class="min-h-screen bg-background font-sans antialiased">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster richColors position="top-center" />
  </div>
</template>
