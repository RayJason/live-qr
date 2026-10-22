import { z } from 'zod'
import type { Gradient, Options } from 'qr-code-styling'
import { qrPresets, type ProductTypeKey } from './qr-presets'

export const dotStyles = [
  { value: 'square', label: '方形' },
  { value: 'dots', label: '圆点' },
  { value: 'rounded', label: '圆角' },
  { value: 'extra-rounded', label: '柔和圆角' },
  { value: 'classy', label: '叶片' },
  { value: 'classy-rounded', label: '圆角叶片' },
] as const

export const cornerStyles = [
  { value: 'square', label: '方形' },
  { value: 'extra-rounded', label: '圆角' },
  { value: 'dot', label: '圆形' },
] as const

export const qrColorSchema = z.string().regex(/^#[\da-f]{6}([\da-f]{2})?$/i)

export const qrDesignSchema = z.object({
  dotsType: z.enum(['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded']),
  cornerSquareType: z.enum(['square', 'extra-rounded', 'dot']),
  cornerDotType: z.enum(['square', 'dot']),
  gradientType: z.enum(['solid', 'linear', 'radial']),
  gradientColor: qrColorSchema,
  gradientRotation: z.number().min(0).max(360),
  pattern: z.enum(['standard', 'horizontal', 'vertical']).default('standard'),
})

export type QrDesign = z.infer<typeof qrDesignSchema>

export interface QrCustomization {
  type: ProductTypeKey
  dotsColor: string
  cornerColor: string
  backgroundColor: string
  logoUrl: string
  customText: string
  design?: QrDesign
}

export function defaultQrDesign(type: ProductTypeKey): QrDesign {
  const preset = qrPresets[type]
  return qrDesignSchema.parse({
    dotsType: preset.dotsType,
    cornerSquareType: preset.cornerSquareType,
    cornerDotType: preset.cornerDotType,
    gradientType: 'solid',
    gradientColor: '#2563eb',
    gradientRotation: 45,
  })
}

export function resolveQrDesign(value: Parameters<typeof qrDesignSchema.safeParse>[0], type: ProductTypeKey) {
  const parsed = qrDesignSchema.safeParse(value)
  return parsed.success ? parsed.data : defaultQrDesign(type)
}

export const qrStylePresets = [
  { id: 'classic', label: '方格', description: '连片方块 · 方形定位角',
    design: { ...defaultQrDesign('KEYCHAIN') } },
  { id: 'dots', label: '圆点', description: '独立圆点 · 圆环定位角',
    design: { ...defaultQrDesign('LUGGAGE_TAG') } },
  { id: 'horizontal', label: '横纹', description: '横向胶囊 · 圆角定位角',
    design: { ...defaultQrDesign('STICKER'), dotsType: 'square' as const, pattern: 'horizontal' as const } },
  { id: 'vertical', label: '竖纹', description: '纵向胶囊 · 方形定位角',
    design: { ...defaultQrDesign('KEYCHAIN'), pattern: 'vertical' as const } },
  { id: 'leaf', label: '叶片', description: '弧形叶片 · 圆角定位角',
    design: { ...defaultQrDesign('STICKER'), dotsType: 'classy-rounded' as const } },
]

export function applyQrStylePreset(model: QrCustomization, preset: typeof qrStylePresets[number]): QrCustomization & { design: QrDesign } {
  return { ...model, design: {
    ...(model.design ?? defaultQrDesign(model.type)),
    dotsType: preset.design.dotsType,
    cornerSquareType: preset.design.cornerSquareType,
    cornerDotType: preset.design.cornerDotType,
    pattern: preset.design.pattern,
  } }
}

export function matchesQrStylePreset(design: QrDesign, preset: typeof qrStylePresets[number]) {
  return (['dotsType', 'cornerSquareType', 'cornerDotType', 'pattern'] as const)
    .every(key => design[key] === preset.design[key])
}

export function createQrOptions(model: QrCustomization, data: string, size = 360): Options {
  const design = model.design ?? defaultQrDesign(model.type)
  const gradient: Gradient | undefined = design.gradientType === 'solid' ? undefined : {
    type: design.gradientType,
    rotation: design.gradientRotation * Math.PI / 180,
    colorStops: [
      { offset: 0, color: model.dotsColor },
      { offset: 1, color: design.gradientColor },
    ],
  }
  return {
    type: 'svg',
    width: size,
    height: size,
    data,
    // Keep a generous quiet zone around the encoded symbol, including rectangular product types.
    margin: Math.ceil(size * 0.12),
    image: model.logoUrl || undefined,
    qrOptions: { mode: 'Byte', errorCorrectionLevel: 'H' },
    imageOptions: { hideBackgroundDots: true, imageSize: 0.3, margin: 8, crossOrigin: 'anonymous', saveAsBlob: true },
    dotsOptions: { color: model.dotsColor, type: design.pattern === 'standard' ? design.dotsType : 'square', gradient },
    cornersSquareOptions: { color: model.cornerColor, type: design.cornerSquareType },
    cornersDotOptions: { color: model.cornerColor, type: design.cornerDotType },
    backgroundOptions: { color: model.backgroundColor },
  }
}
