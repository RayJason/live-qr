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
    logoError.value = '请选择不超过 2 MB 的 PNG、JPG 或 WebP 图片'
    return
  }
  uploading.value = true
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('图片读取失败'))
      reader.onerror = () => reject(new Error('图片读取失败'))
      reader.readAsDataURL(file)
    })
    const image = new Image()
    image.src = dataUrl
    await image.decode()
    update({ logoUrl: dataUrl })
  } catch {
    logoError.value = '图片无法读取，请选择其他图片'
  } finally {
    uploading.value = false
  }
}

async function download(extension: 'png' | 'svg') {
  downloading.value = true
  try {
    await nextTick()
    const success = await preview.value?.download(extension, `qr-${props.productId || 'preview'}`)
    if (!success) throw new Error('二维码未就绪')
    toast.success(`${extension.toUpperCase()} 二维码已下载`)
  } catch {
    toast.error('二维码下载失败，请检查 Logo 或重试')
  } finally {
    downloading.value = false
  }
}

async function copyLink() {
  try {
    await copy(qrData.value)
    toast.success('链接已复制')
  } catch {
    toast.error('链接复制失败，请重试')
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
      <legend class="text-sm font-medium">选择品类</legend>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,7rem),1fr))] gap-2">
        <button v-for="(item, key) in qrPresets" :key="key" type="button"
          :title="item.label" :aria-pressed="customization.type === key"
          class="flex min-w-0 flex-col items-center gap-1 rounded-xl border-2 p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :class="customization.type === key ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/30 hover:bg-muted/30'"
          @click="selectType(key)">
          <span class="text-2xl" aria-hidden="true">{{ item.icon }}</span>
          <span class="text-center text-xs font-semibold leading-tight">{{ item.label }}</span>
        </button>
      </div>
      <p class="text-xs text-muted-foreground">{{ preset.description }}</p>
    </fieldset>

    <div class="qr-preview min-w-0 space-y-3 rounded-xl border bg-muted/30 p-4">
      <div class="mx-auto w-full max-w-[320px] overflow-hidden rounded-lg bg-white">
        <AdvancedQrCode v-if="validDesign" ref="preview" :data="qrData" :options="options" :pattern="customization.design.pattern"
          @ready="setReady" @error="renderError = $event" />
        <p v-else class="p-6 text-center text-sm text-destructive" role="alert">请输入有效的十六进制颜色，如 #1a1a2e 或 #1a1a2eff</p>
      </div>
      <p v-if="renderError" class="text-xs text-destructive" role="alert">{{ renderError }}</p>
      <p class="text-center text-xs text-muted-foreground">{{ preset.label }} · 建议尺寸 {{ preset.suggestedSize }}</p>
      <div class="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" size="sm" title="下载 1200 × 1200 像素 PNG 图片"
          :disabled="!ready || !validDesign || downloading || uploading" @click="download('png')">
          <Download class="mr-1 h-3.5 w-3.5" />PNG 图片
        </Button>
        <Button type="button" variant="outline" size="sm" title="下载可无损缩放的 SVG 矢量图"
          :disabled="!ready || !validDesign || downloading || uploading" @click="download('svg')">
          <Download class="mr-1 h-3.5 w-3.5" />SVG 矢量图
        </Button>
      </div>
      <Button v-if="productId" type="button" variant="ghost" size="sm" class="w-full" title="复制物品的扫码链接" @click="copyLink">
        <Copy class="mr-1 h-3.5 w-3.5" />复制链接
      </Button>
    </div>

    <div class="min-w-0 space-y-6">
    <QrStyleControls :model-value="customization" @update:model-value="update" />

    <div class="space-y-4 border-t pt-5">
      <QrColorInput :model-value="customization.dotsColor" label="码点颜色" @update:model-value="update({ dotsColor: $event })" />
      <QrColorInput :model-value="customization.cornerColor" label="定位角颜色" @update:model-value="update({ cornerColor: $event })" />
      <QrColorInput :model-value="customization.backgroundColor" label="背景颜色" @update:model-value="update({ backgroundColor: $event })" />
      <p class="text-xs leading-relaxed text-muted-foreground">建议使用深色码点和浅色背景。透明色及渐变效果请在实际材质上试扫后再印刷。</p>
    </div>

    <div class="space-y-2 border-t pt-5">
      <Label :for="`${id}-logo`" class="text-xs">中心 Logo（可选）</Label>
      <input :id="`${id}-logo`" ref="logoInput" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="handleLogoUpload" />
      <div class="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" title="上传不超过 2 MB 的 PNG、JPG 或 WebP 图片"
          :disabled="uploading" @click="logoInput?.click()">
          <Upload class="mr-1 h-3.5 w-3.5" />{{ uploading ? '读取中…' : customization.logoUrl ? '更换 Logo' : '上传 Logo' }}
        </Button>
        <Button v-if="customization.logoUrl" type="button" variant="ghost" size="sm" title="移除二维码中心 Logo"
          :disabled="uploading" @click="update({ logoUrl: '' }); logoError = ''">清除</Button>
      </div>
      <p v-if="logoError" class="text-xs text-destructive" role="alert">{{ logoError }}</p>
    </div>

    <div class="space-y-2">
      <Label :for="`${id}-text`" class="text-xs">个性签名</Label>
      <Input :id="`${id}-text`" :model-value="customization.customText" placeholder="如：Ray 的雪板 🏂" class="h-9 text-sm"
        @update:model-value="update({ customText: String($event) })" />
      <p class="text-xs text-muted-foreground">签名显示在扫码页面，下载图片仅包含二维码。</p>
    </div>
    <Button type="button" variant="ghost" size="sm" title="恢复当前品类的默认形状、颜色和填色" @click="selectType(customization.type)">
      <RefreshCw class="mr-1 h-3.5 w-3.5" />恢复品类预设
    </Button>
    <p class="text-xs text-muted-foreground">修改样式后，点击「保存更改」以便下次继续编辑。</p>
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
