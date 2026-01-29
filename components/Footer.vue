<script setup lang="ts">
import LanguageSwitcher from './LanguageSwitcher.vue'
</script>

<template>
  <footer class="border-t bg-background py-6 mt-auto">
    <div class="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <a href="https://refactor-x.com" target="_blank" class="text-xs text-muted-foreground">
            Designed by RefactorX
        </a>
        <p class="text-xs text-muted-foreground">
            &copy; {{ new Date().getFullYear() }} Anti-Lost. Open Source Project.
        </p>
        <div class="flex items-center gap-4">
            <LanguageSwitcher />
        </div>
    </div>
  </footer>
</template>
