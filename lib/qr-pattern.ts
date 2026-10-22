import type QRCodeStyling from 'qr-code-styling'
import type { QrDesign } from './qr-design'

interface Cell {
  x: number
  y: number
  width: number
  height: number
}

// qr-code-styling 1.9.x keeps data modules in this clip path, separate from
// finders and the logo cutout. Transform only these modules via its public extension API.
export function styleQrModules(svg: SVGElement, pattern: QrDesign['pattern']) {
  if (pattern === 'standard') return
  const layer = svg.querySelector('clipPath[id^="clip-path-dot-color-"]')
  if (!layer || !layer.children.length) throw new Error('QR data module layer is unavailable')
  const horizontal = pattern === 'horizontal'
  const cells: Cell[] = Array.from(layer.children, element => {
    if (element.localName !== 'rect') throw new Error('Custom QR patterns require square source modules')
    const x = Number(element.getAttribute('x'))
    const y = Number(element.getAttribute('y'))
    const width = Number(element.getAttribute('width'))
    const height = Number(element.getAttribute('height'))
    return horizontal ? { x, y, width, height } : { x: y, y: x, width: height, height: width }
  })
  const runs: Cell[] = []
  for (const cell of cells.sort((a, b) => a.y - b.y || a.x - b.x)) {
    const previous = runs.at(-1)
    if (previous && previous.y === cell.y && Math.abs(previous.x + previous.width - cell.x) < 0.01) {
      previous.width += cell.width
    } else {
      runs.push({ ...cell })
    }
  }
  layer.replaceChildren(...runs.map(run => {
    const element = svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'rect')
    // Keep the center of every dark module filled, with visible gaps between runs.
    const inset = run.height * 0.14
    const thickness = run.height * 0.72
    element.setAttribute('x', String(horizontal ? run.x : run.y + inset))
    element.setAttribute('y', String(horizontal ? run.y + inset : run.x))
    element.setAttribute('width', String(horizontal ? run.width : thickness))
    element.setAttribute('height', String(horizontal ? thickness : run.width))
    element.setAttribute('rx', String(run.height * 0.36))
    return element
  }))
}

export function applyQrPattern(code: QRCodeStyling, pattern: QrDesign['pattern'] = 'standard') {
  if (pattern !== 'standard') code.applyExtension(svg => styleQrModules(svg, pattern))
  return code
}
