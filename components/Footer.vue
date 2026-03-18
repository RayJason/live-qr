<script setup lang="ts">
import LanguageSwitcher from './LanguageSwitcher.vue'

const { t } = useI18n()
</script>

<template>
  <footer class="border-t bg-background py-6 mt-auto">
    <div class="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <a href="https://refactor-x.com" target="_blank" class="text-xs text-muted-foreground">
            {{ t('footer.designedBy') }}
        </a>
        <p class="text-xs text-muted-foreground">
            {{ t('footer.copyright', { year: new Date().getFullYear() }) }}
        </p>
        <div class="flex items-center gap-4">
            <LanguageSwitcher />
        </div>
    </div>
  </footer>
</template>
