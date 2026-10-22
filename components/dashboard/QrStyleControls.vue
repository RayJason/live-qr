<script setup lang="ts">
import { computed, useId } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import AdvancedQrCode from '@/components/AdvancedQrCode.vue'
import QrColorInput from './QrColorInput.vue'
import { applyQrStylePreset, cornerStyles, createQrOptions, dotStyles, matchesQrStylePreset, qrStylePresets, type QrCustomization, type QrDesign } from '@/lib/qr-design'

const { t } = useI18n()

const props = defineProps<{ modelValue: QrCustomization & { design: QrDesign } }>()
const emit = defineEmits<{ 'update:modelValue': [value: QrCustomization & { design: QrDesign }] }>()
const id = useId()
const thumbnails = qrStylePresets.map(preset => ({
  ...preset,
  options: createQrOptions({ type: 'STICKER', dotsColor: '#000000', cornerColor: '#000000',
    backgroundColor: '#ffffff', logoUrl: '', customText: '', design: preset.design }, 'QR', 160),
}))
const selectedPreset = computed(() => qrStylePresets.find(preset => matchesQrStylePreset(props.modelValue.design, preset))?.id)
const customPatterns = [{ value: 'horizontal' }, { value: 'vertical' }] as const

function updateDesign(patch: Partial<QrDesign>) {
  emit('update:modelValue', { ...props.modelValue, design: { ...props.modelValue.design, ...patch } })
}

function selectPreset(preset: typeof qrStylePresets[number]) {
  emit('update:modelValue', applyQrStylePreset(props.modelValue, preset))
}
</script>

<template>
  <div class="space-y-5">
    <fieldset class="min-w-0 space-y-2">
      <legend class="text-sm font-medium">{{ t('customizer.styles') }}</legend>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] gap-2">
        <button
          v-for="preset in thumbnails" :key="preset.id" type="button" :title="t('customizer.presetTitle', { description: t(`customizer.presetDescriptions.${preset.id}`) })"
          :aria-pressed="selectedPreset === preset.id"
          class="flex min-w-0 flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :class="selectedPreset === preset.id ? 'border-primary bg-primary/5' : 'border-input'"
          @click="selectPreset(preset)"
        >
          <AdvancedQrCode data="QR" :options="preset.options" :pattern="preset.design.pattern" class="w-20 bg-white" aria-hidden="true" />
          <span class="font-medium">{{ t(`customizer.presetNames.${preset.id}`) }}</span>
          <span class="text-center text-xs leading-relaxed text-muted-foreground">{{ t(`customizer.presetDescriptions.${preset.id}`) }}</span>
        </button>
      </div>
      <p class="text-xs text-muted-foreground">{{ t('customizer.styleHint') }}</p>
    </fieldset>

    <fieldset class="min-w-0 space-y-2">
      <legend class="text-xs font-medium">{{ t('customizer.dotsShape') }}</legend>
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="style in dotStyles" :key="style.value" type="button" variant="outline" size="sm"
          :title="t('customizer.shapeTitle', { shape: t(`customizer.shapes.${style.value}`) })" :aria-pressed="modelValue.design.pattern === 'standard' && modelValue.design.dotsType === style.value"
          :class="modelValue.design.pattern === 'standard' && modelValue.design.dotsType === style.value ? 'border-primary bg-primary/5 text-primary' : ''"
          @click="updateDesign({ dotsType: style.value, pattern: 'standard' })"
        >{{ t(`customizer.shapes.${style.value}`) }}</Button>
        <Button v-for="pattern in customPatterns" :key="pattern.value" type="button" variant="outline" size="sm"
          :title="t('customizer.shapeTitle', { shape: t(`customizer.shapes.${pattern.value}`) })" :aria-pressed="modelValue.design.pattern === pattern.value"
          :class="modelValue.design.pattern === pattern.value ? 'border-primary bg-primary/5 text-primary' : ''"
          @click="updateDesign({ dotsType: 'square', pattern: pattern.value })">{{ t(`customizer.shapes.${pattern.value}`) }}</Button>
      </div>
    </fieldset>

    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <Label :for="`${id}-outer`" class="text-xs">{{ t('customizer.outer') }}</Label>
        <select :id="`${id}-outer`" class="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :value="modelValue.design.cornerSquareType"
          @change="updateDesign({ cornerSquareType: ($event.target as HTMLSelectElement).value as QrDesign['cornerSquareType'] })">
          <option v-for="style in cornerStyles" :key="style.value" :value="style.value">{{ t(`customizer.shapes.${style.value}`) }}</option>
        </select>
      </div>
      <div class="space-y-2">
        <Label :for="`${id}-inner`" class="text-xs">{{ t('customizer.inner') }}</Label>
        <select :id="`${id}-inner`" class="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :value="modelValue.design.cornerDotType"
          @change="updateDesign({ cornerDotType: ($event.target as HTMLSelectElement).value as QrDesign['cornerDotType'] })">
          <option value="square">{{ t('customizer.shapes.square') }}</option><option value="dot">{{ t('customizer.shapes.dot') }}</option>
        </select>
      </div>
    </div>

    <div class="space-y-2">
      <Label :for="`${id}-fill`" class="text-xs">{{ t('customizer.fill') }}</Label>
      <select :id="`${id}-fill`" class="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :value="modelValue.design.gradientType"
        @change="updateDesign({ gradientType: ($event.target as HTMLSelectElement).value as QrDesign['gradientType'] })">
        <option value="solid">{{ t('customizer.solid') }}</option><option value="linear">{{ t('customizer.linear') }}</option><option value="radial">{{ t('customizer.radial') }}</option>
      </select>
    </div>
    <template v-if="modelValue.design.gradientType !== 'solid'">
      <QrColorInput :model-value="modelValue.design.gradientColor" :label="t('customizer.gradientColor')" @update:model-value="updateDesign({ gradientColor: $event })" />
      <div v-if="modelValue.design.gradientType === 'linear'" class="space-y-2">
        <Label :for="`${id}-rotation`" class="text-xs">{{ t('customizer.rotation') }} · {{ modelValue.design.gradientRotation }}°</Label>
        <input :id="`${id}-rotation`" type="range" min="0" max="360" step="15" class="w-full accent-primary"
          :value="modelValue.design.gradientRotation"
          @input="updateDesign({ gradientRotation: Number(($event.target as HTMLInputElement).value) })" />
      </div>
    </template>
  </div>
</template>
