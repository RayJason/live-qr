import { describe, expect, test } from 'bun:test'
import { createQrOptions, defaultQrDesign, qrColorSchema, qrDesignSchema, qrStylePresets, resolveQrDesign } from '../lib/qr-design'
import { qrPresets } from '../lib/qr-presets'

const model = {
  type: 'STICKER', dotsColor: '#1a1a2e80', cornerColor: '#16213e',
  backgroundColor: '#ffffff00', logoUrl: '', customText: 'My bag',
}
const data = 'https://example.com/s/test-item'

describe('saved QR designs', () => {
  test('accepts opaque and alpha hex colors while rejecting incomplete or malformed input', () => {
    for (const color of ['#123456', '#AbCdEf', '#12345600', '#123456ff']) {
      expect(qrColorSchema.safeParse(color).success).toBe(true)
    }
    for (const color of ['', '#123', '#12345g', 'red', '#123456789', 'url(test)']) {
      expect(qrColorSchema.safeParse(color).success).toBe(false)
    }
  })

  test('legacy and invalid values fall back to each product type without inventing a style', () => {
    for (const [type, preset] of Object.entries(qrPresets)) {
      for (const value of [null, undefined, {}, { dotsType: 'invalid' }]) {
        const design = resolveQrDesign(value, type)
        expect(design.dotsType).toBe(preset.dotsType)
        expect(design.cornerSquareType).toBe(preset.cornerSquareType)
        expect(design.cornerDotType).toBe(preset.cornerDotType)
        expect(design.gradientType).toBe('solid')
      }
    }
  })

  test('all presets survive JSON storage and validation unchanged', () => {
    for (const preset of qrStylePresets) {
      const saved = JSON.parse(JSON.stringify(preset.design))
      expect(qrDesignSchema.parse(saved)).toEqual(preset.design)
      expect(resolveQrDesign(saved, 'KEYCHAIN')).toEqual(preset.design)
    }
  })

  test('rejects unsupported shapes, invalid gradient colors and angles', () => {
    const design = defaultQrDesign('STICKER')
    for (const patch of [
      { dotsType: 'triangle' }, { cornerSquareType: 'invalid' }, { cornerDotType: 'invalid' },
      { gradientType: 'conic' }, { gradientColor: 'red' },
      { gradientRotation: -1 }, { gradientRotation: 361 },
    ]) {
      expect(qrDesignSchema.safeParse({ ...design, ...patch }).success).toBe(false)
    }
    expect(qrDesignSchema.safeParse({ ...design, gradientColor: '#2563eb80' }).success).toBe(true)
  })
})

describe('QR rendering and export options', () => {
  test('preserves URL, transparency and square geometry for every product type', () => {
    for (const type of Object.keys(qrPresets)) {
      const options = createQrOptions({ ...model, type }, data)
      expect(options.data).toBe(data)
      expect(options.width).toBe(options.height)
      expect(options.margin).toBeGreaterThanOrEqual(options.width * 0.12)
      expect(options.dotsOptions.color).toBe(model.dotsColor)
      expect(options.backgroundOptions.color).toBe(model.backgroundColor)
      expect(options.qrOptions.errorCorrectionLevel).toBe('H')
      expect(options.image).toBeUndefined()
    }
  })

  test('maps shape, linear gradient angle and alpha stops to the renderer', () => {
    const design = { ...defaultQrDesign('STICKER'), dotsType: 'classy', cornerSquareType: 'dot',
      cornerDotType: 'square', gradientType: 'linear', gradientColor: '#2563eb80', gradientRotation: 90 }
    const options = createQrOptions({ ...model, design }, data)
    expect(options.dotsOptions.type).toBe('classy')
    expect(options.cornersSquareOptions.type).toBe('dot')
    expect(options.cornersDotOptions.type).toBe('square')
    expect(options.dotsOptions.gradient).toEqual({ type: 'linear', rotation: Math.PI / 2,
      colorStops: [{ offset: 0, color: model.dotsColor }, { offset: 1, color: '#2563eb80' }] })
  })

  test('switching radial gradient back to solid clears gradient settings', () => {
    const design = { ...defaultQrDesign('STICKER'), gradientType: 'radial' }
    expect(createQrOptions({ ...model, design }, data).dotsOptions.gradient.type).toBe('radial')
    expect(createQrOptions({ ...model, design: { ...design, gradientType: 'solid' } }, data).dotsOptions.gradient).toBeUndefined()
  })

  test('print export uses the same design, URL and embedded logo as preview', () => {
    for (const preset of qrStylePresets) {
      const customized = { ...model, ...preset, logoUrl: 'data:image/png;base64,test' }
      const preview = createQrOptions(customized, data)
      const print = createQrOptions(customized, data, 1200)
      expect(print.width).toBe(1200)
      expect(print.height).toBe(1200)
      expect(print.dotsOptions).toEqual(preview.dotsOptions)
      expect(print.cornersSquareOptions).toEqual(preview.cornersSquareOptions)
      expect(print.cornersDotOptions).toEqual(preview.cornersDotOptions)
      expect(print.data).toBe(preview.data)
      expect(print.image).toBe(preview.image)
      expect(print.imageOptions.saveAsBlob).toBe(true)
    }
  })
})
