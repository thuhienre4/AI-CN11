import { useEffect, useState } from 'react'

// Controls of a device model (sliders, choices, switches) and the values its principle gives, under the 3D view.
function Control({ control, value, onChange }) {
  if (control.type === 'slider') {
    return (
      <label className="flex min-w-0 flex-1 basis-56 flex-col gap-1 text-sm font-semibold text-slate-700">
        <span>
          {control.label}: <span className="tabular-nums text-blue-800">{control.format ? control.format(value) : value}</span>
        </span>
        <input
          type="range"
          min={control.min}
          max={control.max}
          step={control.step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={control.label}
        />
      </label>
    )
  }
  if (control.type === 'choice') {
    return (
      <div className="min-w-0" role="group" aria-label={control.label}>
        <p className="text-sm font-semibold text-slate-700">{control.label}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {control.options.map(([option, text]) => (
            <button
              key={String(option)}
              type="button"
              aria-pressed={value === option}
              onClick={() => onChange(option)}
              className={`rounded-md px-2.5 py-1 text-sm font-bold ${value === option ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    )
  }
  return (
    <button
      type="button"
      aria-pressed={Boolean(value)}
      onClick={() => onChange(!value)}
      className={`self-end rounded-md border px-3 py-1.5 text-sm font-bold ${value ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
    >
      {control.label}: {value ? control.on || 'Bật' : control.off || 'Tắt'}
    </button>
  )
}

export default function DeviceConsole({ model, controls, onControlsChange, motion, isPlaying, onTogglePlay, speed, onSpeedChange }) {
  const [readouts, setReadouts] = useState([])

  // The values come from the running scene, read a few times a second rather than on every frame
  useEffect(() => {
    const timer = window.setInterval(() => {
      const scene = motion.current.deviceScene
      if (scene) setReadouts(scene.readouts(motion.current.deviceControls))
    }, 250)
    return () => window.clearInterval(timer)
  }, [motion])

  return (
    <section aria-label="Điều khiển mô hình" className="space-y-2 border-t border-slate-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-end gap-4">
        {model.controls.map((control) => (
          <Control
            key={control.id}
            control={control}
            value={controls[control.id] ?? control.default}
            onChange={(value) => onControlsChange({ ...controls, [control.id]: value })}
          />
        ))}
        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs font-semibold text-slate-500">
            Tốc độ
            <input type="range" min="0.25" max="2" step="0.25" value={speed} onChange={(event) => onSpeedChange(Number(event.target.value))} aria-label="Tốc độ chuyển động" />
          </label>
          <button type="button" onClick={onTogglePlay} className="primary-button !min-h-0 !px-3 !py-1 !text-sm">{isPlaying ? 'Tạm dừng' : 'Chạy'}</button>
        </div>
      </div>
      {readouts.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3 lg:grid-cols-5">
          {readouts.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</dt>
              <dd className="truncate text-sm font-bold tabular-nums text-slate-950">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {model.hint && <p className="text-xs text-slate-500">{model.hint}</p>}
    </section>
  )
}
