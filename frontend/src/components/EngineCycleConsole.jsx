import { memo, useEffect, useState } from 'react'
import {
  FOUR_STROKES,
  FOUR_STROKE_CYCLE_DEGREES,
  crankSliderPosition,
  cylinderVolumeShare,
  fourStrokeState,
} from '../utils/fourStrokeCycle'

const SPEEDS = [0.25, 0.5, 1, 2]
const STEP_DEGREES = 15
const CHART_HEIGHT = 74
const STROKE_FILLS = ['#e0f2fe', '#fef3c7', '#ffedd5', '#e2e8f0']

const toPhase = (degrees) => (degrees * Math.PI) / 180

const pistonCurve = (() => {
  const geometry = { crankRadius: 1, crankCenterY: 0, rodLength: 2.95 }
  const heightAt = (degrees) => crankSliderPosition({ ...geometry, cyclePhase: toPhase(degrees) }).pistonPinY
  const top = heightAt(0)
  const bottom = heightAt(180)
  const points = []
  for (let degrees = 0; degrees <= FOUR_STROKE_CYCLE_DEGREES; degrees += 6) {
    const y = 8 + ((top - heightAt(degrees)) / (top - bottom)) * 34
    points.push(`${degrees},${y.toFixed(1)}`)
  }
  return points.join(' ')
})()

const direction = { down: 'Xuống: ĐCT → ĐCD', up: 'Lên: ĐCD → ĐCT' }

function CycleChart({ degrees }) {
  return (
    <svg
      viewBox={`0 0 ${FOUR_STROKE_CYCLE_DEGREES} ${CHART_HEIGHT}`}
      preserveAspectRatio="none"
      className="block h-10 w-full [@media(max-height:700px)]:h-7"
      aria-hidden="true"
    >
      {FOUR_STROKES.map((stroke, index) => (
        <rect key={stroke.id} x={index * 180} width="180" height={CHART_HEIGHT} fill={STROKE_FILLS[index]} />
      ))}
      <polyline points={pistonCurve} fill="none" stroke="#1d4ed8" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <rect x="0" y="50" width="180" height="8" rx="2" fill="#0ea5e9" />
      <rect x="540" y="62" width="180" height="8" rx="2" fill="#f97316" />
      <line x1={degrees} x2={degrees} y1="0" y2={CHART_HEIGHT} stroke="#0f172a" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function Reading({ label, value, tone = 'text-slate-950' }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={`truncate text-sm font-bold ${tone}`}>{value}</dd>
    </div>
  )
}

function EngineCycleConsole({ motion, geometry, isPlaying, speed, onSpeedChange, onTogglePlay, onSeek }) {
  const [degrees, setDegrees] = useState(0)

  // The console follows the animation by itself so the whole page does not re-render every frame.
  useEffect(() => {
    let frame
    const follow = () => {
      const next = Math.round(fourStrokeState(motion.current.cyclePhase).crankDegrees) % FOUR_STROKE_CYCLE_DEGREES
      setDegrees((current) => (current === next ? current : next))
      frame = requestAnimationFrame(follow)
    }
    follow()
    return () => cancelAnimationFrame(frame)
  }, [motion])

  const state = fourStrokeState(toPhase(degrees))
  const strokeIndex = state.strokeIndex
  const volumeShare = cylinderVolumeShare({ ...geometry, cyclePhase: toPhase(degrees) })
  const seekStroke = (offset) => onSeek(((strokeIndex + offset + 4) % 4) * 180 + 90)
  const nudge = (offset) => onSeek((degrees + offset + FOUR_STROKE_CYCLE_DEGREES) % FOUR_STROKE_CYCLE_DEGREES)
  const button = 'rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100'

  return (
    <section aria-label="Điều khiển chu trình động cơ" className="border-t border-slate-200 bg-white px-3 py-1.5 sm:px-4">
      <dl className="grid grid-cols-3 gap-x-3 sm:grid-cols-5">
        <Reading label="Kì" value={`${strokeIndex + 1}. ${state.stroke.name}`} tone="text-blue-700" />
        <Reading label="Góc quay" value={`${degrees}°`} />
        <Reading label="Pít tông" value={direction[state.stroke.pistonDirection]} />
        <Reading label="Xu páp nạp" value={state.intakeOpen ? 'Mở' : 'Đóng'} tone={state.intakeOpen ? 'text-sky-600' : 'text-slate-500'} />
        <Reading label="Xu páp thải" value={state.exhaustOpen ? 'Mở' : 'Đóng'} tone={state.exhaustOpen ? 'text-orange-600' : 'text-slate-500'} />
      </dl>
      <p className="text-[11px] leading-4 text-slate-600">
        V = {Math.round(volumeShare * 100)}% V<sub>a</sub> · S = 2R · ε = V<sub>a</sub>/V<sub>c</sub> ≈ {geometry.compressionRatio.toFixed(1).replace('.', ',')} (tỉ lệ mô hình)
      </p>

      <div className="mt-1 overflow-hidden rounded-md border border-slate-200">
        <CycleChart degrees={degrees} />
      </div>
      <div className="grid grid-cols-4 text-center text-[10px] font-semibold leading-4 text-slate-600">
        {FOUR_STROKES.map((stroke) => <span key={stroke.id}>{stroke.name}</span>)}
      </div>
      <input
        type="range"
        min="0"
        max={FOUR_STROKE_CYCLE_DEGREES - 1}
        step="1"
        value={degrees}
        onChange={(event) => onSeek(Number(event.target.value))}
        aria-label="Góc quay trục khuỷu trong chu trình"
        aria-valuetext={`${degrees} độ, kì ${state.stroke.name}`}
        className="block h-4 w-full"
      />

      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
        <button type="button" className={button} onClick={() => seekStroke(-1)}>Kì trước</button>
        <button type="button" className={button} onClick={() => nudge(-STEP_DEGREES)} aria-label={`Lùi ${STEP_DEGREES} độ`}>−{STEP_DEGREES}°</button>
        <button type="button" onClick={onTogglePlay} className="primary-button !min-h-0 !px-3 !py-1 !text-sm">
          {isPlaying ? 'Tạm dừng' : 'Phát'}
        </button>
        <button type="button" className={button} onClick={() => nudge(STEP_DEGREES)} aria-label={`Tiến ${STEP_DEGREES} độ`}>+{STEP_DEGREES}°</button>
        <button type="button" className={button} onClick={() => seekStroke(1)}>Kì sau</button>
        <div className="ml-auto flex items-center gap-1" role="group" aria-label="Tốc độ">
          <span className="mr-1 hidden text-xs font-semibold text-slate-500 sm:inline">Tốc độ</span>
          {SPEEDS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={speed === value}
              onClick={() => onSpeedChange(value)}
              className={`rounded-md px-2 py-1 text-xs font-bold ${
                speed === value ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {value}×
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default memo(EngineCycleConsole)
