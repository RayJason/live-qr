<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import QRCodeStyling from 'qr-code-styling'
import type { Options, DotType, CornerSquareType, CornerDotType } from 'qr-code-styling'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  qrPresets,
  productTypeLabels,
  sizeOptions,
  type ProductTypeKey,
} from '@/lib/qr-presets'
import { Upload, RefreshCw } from 'lucide-vue-next'

const props = defineProps<{
  productId?: string
  modelValue?: {
    type: ProductTypeKey
    dotsColor: string
    cornerColor: string
    backgroundColor: string
    logoUrl: string
    customText: string
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: typeof props.modelValue]
}>()

const selectedType = ref<ProductTypeKey>(props.modelValue?.type || 'STICKER')
const dotsColor = ref(props.modelValue?.dotsColor || qrPresets.STICKER.dotsColor)
const cornerColor = ref(props.modelValue?.cornerColor || qrPresets.STICKER.cornerColor)
const backgroundColor = ref(props.modelValue?.backgroundColor || qrPresets.STICKER.backgroundColor)
const logoUrl = ref(props.modelValue?.logoUrl || '')
const customText = ref(props.modelValue?.customText || '')

const qrContainer = ref<HTMLElement>()
const qrCode = ref<QRCodeStyling>()
const previewUrl = ref('')

const preset = computed(() => qrPresets[selectedType.value])

const qrData = computed(() => {
  if (!props.productId) return 'https://anti-lost.app/s/preview'
  return `${window.location.origin}/s/${props.productId}`
})

const qrOptions = computed<Options>(() => ({
  width: preset.value.width,
  height: preset.value.height,
  type: 'canvas' as const,
  data: qrData.value,
  image: logoUrl.value || undefined,
  margin: 10,
  qrOptions: {
    typeNumber: 0 as const,
    mode: 'Byte',
    errorCorrectionLevel: logoUrl.value ? 'H' : 'M',
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.35,
    margin: 8,
    crossOrigin: 'anonymous',
  },
  dotsOptions: {
    color: dotsColor.value,
    type: preset.value.dotsType,
  },
  backgroundOptions: {
    color: backgroundColor.value,
  },
  cornersSquareOptions: {
    color: cornerColor.value,
    type: preset.value.cornerSquareType,
  },
  cornersDotOptions: {
    color: cornerColor.value,
    type: preset.value.cornerDotType,
  },
}))

function renderQr() {
  if (!qrContainer.value || !process.client) return
  if (qrCode.value) {
    qrCode.value.update(qrOptions.value)
  } else {
    qrCode.value = new QRCodeStyling(qrOptions.value)
    qrCode.value.append(qrContainer.value)
  }
}

function selectType(type: ProductTypeKey) {
  selectedType.value = type
  const p = qrPresets[type]
  dotsColor.value = p.dotsColor
  cornerColor.value = p.cornerColor
  backgroundColor.value = p.backgroundColor
  emitUpdate()
}

function emitUpdate() {
  emit('update:modelValue', {
    type: selectedType.value,
    dotsColor: dotsColor.value,
    cornerColor: cornerColor.value,
    backgroundColor: backgroundColor.value,
    logoUrl: logoUrl.value,
    customText: customText.value,
  })
}

function handleLogoUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    logoUrl.value = reader.result as string
    nextTick(renderQr)
    emitUpdate()
  }
  reader.readAsDataURL(file)
}

function resetToPreset() {
  dotsColor.value = preset.value.dotsColor
  cornerColor.value = preset.value.cornerColor
  backgroundColor.value = preset.value.backgroundColor
  renderQr()
  emitUpdate()
}

watch([dotsColor, cornerColor, backgroundColor, logoUrl], () => {
  nextTick(renderQr)
}, { deep: true })

watch(selectedType, () => {
  nextTick(renderQr)
})

