<script setup lang="ts">
import { computed, nextTick, shallowRef, useId, useTemplateRef } from 'vue'
import { Upload, RefreshCw, Download, Copy } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useClipboard } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AdvancedQrCode from '@/components/AdvancedQrCode.vue'
import QrColorInput from './QrColorInput.vue'
import QrStyleControls from './QrStyleControls.vue'
import { qrPresets, type ProductTypeKey } from '@/lib/qr-presets'
import { createQrOptions, defaultQrDesign, qrColorSchema, qrDesignSchema, type QrCustomization } from '@/lib/qr-design'

const { t } = useI18n()

const props = defineProps<{ productId?: string }>()
const model = defineModel<QrCustomization>({ default: () => ({
  type: 'STICKER', dotsColor: '', cornerColor: '', backgroundColor: '', logoUrl: '', customText: '',
}) })
const id = useId()
const origin = useRequestURL().origin
const qrData = computed(() => `${origin}/s/${props.productId || 'preview'}`)
const preset = computed(() => qrPresets[model.value.type])
const customization = computed(() => ({
  ...model.value,
  dotsColor: model.value.dotsColor || preset.value.dotsColor,
  cornerColor: model.value.cornerColor || preset.value.cornerColor,
  backgroundColor: model.value.backgroundColor || preset.value.backgroundColor,
  design: model.value.design ?? defaultQrDesign(model.value.type),
}))
const validColors = computed(() => [customization.value.dotsColor, customization.value.cornerColor, customization.value.backgroundColor]
  .every(color => qrColorSchema.safeParse(color).success))
const validDesign = computed(() => validColors.value && qrDesignSchema.safeParse(customization.value.design).success)
const options = computed(() => createQrOptions(customization.value, qrData.value))
const preview = useTemplateRef<InstanceType<typeof AdvancedQrCode>>('preview')
const logoInput = useTemplateRef<HTMLInputElement>('logoInput')
const ready = shallowRef(false)
const downloading = shallowRef(false)
const uploading = shallowRef(false)
const renderError = shallowRef('')
const logoError = shallowRef('')
const { copy } = useClipboard({ legacy: true })

function update(patch: Partial<QrCustomization>) {
  model.value = { ...customization.value, ...patch }
}

function selectType(type: ProductTypeKey) {
  const defaults = qrPresets[type]
  update({ type, dotsColor: defaults.dotsColor, cornerColor: defaults.cornerColor,
    backgroundColor: defaults.backgroundColor, design: defaultQrDesign(type) })
}

async function handleLogoUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  logoError.value = ''
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
    logoError.value = 'customizer.logoInvalid'
    return
  }
  uploading.value = true
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error(t('customizer.readError')))
      reader.onerror = () => reject(new Error(t('customizer.readError')))
      reader.readAsDataURL(file)
    })
    const image = new Image()
    image.src = dataUrl
    await image.decode()
    update({ logoUrl: dataUrl })
  } catch {
    logoError.value = 'customizer.logoError'
  } finally {
    uploading.value = false
  }
}

async function download(extension: 'png' | 'svg') {
  downloading.value = true
  try {
    await nextTick()
    const success = await preview.value?.download(extension, `qr-${props.productId || 'preview'}`)
    if (!success) throw new Error(t('customizer.notReady'))
    toast.success(t('customizer.downloaded', { format: extension.toUpperCase() }))
  } catch {
    toast.error(t('customizer.downloadError'))
  } finally {
    downloading.value = false
  }
}

async function copyLink() {
  try {
    await copy(qrData.value)
    toast.success(t('customizer.copied'))
  } catch {
    toast.error(t('customizer.copyError'))
  }
}

function setReady(value: boolean) {
  ready.value = value
  renderError.value = ''
}
</script>

