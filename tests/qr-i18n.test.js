import { describe, expect, test } from 'bun:test'
import { baseCompile } from '@intlify/message-compiler'
import { qrPresets } from '../lib/qr-presets'
import { cornerStyles, dotStyles, qrStylePresets } from '../lib/qr-design'
import en from '../i18n/translations/en.json'
import zh from '../i18n/translations/zh.json'
import ja from '../i18n/translations/ja.json'
import ko from '../i18n/translations/ko.json'

function messages(value, prefix = '') {
  return Object.entries(value).flatMap(([key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof entry === 'string' ? [[path, entry]] : messages(entry, path)
  })
}

const locales = { en, zh, ja, ko }
const sources = await Promise.all([
  'components/dashboard/QrCustomizer.vue',
  'components/dashboard/QrStyleControls.vue',
  'components/dashboard/QrColorInput.vue',
  'components/AdvancedQrCode.vue',
  'components/ThemeSwitcher.vue',
].map(path => Bun.file(new URL(`../${path}`, import.meta.url)).text()))

describe('QR customization translations', () => {
  for (const [locale, catalog] of Object.entries(locales)) {
    test(`${locale} covers UI messages and every selectable design`, () => {
      const translated = new Map(messages({ customizer: catalog.customizer, theme: catalog.theme }))
      expect([...translated.keys()].sort()).toEqual(messages({ customizer: en.customizer, theme: en.theme }).map(([key]) => key).sort())
      for (const [key, value] of translated) {
        expect(value.trim().length, key).toBeGreaterThan(0)
        const errors = []
        baseCompile(value, { onError: error => errors.push(error.message) })
        expect(errors, key).toEqual([])
      }
      for (const source of sources) {
        for (const [, key] of source.matchAll(/(?:t\(|= )'((?:customizer|theme)\.[\w.]+)'/g)) {
          expect(translated.has(key), key).toBe(true)
        }
      }
      for (const key of Object.keys(qrPresets)) {
        expect(catalog.customizer.categories[key]).toBeTruthy()
        expect(catalog.customizer.descriptions[key]).toBeTruthy()
      }
      for (const { id } of qrStylePresets) {
        expect(catalog.customizer.presetNames[id]).toBeTruthy()
        expect(catalog.customizer.presetDescriptions[id]).toBeTruthy()
      }
      for (const shape of [...dotStyles, ...cornerStyles, { value: 'horizontal' }, { value: 'vertical' }]) {
        expect(catalog.customizer.shapes[shape.value]).toBeTruthy()
      }
    })
  }
})
