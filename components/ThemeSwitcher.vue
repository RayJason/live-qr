<script setup lang="ts">
import { Monitor, Moon, Sun, Check } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const { t } = useI18n()
const colorMode = useColorMode()
const modes = [
  { value: 'system', icon: Monitor },
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
] as const
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" class="rounded-full"
        :title="t('theme.label')" :aria-label="t('theme.label')">
        <Sun class="h-4 w-4 dark:hidden" />
        <Moon class="hidden h-4 w-4 dark:block" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem v-for="mode in modes" :key="mode.value"
        @click="colorMode.preference = mode.value">
        <component :is="mode.icon" class="mr-2 h-4 w-4" />
        {{ t(`theme.${mode.value}`) }}
        <ClientOnly>
          <Check v-if="colorMode.preference === mode.value" class="ml-auto h-4 w-4" />
        </ClientOnly>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
