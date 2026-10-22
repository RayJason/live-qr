<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import type QRCodeStyling from 'qr-code-styling'
import type { Options, DotType, CornerSquareType, CornerDotType, FileExtension } from 'qr-code-styling'
import { applyQrPattern } from '@/lib/qr-pattern'
import type { QrDesign } from '@/lib/qr-design'

const props = withDefaults(defineProps<{
  data: string
  options?: Options
  pattern?: QrDesign['pattern']
  width?: number
  height?: number
  margin?: number
  image?: string
  dotsType?: DotType
  dotsColor?: string
  cornerSquareType?: CornerSquareType
  cornerSquareColor?: string
  cornerDotType?: CornerDotType
  cornerDotColor?: string
  background?: string
}>(), {
  width: 300, height: 300, margin: 36, image: '', dotsType: 'square', dotsColor: '#000000',
  cornerSquareType: 'square', cornerSquareColor: '#000000',
  cornerDotType: 'square', cornerDotColor: '#000000', background: '#ffffff',
})

const emit = defineEmits<{ ready: [value: boolean]; error: [message: string] }>()
const container = useTemplateRef<HTMLElement>('container')
const ready = shallowRef(false)
let revision = 0
let renderer: typeof QRCodeStyling | undefined

const options = computed<Options>(() => props.options ?? {
  type: 'svg', width: props.width, height: props.height, margin: props.margin,
  data: props.data, image: props.image || undefined,
  qrOptions: { mode: 'Byte', errorCorrectionLevel: 'H' },
  imageOptions: { hideBackgroundDots: true, imageSize: 0.3, margin: 8, crossOrigin: 'anonymous', saveAsBlob: true },
  dotsOptions: { color: props.dotsColor, type: props.dotsType },
  cornersSquareOptions: { color: props.cornerSquareColor, type: props.cornerSquareType },
  cornersDotOptions: { color: props.cornerDotColor, type: props.cornerDotType },
  backgroundOptions: { color: props.background },
})

async function render() {
  if (!container.value) return
  const current = ++revision
  ready.value = false
  emit('ready', false)
  try {
    renderer ??= (await import('qr-code-styling')).default
    if (current !== revision || !container.value) return
    if (options.value.image) {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.src = options.value.image
      await image.decode()
      if (current !== revision || !container.value) return
    }
    const code = applyQrPattern(new renderer(options.value), props.pattern)
    await code.getRawData('svg')
    if (current !== revision || !container.value) return
    container.value.replaceChildren()
    code.append(container.value)
    ready.value = true
    emit('ready', true)
  } catch {
    if (current !== revision) return
    container.value?.replaceChildren()
    emit('error', '二维码生成失败，请检查颜色和 Logo 后重试')
  }
}

async function download(extension: FileExtension, name = 'qr', size = 1200) {
  if (!renderer || !ready.value) return false
  const source = options.value
  const scale = size / (source.width ?? 300)
  // Render a snapshot so later edits cannot alter an in-progress download.
  const code = applyQrPattern(new renderer({
    ...source, width: size, height: size,
    margin: Math.round((source.margin ?? 0) * scale),
    imageOptions: { ...source.imageOptions, margin: Math.round((source.imageOptions?.margin ?? 0) * scale) },
  }), props.pattern)
  await code.download({ extension, name })
  return true
}

watch([options, () => props.pattern], render, { deep: true, flush: 'post' })
onMounted(render)
onBeforeUnmount(() => { revision++ })
defineExpose({ download })
</script>

<template>
  <div ref="container" class="qr-renderer" role="img" aria-label="二维码" :aria-busy="!ready" />
</template>

<style scoped>
.qr-renderer :deep(svg),
.qr-renderer :deep(canvas) {
  display: block;
  width: 100%;
  height: auto;
}
</style>
