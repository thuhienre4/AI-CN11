// Geometry for technical drawings of block objects.
//
// An object is a set of filled cells on a rectilinear grid: `x`, `y`, `z` hold the
// size in mm of each grid step and `cells` holds "i,j,k" keys. Axes: x to the right,
// y going back (depth), z up. Views follow TCVN first-angle projection as taught in
// Công nghệ: front view looks from the front (+y), top view from above and is placed
// below the front view, side view looks from the LEFT and is placed to its right.

export const STANDARD_SCALES = [
  { label: '5:1', value: 5 },
  { label: '2:1', value: 2 },
  { label: '1:1', value: 1 },
  { label: '1:2', value: 0.5 },
  { label: '1:5', value: 0.2 },
  { label: '1:10', value: 0.1 },
]

export const keyOf = (i, j, k) => `${i},${j},${k}`

const cumulative = (sizes) => sizes.reduce((acc, size) => [...acc, acc[acc.length - 1] + Math.max(Number(size) || 0, 1)], [0])

export const getCoordinates = (model) => ({ X: cumulative(model.x), Y: cumulative(model.y), Z: cumulative(model.z) })

export const getOverallSize = (model) => {
  const { X, Y, Z } = getCoordinates(model)
  return { x: X[X.length - 1], y: Y[Y.length - 1], z: Z[Z.length - 1] }
}

const createLookup = (model) => {
  const cells = new Set(model.cells)
  const nx = model.x.length
  const ny = model.y.length
  const nz = model.z.length
  const filled = (i, j, k) => i >= 0 && j >= 0 && k >= 0 && i < nx && j < ny && k < nz && cells.has(keyOf(i, j, k))
  // True when any cell in the inclusive index box is filled (empty ranges are false).
  const any = ([i0, i1], [j0, j1], [k0, k1]) => {
    for (let i = Math.max(i0, 0); i <= Math.min(i1, nx - 1); i += 1) {
      for (let j = Math.max(j0, 0); j <= Math.min(j1, ny - 1); j += 1) {
        for (let k = Math.max(k0, 0); k <= Math.min(k1, nz - 1); k += 1) if (cells.has(keyOf(i, j, k))) return true
      }
    }
    return false
  }
  return { filled, any, nx, ny, nz }
}

// A grid line is a real edge of the solid unless the four cells around it are all
// empty, all filled, or two neighbours forming one flat face.
const isEdge = (a, b, c, d) => {
  const count = a + b + c + d
  return count === 1 || count === 3 || (count === 2 && a === d)
}

/** Every edge of the solid as unit grid segments: { axis, i, j, k } (the segment runs along `axis` from that index). */
export const getModelEdges = (model) => {
  const { filled, nx, ny, nz } = createLookup(model)
  const f = (...index) => (filled(...index) ? 1 : 0)
  const edges = []
  for (let i = 0; i <= nx; i += 1) {
    for (let j = 0; j <= ny; j += 1) {
      for (let k = 0; k <= nz; k += 1) {
        if (i < nx && isEdge(f(i, j - 1, k - 1), f(i, j, k - 1), f(i, j - 1, k), f(i, j, k))) edges.push({ axis: 'x', i, j, k })
        if (j < ny && isEdge(f(i - 1, j, k - 1), f(i, j, k - 1), f(i - 1, j, k), f(i, j, k))) edges.push({ axis: 'y', i, j, k })
        if (k < nz && isEdge(f(i - 1, j - 1, k), f(i, j - 1, k), f(i - 1, j, k), f(i, j, k))) edges.push({ axis: 'z', i, j, k })
      }
    }
  }
  return edges
}

const BIG = 1e6

/**
 * Projects the solid onto one view. Returns view-local coordinates in mm with v pointing up:
 * { width, height, lines: [{ o: 'h' | 'v', at, from, to, type: 'visible' | 'hidden' }] }.
 * An edge is hidden when material in front of it covers both sides of the projected line;
 * if only one side is covered it lies on the occluder's outline, which is drawn there anyway.
 */