onMounted(() => {
  nextTick(renderQr)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Type Selector -->
    <div>
      <Label class="text-sm font-medium mb-3 block">选择品类</Label>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <button
          v-for="(preset, key) in qrPresets"
          :key="key"
          type="button"
          class="relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-left"
          :class="selectedType === key
            ? 'border-primary bg-primary/5 shadow-sm'
            : 'border-muted hover:border-primary/30 hover:bg-muted/30'"
          @click="selectType(key as ProductTypeKey)"
        >
          <span class="text-2xl">{{ preset.icon }}</span>
          <span class="text-xs font-semibold leading-tight text-center">{{ preset.label }}</span>
        </button>
      </div>
      <p class="text-xs text-muted-foreground mt-2">
        {{ preset.description }}
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Preview -->
      <div class="flex flex-col items-center gap-4 p-6 bg-muted/30 rounded-xl border">
        <div class="bg-white p-4 rounded-lg shadow-sm border" :style="{
          width: `${preset.width + 32}px`,
          height: `${preset.height + 32}px`,
        }">
          <div ref="qrContainer" class="flex items-center justify-center" />
        </div>
        <p class="text-xs text-muted-foreground">
          {{ preset.label }} · 建议尺寸 {{ preset.suggestedSize }}
        </p>
      </div>

      <!-- Controls -->
      <div class="space-y-4">
        <!-- Custom Text -->
        <div class="space-y-2">
          <Label class="text-xs">个性签名</Label>
          <Input
            v-model="customText"
            placeholder="如：Ray 的雪板 🏂"
            class="h-9 text-sm"
            @update:model-value="emitUpdate"
          />
        </div>

        <!-- Colors -->
        <div class="space-y-2">
          <Label class="text-xs">码点颜色</Label>
          <div class="flex gap-2 items-center">
            <input
              v-model="dotsColor"
              type="color"
              class="w-9 h-9 rounded-lg border cursor-pointer"
              @change="emitUpdate"
            />
            <Input v-model="dotsColor" class="h-9 text-sm font-mono" @update:model-value="emitUpdate" />
          </div>
        </div>

        <div class="space-y-2">
          <Label class="text-xs">定位角颜色</Label>
          <div class="flex gap-2 items-center">
            <input
              v-model="cornerColor"
              type="color"
              class="w-9 h-9 rounded-lg border cursor-pointer"
              @change="emitUpdate"
            />
            <Input v-model="cornerColor" class="h-9 text-sm font-mono" @update:model-value="emitUpdate" />
          </div>
        </div>

        <div class="space-y-2">
          <Label class="text-xs">背景颜色</Label>
          <div class="flex gap-2 items-center">
            <input
              v-model="backgroundColor"
              type="color"
              class="w-9 h-9 rounded-lg border cursor-pointer"
              @change="emitUpdate"
            />
            <Input v-model="backgroundColor" class="h-9 text-sm font-mono" @update:model-value="emitUpdate" />
          </div>
        </div>

        <!-- Logo -->
        <div class="space-y-2">
          <Label class="text-xs">中心 Logo（可选）</Label>
          <div class="flex gap-2">
            <Button type="button" variant="outline" size="sm" class="h-9" as-child>
              <label class="cursor-pointer flex items-center gap-1">
                <Upload class="h-3 w-3" />
                <span>{{ logoUrl ? '更换' : '上传' }}</span>
                <input type="file" accept="image/*" class="hidden" @change="handleLogoUpload" />
              </label>
            </Button>
            <Button
              v-if="logoUrl"
              type="button"
              variant="ghost"
              size="sm"
              class="h-9 text-xs"
              @click="logoUrl = ''; nextTick(renderQr); emitUpdate()"
            >
              清除
            </Button>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="text-xs"
          @click="resetToPreset"
        >
          <RefreshCw class="h-3 w-3 mr-1" />
          恢复预设
        </Button>
      </div>
    </div>
  </div>
</template>
