import { describe, expect, test } from 'bun:test'
import { styleQrModules } from '../lib/qr-pattern'

function fixture() {
  const createElement = (name, attributes = {}) => ({
    localName: name, attributes,
    getAttribute(key) { return this.attributes[key] ?? null },
    setAttribute(key, value) { this.attributes[key] = value },
  })
  // Two adjacent dark modules, one separated module and another row.
  const layer = {
    children: [[10, 20], [20, 20], [40, 20], [10, 30]].map(([x, y]) => createElement('rect', { x, y, width: 10, height: 10 })),
    replaceChildren(...children) { this.children = children },
  }
  const svg = {
    ownerDocument: { createElementNS: (_namespace, name) => createElement(name) },
    querySelector: selector => selector === 'clipPath[id^="clip-path-dot-color-"]' ? layer : null,
  }
  return { svg, layer }
}

describe('QR data module extensions', () => {
  test('horizontal pattern joins adjacent dark modules and leaves gaps between rows and runs', () => {
    const { svg, layer } = fixture()
    styleQrModules(svg, 'horizontal')
    expect(layer.children).toHaveLength(3)
    expect(layer.children.map(element => element.attributes.width)).toEqual(['20', '10', '10'])
    const first = layer.children[0].attributes
    expect(Number(first.y)).toBeGreaterThan(20)
    expect(Number(first.y) + Number(first.height)).toBeLessThan(30)
    expect(Number(first.y)).toBeLessThan(25)
    expect(Number(first.y) + Number(first.height)).toBeGreaterThan(25)
    expect(Number(first.rx)).toBeGreaterThan(0)
  })

  test('vertical capsules join columns and keep gaps between neighboring columns', () => {
    const { svg, layer } = fixture()
    styleQrModules(svg, 'vertical')
    expect(layer.children).toHaveLength(3)
    const first = layer.children[0].attributes
    expect(Number(first.height)).toBe(20)
    expect(Number(first.width)).toBeCloseTo(7.2)
    expect(Number(first.x)).toBeGreaterThan(10)
    expect(Number(first.x) + Number(first.width)).toBeLessThan(20)
    expect(Number(first.y)).toBe(20)
    expect(Number(first.rx)).toBeGreaterThan(0)
  })

  test('standard patterns are untouched and unsupported renderer markup fails visibly', () => {
    const { svg, layer } = fixture()
    const original = layer.children
    styleQrModules(svg, 'standard')
    expect(layer.children).toBe(original)
    expect(() => styleQrModules({ ...svg, querySelector: () => null }, 'horizontal')).toThrow('module layer')
    layer.children[0].localName = 'path'
    expect(() => styleQrModules(svg, 'vertical')).toThrow('square source modules')
  })
})
