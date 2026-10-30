// Printing and exporting a single drawing sheet, independent of page-level print CSS.

const A4_LANDSCAPE_PX = { width: 1122, height: 793 } // 297 × 210 mm at 96 px/in
const escapeHtml = (text) => text.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch])

/**
 * A standalone HTML document holding only a copy of `element` on one A4 landscape page.
 * - SVG sheets (default) are sized to the page; their viewBox keeps the proportions.
 * - Fixed-size HTML sheets pass `contentSize` (px) and are scaled uniformly to fit, centred.
 * The app's stylesheets are copied so HTML sheets keep their look.
 */
export const buildPrintDocument = (element, { contentSize, title = 'Bản vẽ kĩ thuật' } = {}) => {
  const clone = element.cloneNode(true)
  clone.removeAttribute('class')
  let placement = 'width:297mm;height:210mm;'
  if (contentSize) {
    const scale = Math.min(A4_LANDSCAPE_PX.width / contentSize.width, A4_LANDSCAPE_PX.height / contentSize.height) * 0.97
    const left = (A4_LANDSCAPE_PX.width - contentSize.width * scale) / 2
    const top = (A4_LANDSCAPE_PX.height - contentSize.height * scale) / 2
    placement = `width:${contentSize.width}px;height:${contentSize.height}px;transform:translate(${left}px,${top}px) scale(${scale});transform-origin:0 0;`
  }
  clone.setAttribute('style', `${placement}display:block;margin:0;max-width:none;min-width:0;box-shadow:none;`)
  const styles = [...document.querySelectorAll('style, link[rel="stylesheet"]')].map((node) => node.outerHTML).join('\n')
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><base href="${escapeHtml(document.baseURI)}"><title>${escapeHtml(title)}</title>
${styles}
<style>@page{size:A4 landscape;margin:0}html,body{margin:0!important;padding:0!important;width:297mm;height:210mm;overflow:hidden;background:#fff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}</style>
</head><body>${clone.outerHTML}</body></html>`
}

/**
 * Prints only `element` on one A4 landscape page, via a hidden iframe so the rest of the app
 * (its layout, fixed headers, page height) cannot add pages or bleed into the print.
 */
export const printElement = (element, options = {}) => {
  if (!element) return
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'
  document.body.appendChild(iframe)
  const frameWindow = iframe.contentWindow
  let printed = false
  const print = async () => {
    if (printed) return
    printed = true
    try { await frameWindow.document.fonts?.ready } catch { /* fonts API unavailable */ }
    frameWindow.focus()
    frameWindow.print()
    // print() blocks until the dialog closes in most browsers; give the rest time before removing.
    setTimeout(() => iframe.remove(), 1000)
  }
  // Stylesheets are linked in production, so wait for them before printing.
  iframe.addEventListener('load', print, { once: true })
  frameWindow.document.open()
  frameWindow.document.write(buildPrintDocument(element, options))
  frameWindow.document.close()
  setTimeout(print, 2500)
}

/** Prints the engineering design dossier (portrait, may span pages) using its scoped print CSS. */
export const printDossier = () => {
  document.body.classList.add('ed-printing-dossier')
  let cleaned = false
  const cleanup = () => {
    if (cleaned) return
    cleaned = true
    document.body.classList.remove('ed-printing-dossier')
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)
  window.print()
  setTimeout(cleanup, 1000)
}

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const toFileName = (title, extension) =>
  `${(title || 'ban-ve')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ban-ve'}.${extension}`

const serializeSvg = (svg) => {
  const clone = svg.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const [, , w, h] = (svg.getAttribute('viewBox') || '0 0 297 210').split(/\s+/).map(Number)
  // Physical size so the file opens at true A4 size in viewers and print dialogs.
  clone.setAttribute('width', `${w}mm`)
  clone.setAttribute('height', `${h}mm`)
  clone.removeAttribute('class')
  return { markup: new XMLSerializer().serializeToString(clone), w, h }
}

export const downloadSvg = (svg, filename) => {
  const { markup } = serializeSvg(svg)
  downloadBlob(new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${markup}`], { type: 'image/svg+xml' }), filename)
}

/** Renders the SVG to a PNG at `dpi` (an A4 sheet at 200 dpi is about 2339 × 1654 px). */
export const downloadPng = (svg, filename, dpi = 200) => new Promise((resolve, reject) => {
  const { markup, w, h } = serializeSvg(svg)
  const pxPerMm = dpi / 25.4
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * pxPerMm)
  canvas.height = Math.round(h * pxPerMm)
  const image = new Image()
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }))
  image.onload = () => {
    const context = canvas.getContext('2d')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(url)
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Không tạo được ảnh PNG')); return }
      downloadBlob(blob, filename)
      resolve()
    }, 'image/png')
  }
  image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Không đọc được bản vẽ SVG')) }
  image.src = url
})
