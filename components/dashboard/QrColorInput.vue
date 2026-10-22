<script setup lang="ts">
import { computed, useId } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  label: string
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const id = useId()
const hexColor = computed(() => /^#[\da-f]{6}([\da-f]{2})?$/i.test(props.modelValue)
  ? props.modelValue.slice(0, 7)
  : '#000000')
const alpha = computed(() => /^#[\da-f]{8}$/i.test(props.modelValue)
  ? props.modelValue.slice(7)
  : 'ff')
const opacity = computed(() => Math.round(parseInt(alpha.value, 16) / 255 * 100))

function updateColor(event: Event) {
  const color = (event.target as HTMLInputElement).value
  emit('update:modelValue', alpha.value === 'ff' ? color : `${color}${alpha.value}`)
}

function updateOpacity(event: Event) {
  const percent = Number((event.target as HTMLInputElement).value)
  const nextAlpha = Math.round(percent / 100 * 255).toString(16).padStart(2, '0')
  emit('update:modelValue', percent === 100 ? hexColor.value : `${hexColor.value}${nextAlpha}`)
}
</script>

<template>
  <div class="space-y-2">
    <Label :for="`${id}-hex`" class="text-xs">{{ label }}</Label>
    <div class="flex gap-2 items-center">
      <input
        type="color"
        :value="hexColor"
        :aria-label="label"
        class="w-9 h-9 shrink-0 rounded-lg border cursor-pointer"
        @input="updateColor"
      />
      <Input
        :id="`${id}-hex`"
        :model-value="modelValue"
        class="h-9 min-w-0 text-sm font-mono"
        @update:model-value="emit('update:modelValue', String($event))"
      />
    </div>
    <div class="flex items-center gap-3">
      <Label :for="`${id}-opacity`" class="shrink-0 text-xs text-muted-foreground">不透明度</Label>
      <input
        :id="`${id}-opacity`"
        type="range"
        min="0"
        max="100"
        step="1"
        :value="opacity"
        :aria-label="`${label}不透明度`"
        :aria-valuetext="`${opacity}%`"
        class="min-w-0 flex-1 accent-primary"
        @input="updateOpacity"
      />
      <output :for="`${id}-opacity`" class="w-10 text-right text-xs tabular-nums text-muted-foreground">{{ opacity }}%</output>
    </div>
  </div>
</template>
