import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const HIGHLIGHT = 0x2563eb

/**
 * Renders a workplace scene: drag to turn, scroll or pinch to zoom, click an object to act on it.
 * `stateRef` holds the procedure state read every frame; `onPick(part)` is called on a click (not a drag).
 */
export default function WorkplaceScene({ sim, stateRef, onPick }) {
  const containerRef = useRef(null)
  const resetRef = useRef(null)
  const [failed, setFailed] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const labelsRef = useRef(showLabels)
  labelsRef.current = showLabels
  const onPickRef = useRef(onPick)
  onPickRef.current = onPick

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true })
    } catch {
      setFailed(true)
      return undefined
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    const labelLayer = document.createElement('div')
    Object.assign(labelLayer.style, { position: 'absolute', inset: '0', pointerEvents: 'none' })
    container.appendChild(labelLayer)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf1f5f9)
    scene.add(new THREE.AmbientLight(0xffffff, 0.85))
    const light = new THREE.DirectionalLight(0xffffff, 1.2)
    light.position.set(4, 8, 6)
    scene.add(light)

    const built = sim.build()
    const { root, annotations, framing } = built
    scene.add(root)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }))
    floor.rotation.x = -Math.PI / 2
    floor.position.y = (built.floorY ?? 0) - 0.005
    scene.add(floor)
    const grid = new THREE.GridHelper(14, 28, 0xcbd5e1, 0xcbd5e1)
    grid.position.y = built.floorY ?? 0
    scene.add(grid)

    const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 100)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.maxPolarAngle = Math.PI * 0.49
    const fit = () => {
      const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      const distance = Math.max(framing.height / 2 / halfFov, framing.width / 2 / (halfFov * camera.aspect)) * 1.05
      camera.position.copy(framing.center).addScaledVector(framing.direction, distance)
      controls.target.copy(framing.center)
      controls.minDistance = distance * 0.35
      controls.maxDistance = distance * 1.8
      controls.update()
    }
    resetRef.current = fit

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      renderer.setSize(width, height)
      camera.aspect = width / Math.max(1, height)
      camera.updateProjectionMatrix()
    }
    resize()
    fit()
    const observer = new ResizeObserver(() => { resize(); fit() })
    observer.observe(container)

    const labels = annotations.map((annotation) => {
      const element = document.createElement('div')
      element.className = 'simulation-part-label simulation-part-chip'
      element.innerHTML = `<span></span>`
      element.firstChild.textContent = annotation.label
      labelLayer.appendChild(element)
      return { annotation, element }
    })

    // A click is a short press that did not move: dragging turns the view instead
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let pressed = null
    const down = (event) => { pressed = { x: event.clientX, y: event.clientY, at: performance.now() } }
    const up = (event) => {
      if (!pressed) return
      const moved = Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y)
      const quick = performance.now() - pressed.at < 500
      pressed = null
      if (moved > 6 || !quick) return
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObject(root, true).find((item) => item.object.visible && item.object.userData.part && !item.object.userData.decor)
      onPickRef.current(hit ? hit.object.userData.part : null)
    }
    renderer.domElement.addEventListener('pointerdown', down)
    renderer.domElement.addEventListener('pointerup', up)

    let painted = ''
    const paint = (selected) => {
      if (painted === selected) return
      painted = selected
      root.traverse((child) => {
        if (!child.isMesh || child.userData.decor || !child.material?.emissive) return
        const on = selected && child.userData.part === selected
        child.material.emissive.setHex(on ? HIGHLIGHT : 0x000000)
        child.material.emissiveIntensity = on ? 0.55 : 0
      })
    }

    const clock = new THREE.Clock()
    const projected = new THREE.Vector3()
    let frame = 0
    const loop = () => {
      frame = requestAnimationFrame(loop)
      const state = stateRef.current
      built.update(clock.getElapsedTime(), state)
      paint(state.selected)
      controls.update()
      renderer.render(scene, camera)
      const { width, height } = renderer.domElement.getBoundingClientRect()
      labels.forEach(({ annotation, element }) => {
        annotation.anchor.getWorldPosition(projected)
        projected.project(camera)
        const visible = labelsRef.current && projected.z < 1 && Math.abs(projected.x) < 1.05 && Math.abs(projected.y) < 1.05
        element.style.display = visible ? 'block' : 'none'
        if (!visible) return
        element.style.left = `${(projected.x * 0.5 + 0.5) * width}px`
        element.style.top = `${(-projected.y * 0.5 + 0.5) * height}px`
        element.style.transform = 'translate(-50%, calc(-100% - 8px))'
      })
    }
    loop()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      renderer.domElement.removeEventListener('pointerdown', down)
      renderer.domElement.removeEventListener('pointerup', up)
      controls.dispose()
      root.traverse((child) => {
        child.geometry?.dispose?.()
        child.material?.dispose?.()
      })
      renderer.dispose()
      container.innerHTML = ''
    }
    // the scene is built once per simulation; state and callbacks are read through refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim])

  if (failed) {
    return <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Trình duyệt này chưa hiển thị được đồ họa 3D. Hãy thử Chrome hoặc Edge bản mới.</p>
  }
  return (
    <div className="relative">
      <div ref={containerRef} className="relative h-[52vh] min-h-[320px] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100" />
      <div className="absolute bottom-2 right-2 flex gap-1.5">
        <button type="button" onClick={() => setShowLabels((value) => !value)} className="rounded-md border border-slate-300 bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-white">
          {showLabels ? 'Ẩn nhãn' : 'Hiện nhãn'}
        </button>
        <button type="button" onClick={() => resetRef.current?.()} className="rounded-md border border-slate-300 bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-white">
          Góc nhìn chuẩn
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500">Kéo để xoay, cuộn hoặc chụm tay để phóng to, bấm vào đồ vật để thao tác.</p>
    </div>
  )
}
