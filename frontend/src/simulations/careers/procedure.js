// A workplace procedure played in 3D: the student clicks objects in the scene in the right order.
// A step names the part to click, what to do, what it achieved, and why it cannot be done earlier.
// Clicking a step's part too early, or a hazard, is a mistake with its reason; anything else just shows the part.

export const startProcedure = () => ({ index: 0, mistakes: 0, message: null, done: false, selected: null })

const resolve = (value, index) => (typeof value === 'function' ? value(index) : value)

/** The state after the student clicks `part` (a part id of the scene, or null for empty space). */
export const clickPart = (sim, state, part) => {
  if (!part || state.done) return { ...state, selected: part ?? state.selected }
  const step = sim.steps[state.index]
  if (part === step.part) {
    const index = state.index + 1
    return { ...state, index, done: index === sim.steps.length, selected: part, message: { tone: 'ok', text: step.done } }
  }
  const hazard = resolve(sim.hazards?.[part], state.index)
  if (hazard) return { ...state, mistakes: state.mistakes + 1, selected: part, message: { tone: 'danger', text: hazard } }
  const later = sim.steps.slice(state.index + 1).find((item) => item.part === part)
  if (later) {
    const reason = resolve(later.early, state.index) || `Chưa đến lúc. Việc cần làm bây giờ: ${step.instruction}`
    return { ...state, mistakes: state.mistakes + 1, selected: part, message: { tone: 'warn', text: reason } }
  }
  return { ...state, selected: part, message: null }
}

/** Three stars without a mistake, two with one or two, one otherwise. */
export const procedureStars = (mistakes) => (mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1)
