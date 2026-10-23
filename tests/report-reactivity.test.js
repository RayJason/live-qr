import { expect, test } from 'bun:test'
import { runInNewContext } from 'node:vm'
import { computed, ref, shallowRef, watch, nextTick } from 'vue'

const source = await Bun.file(new URL('../pages/dashboard/products/[id].vue', import.meta.url)).text()
const fetchOptions = source.match(/useFetch\(`\/api\/products\/\$\{productId\}`, (\{[\s\S]*?\})\)/)[1]
const removeReportSource = source.match(/const removeReport = \(reportId: string\) => \{([\s\S]*?)\n\}/)[1]

test('deleting reports updates the rendered list and empty state without resetting unsaved edits', async () => {
  const options = runInNewContext(`(${fetchOptions})`, { productId: 'product' })
  const product = (options.deep ? ref : shallowRef)({
    name: 'Saved name',
    reports: [{ id: 'first' }, { id: 'last' }],
  })
  const renderedReports = computed(() => product.value.reports.map(report => report.id))
  const empty = computed(() => product.value.reports.length === 0)
  const form = { name: 'Unsaved edit' }
  const stop = watch(product, value => { form.name = value.name })
  const removeReport = runInNewContext(`reportId => {${removeReportSource}}`, { product })

  expect(renderedReports.value).toEqual(['first', 'last'])
  expect(empty.value).toBe(false)
  removeReport('first')
  await nextTick()
  expect(renderedReports.value).toEqual(['last'])
  expect(form.name).toBe('Unsaved edit')
  removeReport('last')
  await nextTick()
  expect(renderedReports.value).toEqual([])
  expect(empty.value).toBe(true)
  expect(form.name).toBe('Unsaved edit')
  stop()
})
