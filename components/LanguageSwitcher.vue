<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-vue-next'

const { locale, setLocale, locales } = useI18n()

// Helper to get locale name (simplified)
const currentLocaleName = computed(() => {
   const current = locales.value.find((l: any) => l.code === locale.value)
   return current ? current.name || current.code : locale.value
})
</script>

<template>
   <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" class="rounded-full">
        <Globe class="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
        <DropdownMenuItem v-for="l in (locales as any[])" :key="l.code" @click="setLocale(l.code)">
            {{ l.name || l.code }}
        </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
