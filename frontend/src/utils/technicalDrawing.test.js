import { describe, expect, it } from 'vitest'
import { createModel, getDimensionStops, getIsometricFaces, getModelEdges, getSymmetryAxes, keyOf, layoutSheet, pickScale, projectView, removeStep } from './technicalDrawing'

const all = (nx, ny, nz, skip = () => false) => {
  const cells = []
  for (let i = 0; i < nx; i += 1) for (let j = 0; j < ny; j += 1) for (let k = 0; k < nz; k += 1) if (!skip(i, j, k)) cells.push(keyOf(i, j, k))
  return cells
}
const byType = (view, type) => view.lines.filter((line) => line.type === type)
const sortLines = (lines) => lines.map(({ o, at, from, to }) => `${o}${at}:${from}-${to}`).sort()

describe('single box', () => {
  const box = createModel({ x: [30], y: [20], z: [10], cells: [keyOf(0, 0, 0)] })

  it('has the 12 edges of a box', () => {
    expect(getModelEdges(box)).toHaveLength(12)
  })

  it('projects to a plain rectangle in every view with no hidden lines', () => {
    expect(sortLines(projectView(box, 'front').lines)).toEqual(sortLines([
      { o: 'h', at: 0, from: 0, to: 30 }, { o: 'h', at: 10, from: 0, to: 30 },
      { o: 'v', at: 0, from: 0, to: 10 }, { o: 'v', at: 30, from: 0, to: 10 },
    ]))
    const side = projectView(box, 'side')
    expect([side.width, side.height]).toEqual([20, 10])
    const top = projectView(box, 'top')
    expect([top.width, top.height]).toEqual([30, 20])
    ;['front', 'top', 'side'].forEach((view) => expect(byType(projectView(box, view), 'hidden')).toHaveLength(0))
  })
})

it('merges a block of cubes into one rectangle (no internal grid lines)', () => {
  const block = createModel({ x: [10, 10, 10], y: [10, 10], z: [10, 10], cells: all(3, 2, 2) })
  expect(getModelEdges(block).length).toBe(3 * 4 + 2 * 4 + 2 * 4) // the 12 box edges, split per grid step
  expect(projectView(block, 'front').lines).toHaveLength(4)
})

describe('hidden lines', () => {
  // Open-top box: 5 mm walls and floor, cavity inside.
  const tray = createModel({ x: [5, 40, 5], y: [5, 30, 5], z: [5, 20], cells: all(3, 3, 2, (i, j, k) => k === 1 && i === 1 && j === 1) })

  it('shows the cavity floor and inner walls as dashed lines in the front view', () => {
    const hidden = byType(projectView(tray, 'front'), 'hidden')
    expect(sortLines(hidden)).toEqual(sortLines([
      { o: 'h', at: 5, from: 5, to: 45 }, // cavity floor
      { o: 'v', at: 5, from: 5, to: 25 }, // inner left wall
      { o: 'v', at: 45, from: 5, to: 25 }, // inner right wall
    ]))
  })

  it('sees straight into the cavity from above (no hidden lines)', () => {
    const top = projectView(tray, 'top')
    expect(byType(top, 'hidden')).toHaveLength(0)
    expect(byType(top, 'visible').length).toBe(8) // outer and inner rectangles
  })

  it('draws a visible line over a coinciding hidden one', () => {
    // L-shape: the back upright's front face sits exactly where hidden edges would be.
    const lShape = createModel({ x: [20], y: [10, 10], z: [10, 10], cells: [keyOf(0, 0, 0), keyOf(0, 1, 0), keyOf(0, 1, 1)] })
    const front = projectView(lShape, 'front')
    expect(byType(front, 'hidden')).toHaveLength(0)
    expect(front.lines.some((line) => line.o === 'h' && line.at === 10)).toBe(true) // step line between the two parts
  })
})

it('places the front face on the right of the side view (first-angle, viewed from the left)', () => {
  // A low step at the front (y=0) and a tall part at the back.
  const step = createModel({ x: [10], y: [10, 20], z: [10, 30], cells: [keyOf(0, 0, 0), keyOf(0, 1, 0), keyOf(0, 1, 1)] })
  const side = projectView(step, 'side')
  const stepTop = side.lines.find((line) => line.o === 'h' && line.at === 10)
  expect([stepTop.from, stepTop.to]).toEqual([20, 30]) // the front 10 mm is on the right-hand end
})

describe('symmetry axes', () => {
  const tray = createModel({ x: [5, 40, 5], y: [5, 30, 5], z: [5, 20], cells: all(3, 3, 2, (i, j, k) => k === 1 && i === 1 && j === 1) })

  it('finds both axes in the top view of a centred cavity and only the vertical one in the front view', () => {
    expect(getSymmetryAxes(projectView(tray, 'top'))).toEqual({ vertical: true, horizontal: true })
    expect(getSymmetryAxes(projectView(tray, 'front'))).toEqual({ vertical: true, horizontal: false })
  })

  it('skips plain rectangles and asymmetric views', () => {
    const box = createModel({ x: [30], y: [20], z: [10], cells: [keyOf(0, 0, 0)] })
    expect(getSymmetryAxes(projectView(box, 'front'))).toEqual({ vertical: false, horizontal: false })
    const lShape = createModel({ x: [10, 30], y: [10], z: [10, 20], cells: [keyOf(0, 0, 0), keyOf(1, 0, 0), keyOf(0, 0, 1)] })
    expect(getSymmetryAxes(projectView(lShape, 'front')).vertical).toBe(false)
  })
})

it('collects dimension stops from visible lines only', () => {
  const tray = createModel({ x: [5, 40, 5], y: [5, 30, 5], z: [5, 20], cells: all(3, 3, 2, (i, j, k) => k === 1 && i === 1 && j === 1) })
  expect(getDimensionStops(projectView(tray, 'front'), 'v')).toEqual([0, 50])
  expect(getDimensionStops(projectView(tray, 'top'), 'v')).toEqual([0, 5, 45, 50])
})

it('returns only outward-facing isometric faces', () => {
  const block = createModel({ x: [10, 10], y: [10], z: [10], cells: all(2, 1, 1) })
  const faces = getIsometricFaces(block)
  expect(faces.filter((face) => face.kind === 'right')).toHaveLength(1)
  expect(faces.filter((face) => face.kind === 'front')).toHaveLength(2)
  // The shared side between the two front faces is not an edge.
  expect(faces.filter((face) => face.kind === 'front').map((face) => face.edges.filter(Boolean).length)).toEqual([3, 3])
})

describe('sheet', () => {
  it('picks the largest standard scale that fits A4', () => {
    expect(pickScale(createModel({ x: [40], y: [30], z: [20], cells: [keyOf(0, 0, 0)] })).label).toBe('2:1')
    expect(pickScale(createModel({ x: [300], y: [60], z: [50], cells: [keyOf(0, 0, 0)] })).label).toBe('1:2')
  })

  it('rejects layouts that run off the sheet', () => {
    expect(layoutSheet(createModel({ x: [300], y: [60], z: [50] }), 1)).toBeNull()
  })
})

it('removes a grid step and renumbers the cells after it', () => {
  const model = createModel({ x: [10, 20, 30], y: [10], z: [10], cells: [keyOf(0, 0, 0), keyOf(1, 0, 0), keyOf(2, 0, 0)] })
  const next = removeStep(model, 'x', 1)
  expect(next.x).toEqual([10, 30])
  expect(next.cells.sort()).toEqual([keyOf(0, 0, 0), keyOf(1, 0, 0)])
})
