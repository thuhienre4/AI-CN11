import { forwardRef, useEffect, useRef, useState } from 'react'

/**
 * Shrinks fixed-size content (e.g. a 1000 × 650 px drawing sheet) to the available width
 * instead of letting it widen the page. Never scales up. `ref` points at the unscaled content,
 * which is what printing should target.
 */
const FitToWidth = forwardRef(function FitToWidth({ width, height, className = '', children }, ref) {
  const outerRef = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const outer = outerRef.current
    if (!outer) return undefined
    const update = () => setScale(Math.min(1, outer.clientWidth / width))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(outer)
    return () => observer.disconnect()
  }, [width])

  return (
    // overflow: hidden because a transform does not shrink the layout box of the scaled content.
    <div ref={outerRef} className={className} style={{ width: '100%', minWidth: 0, height: height * scale, overflow: 'hidden' }}>
      <div ref={ref} style={{ width, height, margin: '0 auto', transform: `scale(${scale})`, transformOrigin: '0 0' }}>
        {children}
      </div>
    </div>
  )
})

export default FitToWidth
