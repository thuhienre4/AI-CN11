import { useEffect } from 'react'

import { recordLocalLearningEvent } from '../utils/learningProgress'


export const useLearningSession = ({ userId, lessonId, eventType = 'lesson_session', payload = null }) => {
  useEffect(() => {
    if (!userId || !lessonId) return undefined

    let accumulatedMilliseconds = 0
    let activeSince = document.visibilityState === 'visible' ? performance.now() : null
    let saved = false

    const pause = () => {
      if (activeSince == null) return
      accumulatedMilliseconds += performance.now() - activeSince
      activeSince = null
    }

    const resume = () => {
      if (activeSince == null && document.visibilityState === 'visible') activeSince = performance.now()
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') resume()
      else pause()
    }

    const save = () => {
      if (saved) return
      pause()
      const durationSeconds = Math.round(accumulatedMilliseconds / 1000)
      if (durationSeconds > 0) {
        recordLocalLearningEvent(userId, {
          lesson_id: Number(lessonId),
          event_type: eventType,
          duration_seconds: durationSeconds,
          payload,
        })
      }
      saved = true
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pagehide', save)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pagehide', save)
      save()
    }
  }, [eventType, lessonId, payload, userId])
}
