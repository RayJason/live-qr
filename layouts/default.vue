<script setup lang="ts">
import Footer from '@/components/Footer.vue'
// Default layout
</script>

<template>
  <div class="relative flex min-h-screen flex-col">
    <Header />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
  </div>
</template>