export const projectView = (model, view) => {
  const { X, Y, Z } = getCoordinates(model)
  const { any } = createLookup(model)
  const size = getOverallSize(model)
  const units = new Map()
  const add = (o, at, from, to, hidden) => {
    const key = `${o}|${at}|${Math.min(from, to)}|${Math.max(from, to)}`
    if (!hidden || !units.has(key)) units.set(key, { o, at, from: Math.min(from, to), to: Math.max(from, to), type: hidden ? 'hidden' : 'visible' })
  }

  getModelEdges(model).forEach(({ axis, i, j, k }) => {
    if (view === 'front') {
      // Looking from the front: material with a smaller y index is in front of the edge.
      if (axis === 'x') add('h', Z[k], X[i], X[i + 1], any([i, i], [0, j - 1], [k - 1, k - 1]) && any([i, i], [0, j - 1], [k, k]))
      if (axis === 'z') add('v', X[i], Z[k], Z[k + 1], any([i - 1, i - 1], [0, j - 1], [k, k]) && any([i, i], [0, j - 1], [k, k]))
    } else if (view === 'top') {
      // Looking down: material at or above height boundary k is in front.
      if (axis === 'x') add('h', Y[j], X[i], X[i + 1], any([i, i], [j - 1, j - 1], [k, BIG]) && any([i, i], [j, j], [k, BIG]))
      if (axis === 'y') add('v', X[i], Y[j], Y[j + 1], any([i - 1, i - 1], [j, j], [k, BIG]) && any([i, i], [j, j], [k, BIG]))
    } else if (view === 'side') {
      // Looking from the left: material with a smaller x index is in front. The object's
      // front face (y = 0) ends up on the right, away from the front view.
      if (axis === 'y') add('h', Z[k], size.y - Y[j + 1], size.y - Y[j], any([0, i - 1], [j, j], [k - 1, k - 1]) && any([0, i - 1], [j, j], [k, k]))
      if (axis === 'z') add('v', size.y - Y[j], Z[k], Z[k + 1], any([0, i - 1], [j - 1, j - 1], [k, k]) && any([0, i - 1], [j, j], [k, k]))
    }
  })

  return {
    width: view === 'side' ? size.y : size.x,
    height: view === 'top' ? size.y : size.z,
    lines: mergeLines([...units.values()]),
  }
}

/** Joins touching collinear unit segments of the same type so dashed lines keep an even rhythm. */
export const mergeLines = (lines) => {
  const groups = new Map()
  lines.forEach((line) => {
    const key = `${line.o}|${line.at}|${line.type}`
    groups.set(key, [...(groups.get(key) || []), line])
  })
  return [...groups.values()].flatMap((group) => {
    const sorted = [...group].sort((a, b) => a.from - b.from)
    return sorted.reduce((merged, line) => {
      const last = merged[merged.length - 1]
      if (last && Math.abs(last.to - line.from) < 1e-9) last.to = line.to
      else merged.push({ ...line })
      return merged
    }, [])
  })
}

/**
 * Symmetry axes of a view. Only reported when the view has features besides its outline,
 * so a plain rectangle is not cluttered with centre lines.
 */
export const getSymmetryAxes = (projection) => {
  if (projection.lines.length <= 4) return { vertical: false, horizontal: false }
  const round = (value) => Math.round(value * 1000) / 1000
  const keyOfLine = (line) => `${line.o}|${round(line.at)}|${round(line.from)}|${round(line.to)}|${line.type}`
  const original = new Set(projection.lines.map(keyOfLine))
  const mirrored = (flip) => projection.lines.every((line) => original.has(keyOfLine(flip(line))))
  const { width: w, height: h } = projection
  return {
    // Mirror left-right: vertical lines move, horizontal lines flip their span.
    vertical: mirrored((l) => (l.o === 'v' ? { ...l, at: w - l.at } : { ...l, from: w - l.to, to: w - l.from })),
    horizontal: mirrored((l) => (l.o === 'h' ? { ...l, at: h - l.at } : { ...l, from: h - l.to, to: h - l.from })),
  }
}

/** Positions (mm, sorted) of visible lines perpendicular to an axis — used to place chain dimensions. */
export const getDimensionStops = (projection, orientation) =>
  [...new Set(projection.lines.filter((line) => line.o === orientation && line.type === 'visible').map((line) => line.at))].sort((a, b) => a - b)

// ============= Isometric (hình chiếu trục đo vuông góc đều) =============
const SQRT2 = Math.SQRT2
const SQRT6 = Math.sqrt(6)
const iso = (x, y, z) => [(x + y) / SQRT2, -(-x + y + 2 * z) / SQRT6]

/**
 * Visible faces in back-to-front order, seen from the front-right-top.
 * Each face carries the four projected corners and which of its sides are real edges.
 */