<template>
  <div class="qr-customizer min-w-0 grid items-start gap-6">
    <fieldset class="qr-categories min-w-0 space-y-2 lg:col-span-2">
      <legend class="text-sm font-medium">{{ t('customizer.category') }}</legend>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,7rem),1fr))] gap-2">
        <button v-for="(item, key) in qrPresets" :key="key" type="button"
          :title="t(`customizer.categories.${key}`)" :aria-pressed="customization.type === key"
          class="flex min-w-0 flex-col items-center gap-1 rounded-xl border-2 p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :class="customization.type === key ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/30 hover:bg-muted/30'"
          @click="selectType(key)">
          <span class="text-2xl" aria-hidden="true">{{ item.icon }}</span>
          <span class="text-center text-xs font-semibold leading-tight">{{ t(`customizer.categories.${key}`) }}</span>
        </button>
      </div>
      <p class="text-xs text-muted-foreground">{{ t(`customizer.descriptions.${customization.type}`) }}</p>
    </fieldset>

    <div class="qr-preview min-w-0 space-y-3 rounded-xl border bg-muted/30 p-4">
      <div class="mx-auto w-full max-w-[320px] overflow-hidden rounded-lg bg-white [color-scheme:light]">
        <AdvancedQrCode v-if="validDesign" ref="preview" :data="qrData" :options="options" :pattern="customization.design.pattern"
          @ready="setReady" @error="renderError = 'customizer.renderError'" />
        <p v-else class="p-6 text-center text-sm text-red-700" role="alert">{{ t('customizer.invalidColor') }}</p>
      </div>
      <p v-if="renderError" class="text-xs text-destructive" role="alert">{{ t(renderError) }}</p>
      <p class="text-center text-xs text-muted-foreground">{{ t('customizer.suggestedSize', { category: t(`customizer.categories.${customization.type}`), size: preset.suggestedSize }) }}</p>
      <div class="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" size="sm" :title="t('customizer.pngTitle')"
          :disabled="!ready || !validDesign || downloading || uploading" @click="download('png')">
          <Download class="mr-1 h-3.5 w-3.5" />{{ t('customizer.png') }}
        </Button>
        <Button type="button" variant="outline" size="sm" :title="t('customizer.svgTitle')"
          :disabled="!ready || !validDesign || downloading || uploading" @click="download('svg')">
          <Download class="mr-1 h-3.5 w-3.5" />{{ t('customizer.svg') }}
        </Button>
      </div>
      <Button v-if="productId" type="button" variant="ghost" size="sm" class="w-full" :title="t('customizer.copyTitle')" @click="copyLink">
        <Copy class="mr-1 h-3.5 w-3.5" />{{ t('customizer.copy') }}
      </Button>
    </div>

    <div class="min-w-0 space-y-6">
      <QrStyleControls :model-value="customization" @update:model-value="update" />

      <div class="grid gap-4 border-t pt-5 sm:grid-cols-3">
        <QrColorInput :model-value="customization.dotsColor" :label="t('customizer.dotsColor')" @update:model-value="update({ dotsColor: $event })" />
        <QrColorInput :model-value="customization.cornerColor" :label="t('customizer.cornerColor')" @update:model-value="update({ cornerColor: $event })" />
        <QrColorInput :model-value="customization.backgroundColor" :label="t('customizer.backgroundColor')" @update:model-value="update({ backgroundColor: $event })" />
        <p class="text-xs leading-relaxed text-muted-foreground sm:col-span-3">{{ t('customizer.colorHint') }}</p>
      </div>

      <div class="space-y-2 border-t pt-5">
        <Label :for="`${id}-logo`" class="text-xs">{{ t('customizer.logo') }}</Label>
        <input :id="`${id}-logo`" ref="logoInput" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="handleLogoUpload" />
        <div class="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" :title="t('customizer.uploadTitle')"
            :disabled="uploading" @click="logoInput?.click()">
            <Upload class="mr-1 h-3.5 w-3.5" />{{ uploading ? t('customizer.reading') : customization.logoUrl ? t('customizer.replaceLogo') : t('customizer.uploadLogo') }}
          </Button>
          <Button v-if="customization.logoUrl" type="button" variant="ghost" size="sm" :title="t('customizer.removeLogo')"
            :disabled="uploading" @click="update({ logoUrl: '' }); logoError = ''">{{ t('customizer.clear') }}</Button>
        </div>
        <p v-if="logoError" class="text-xs text-destructive" role="alert">{{ t(logoError) }}</p>
      </div>

      <div class="space-y-2">
        <Label :for="`${id}-text`" class="text-xs">{{ t('customizer.signature') }}</Label>
        <Input :id="`${id}-text`" :model-value="customization.customText" :placeholder="t('customizer.signaturePlaceholder')" class="h-9 text-sm"
          @update:model-value="update({ customText: String($event) })" />
        <p class="text-xs text-muted-foreground">{{ t('customizer.signatureHint') }}</p>
      </div>
      <Button type="button" variant="ghost" size="sm" :title="t('customizer.resetTitle')" @click="selectType(customization.type)">
        <RefreshCw class="mr-1 h-3.5 w-3.5" />{{ t('customizer.reset') }}
      </Button>
      <p class="text-xs text-muted-foreground">{{ t('customizer.saveHint') }}</p>
    </div>
  </div>
</template>

<style scoped>
.qr-customizer {
  container-type: inline-size;
}

@container (min-width: 44rem) {
  .qr-categories {
    grid-column: 1 / -1;
  }

  .qr-preview {
    position: sticky;
    top: 5rem;
  }
}

/* Use the card's available width, including when embedded in a dialog. */
@media (min-width: 1024px) {
  .qr-customizer {
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  }
}
</style>
