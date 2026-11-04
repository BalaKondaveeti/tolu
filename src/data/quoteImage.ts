import { imageUrl, type Background } from './backgrounds'

// Renders a quote over its photo into a 1080×1920 image (phone wallpaper /
// story size). Colors come from the Wake up tokens in theme.css.

const W = 1080
const H = 1920
const PAD = 84 // outer margin
const INNER = 64 // panel padding
const SIGNATURE = 'Balu'

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // Needed so the canvas can still be exported; Unsplash's CDN allows it.
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('photo failed to load'))
    img.src = src
  })
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width <= maxWidth || !line) line = test
    else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export interface QuoteImage {
  blob: Blob
  usedPhoto: boolean
}

export async function renderQuoteImage(text: string, bg: Background | null): Promise<QuoteImage> {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser.')

  const font = token('--font-display') || 'system-ui, sans-serif'
  const ink = token('--wake-ink')

  // Background: the photo, cropped to fill; a gradient if it can't be used.
  let usedPhoto = false
  if (bg) {
    try {
      // Separate URL from the on-screen photo so Safari fetches a fresh,
      // CORS-enabled copy instead of reusing the cached one.
      const img = await loadImage(`${imageUrl(bg, true)}&tolu=save`)
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight)
      const dw = img.naturalWidth * scale
      const dh = img.naturalHeight * scale
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh)
      usedPhoto = true
    } catch {
      usedPhoto = false
    }
  }
  if (!usedPhoto) {
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, token('--wake-export-fallback-a'))
    g.addColorStop(0.55, token('--wake-export-fallback-b'))
    g.addColorStop(1, token('--wake-export-fallback-c'))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }

  // Same top/bottom shading as the screen.
  const shade = ctx.createLinearGradient(0, 0, 0, H)
  shade.addColorStop(0, token('--wake-export-shade-top'))
  shade.addColorStop(0.3, 'rgba(0,0,0,0)')
  shade.addColorStop(1, token('--wake-export-shade-bottom'))
  ctx.fillStyle = shade
  ctx.fillRect(0, 0, W, H)

  // Quote text: shrink until it fits comfortably.
  const textWidth = W - PAD * 2 - INNER * 2
  let size = 84
  let lines: string[] = []
  for (; size >= 52; size -= 4) {
    ctx.font = `800 ${size}px ${font}`
    lines = wrap(ctx, text, textWidth)
    if (lines.length * size * 1.18 <= 900) break
  }
  const lineHeight = Math.round(size * 1.18)
  const panelH = INNER * 2 + lines.length * lineHeight
  const panelY = Math.min(H - 300 - panelH, Math.round((H - panelH) / 2 + 220))
  const panelX = PAD

  // Tint panel behind the words.
  roundRect(ctx, panelX, panelY, W - PAD * 2, panelH, 48)
  ctx.fillStyle = token('--wake-panel-export')
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = token('--wake-glass-border')
  ctx.stroke()

  ctx.textBaseline = 'top'
  ctx.fillStyle = ink
  ctx.font = `800 ${size}px ${font}`
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 12
  lines.forEach((line, i) => {
    ctx.fillText(line, panelX + INNER, panelY + INNER + i * lineHeight)
  })
  ctx.shadowBlur = 0

  // Footer: signature and photo credit.
  ctx.font = `600 30px ${font}`
  ctx.fillStyle = token('--wake-ink-faint')
  ctx.textAlign = 'center'
  const footer = usedPhoto && bg ? `${SIGNATURE}  ·  Photo: ${bg.credit} / Unsplash` : SIGNATURE
  ctx.fillText(footer, W / 2, H - 150)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
  if (!blob) throw new Error("Couldn't create the image.")
  return { blob, usedPhoto }
}
