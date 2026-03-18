<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-vue-next'

const { locale, setLocale, locales, t } = useI18n()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="rounded-full"
        :aria-label="t('language.switcherLabel')"
        :title="t('language.switcherLabel')"
      >
        <Globe class="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        v-for="l in (locales as any[])"
        :key="l.code"
        @click="setLocale(l.code)"
      >
        {{ l.name || l.code }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
