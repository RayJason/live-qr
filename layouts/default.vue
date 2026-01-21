<script setup lang="ts">
// Default layout
</script>

<template>
  <div class="relative flex min-h-screen flex-col">
    <Header />
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