export const getIsometricFaces = (model) => {
  const { X, Y, Z } = getCoordinates(model)
  const { filled } = createLookup(model)
  const cubes = model.cells.map((key) => key.split(',').map(Number)).sort((a, b) => (a[0] - a[1] + a[2]) - (b[0] - b[1] + b[2]))
  // A side is an edge unless the neighbouring cell continues the same flat face.
  const edge = (c, d, n) => !(filled(c[0] + d[0], c[1] + d[1], c[2] + d[2]) && !filled(c[0] + d[0] + n[0], c[1] + d[1] + n[1], c[2] + d[2] + n[2]))
  const faces = []
  cubes.forEach((c) => {
    const [i, j, k] = c
    if (!filled(i, j - 1, k)) {
      const n = [0, -1, 0]
      faces.push({ kind: 'front', points: [iso(X[i], Y[j], Z[k]), iso(X[i + 1], Y[j], Z[k]), iso(X[i + 1], Y[j], Z[k + 1]), iso(X[i], Y[j], Z[k + 1])], edges: [edge(c, [0, 0, -1], n), edge(c, [1, 0, 0], n), edge(c, [0, 0, 1], n), edge(c, [-1, 0, 0], n)] })
    }
    if (!filled(i + 1, j, k)) {
      const n = [1, 0, 0]
      faces.push({ kind: 'right', points: [iso(X[i + 1], Y[j], Z[k]), iso(X[i + 1], Y[j + 1], Z[k]), iso(X[i + 1], Y[j + 1], Z[k + 1]), iso(X[i + 1], Y[j], Z[k + 1])], edges: [edge(c, [0, 0, -1], n), edge(c, [0, 1, 0], n), edge(c, [0, 0, 1], n), edge(c, [0, -1, 0], n)] })
    }
    if (!filled(i, j, k + 1)) {
      const n = [0, 0, 1]
      faces.push({ kind: 'top', points: [iso(X[i], Y[j], Z[k + 1]), iso(X[i + 1], Y[j], Z[k + 1]), iso(X[i + 1], Y[j + 1], Z[k + 1]), iso(X[i], Y[j + 1], Z[k + 1])], edges: [edge(c, [0, -1, 0], n), edge(c, [1, 0, 0], n), edge(c, [0, 1, 0], n), edge(c, [-1, 0, 0], n)] })
    }
  })
  return faces
}

export const getIsometricBounds = (model) => {
  const { x, y, z } = getOverallSize(model)
  const corners = [[0, 0, 0], [x, 0, 0], [0, y, 0], [x, y, 0], [0, 0, z], [x, 0, z], [0, y, z], [x, y, z]].map(([a, b, c]) => iso(a, b, c))
  const xs = corners.map((p) => p[0])
  const ys = corners.map((p) => p[1])
  return { minX: Math.min(...xs), minY: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) }
}

// ============= Sheet layout (A4 landscape, mm) =============
export const SHEET = { width: 297, height: 210, frame: { left: 20, top: 5, right: 292, bottom: 205 }, titleBlock: { x: 152, y: 173, width: 140, height: 32 } }
const DIM_SPACE = 20 // room for two rows of dimensions
const VIEW_GAP = 12

/** Paper positions of the three views for a given scale, or null if they do not fit the sheet. */
export const layoutSheet = (model, scale) => {
  const size = getOverallSize(model)
  const w = size.x * scale
  const d = size.y * scale
  const h = size.z * scale
  const front = { x: SHEET.frame.left + 10 + DIM_SPACE, y: SHEET.frame.top + 14, width: w, height: h }
  const top = { x: front.x, y: front.y + h + DIM_SPACE + VIEW_GAP, width: w, height: d }
  const side = { x: front.x + w + DIM_SPACE + VIEW_GAP, y: front.y, width: d, height: h }
  const tb = SHEET.titleBlock
  const clearsTitle = (box) => box.x + box.width <= tb.x - 4 || box.y + box.height <= tb.y - 6
  const fits = top.y + top.height <= SHEET.frame.bottom - 8 && side.x + side.width <= SHEET.frame.right - 8 && clearsTitle(top) && clearsTitle(side)
  if (!fits) return null
  // The free corner right of the top view and above the title block holds the isometric view.
  const isoBox = { x: Math.max(top.x + w + DIM_SPACE, side.x), y: top.y - 4, right: SHEET.frame.right - 8, bottom: tb.y - 8 }
  return { front, top, side, iso: { x: isoBox.x, y: isoBox.y, width: isoBox.right - isoBox.x, height: isoBox.bottom - isoBox.y } }
}

/** The largest standard scale that fits the sheet. */
export const pickScale = (model) =>
  STANDARD_SCALES.find((scale) => layoutSheet(model, scale.value)) || STANDARD_SCALES[STANDARD_SCALES.length - 1]

export const formatMm = (value) => String(Math.round(value * 10) / 10).replace('.', ',')

// ============= Model editing =============
export const createModel = ({ x = [40, 40], y = [40], z = [20, 20], cells = [] } = {}) => ({ x: [...x], y: [...y], z: [...z], cells: [...cells] })

export const toggleCell = (model, i, j, k) => {
  const key = keyOf(i, j, k)
  const cells = model.cells.includes(key) ? model.cells.filter((cell) => cell !== key) : [...model.cells, key]
  return { ...model, cells }
}

/** Removes grid step `index` on `axis` together with its cells, shifting later cells down. */
export const removeStep = (model, axis, index) => {
  const position = { x: 0, y: 1, z: 2 }[axis]
  const cells = model.cells
    .map((key) => key.split(',').map(Number))
    .filter((c) => c[position] !== index)
    .map((c) => { const next = [...c]; if (next[position] > index) next[position] -= 1; return keyOf(...next) })
  return { ...model, [axis]: model[axis].filter((_, i) => i !== index), cells }
}
