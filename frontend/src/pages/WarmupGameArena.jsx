import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { warmupGameChapters, getWarmupChapter } from '../data/warmupGames'
import { useAuthStore } from '../store'

const REWARD_STORAGE_KEY = 'enginelab_practice_rewards'

const readRewards = () => {
  try {
    return JSON.parse(localStorage.getItem(REWARD_STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

const writeRewards = (rewards) => {
  localStorage.setItem(REWARD_STORAGE_KEY, JSON.stringify(rewards))
}

const defaultSession = {
  started: false,
  questionIndex: 0,
  selectedOption: null,
  score: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  finished: false,
  rewardFlash: null,
}

const rewardBadges = [
  {
    id: 'first_practice',
    name: 'Khởi động đầu tiên',
    description: 'Hoàn thành một lượt luyện tập.',
  },
  {
    id: 'perfect_round',
    name: 'Vòng hoàn hảo',
    description: 'Trả lời đúng toàn bộ câu hỏi trong một chương.',
  },
  {
    id: 'engine_runner',
    name: 'Tay đua kiến thức',
    description: 'Đạt chuỗi đúng từ 3 câu trở lên.',
  },
  {
    id: 'xp_1000',
    name: 'Thợ máy bền bỉ',
    description: 'Tích lũy từ 1000 XP luyện tập.',
  },
]

const buildInitialRewards = (userId) => {
  const allRewards = readRewards()
  return (
    allRewards[userId] || {
      xp: 0,
      bestScore: 0,
      completedRounds: 0,
      unlockedBadges: [],
      chapterScores: {},
    }
  )
}

export default function WarmupGameArena() {
  const { user } = useAuthStore()
  const userId = user?.id || user?.username || 'guest'
  const [activeChapterId, setActiveChapterId] = useState(warmupGameChapters[0].id)
  const [activeGuide, setActiveGuide] = useState({
    type: 'quiz',
    title: warmupGameChapters[0].gameTitle,
    steps: [
      'Bấm Bắt đầu để làm câu hỏi nhanh theo chương.',
      'Chọn đáp án, đọc giải thích sau mỗi câu.',
      'Hoàn thành lượt chơi để nhận XP và huy hiệu.',
    ],
  })
  const [session, setSession] = useState(defaultSession)
  const [rewards, setRewards] = useState(() => buildInitialRewards(userId))

  const activeChapter = getWarmupChapter(activeChapterId)
  const currentQuestion = activeChapter.questions[session.questionIndex]
  const progressPercent = Math.round((session.questionIndex / activeChapter.questions.length) * 100)
  const playerLevel = Math.max(1, Math.floor((rewards.xp || 0) / 500) + 1)
  const nextLevelXp = playerLevel * 500
  const levelProgress = Math.min(100, Math.round(((rewards.xp || 0) / nextLevelXp) * 100))
  const accuracy = session.finished
    ? Math.round((session.correct / activeChapter.questions.length) * 100)
    : 0

  const unlockedBadgeSet = useMemo(
    () => new Set(rewards.unlockedBadges || []),
    [rewards.unlockedBadges]
  )

  const saveRewardState = (nextRewards) => {
    const allRewards = readRewards()
    allRewards[userId] = nextRewards
    writeRewards(allRewards)
    setRewards(nextRewards)
  }

  const unlockBadges = (nextRewards, finalSession) => {
    const unlocked = new Set(nextRewards.unlockedBadges || [])
    const newlyUnlocked = []

    const unlock = (badgeId) => {
      if (!unlocked.has(badgeId)) {
        unlocked.add(badgeId)
        newlyUnlocked.push(badgeId)
      }
    }

    unlock('first_practice')
    if (finalSession.correct === activeChapter.questions.length) unlock('perfect_round')
    if (finalSession.bestStreak >= 3) unlock('engine_runner')
    if (nextRewards.xp >= 1000) unlock('xp_1000')

    return {
      rewards: {
        ...nextRewards,
        unlockedBadges: [...unlocked],
      },
      newlyUnlocked,
    }
  }

  const startPractice = () => {
    setSession({
      ...defaultSession,
      started: true,
    })
  }

  const chooseChapter = (chapterId) => {
    const chapter = getWarmupChapter(chapterId)
    setActiveChapterId(chapterId)
    setActiveGuide({
      type: 'quiz',
      title: chapter.gameTitle,
      steps: [
        'Bấm Bắt đầu để mở lượt luyện tập của chương này.',
        'Trả lời từng câu, sau đó đọc giải thích để sửa lỗi hiểu sai.',
        'Kết thúc lượt chơi để lưu XP, kỉ lục và huy hiệu.',
      ],
    })
    setSession(defaultSession)
  }

  const showDesignGuide = () => {
    setActiveGuide({
      type: 'design',
      title: 'Thiết kế sơ đồ kiến thức',
      steps: [
        'Mở phòng quiz trò chơi, chọn mẫu phù hợp với bài hoặc chương đang học.',
        'Thêm khối, kéo thả để sắp xếp cấu tạo, quy trình hoặc dòng năng lượng.',
        'Nối mũi tên giữa các khối và ghi chú nhiệm vụ của từng phần, sau đó lưu sơ đồ.',
      ],
    })
  }

  const answerQuestion = (optionIndex) => {
    if (!session.started || session.finished || session.selectedOption !== null) return

    const isCorrect = optionIndex === currentQuestion.answer
    const nextStreak = isCorrect ? session.streak + 1 : 0
    const bonus = isCorrect ? Math.min(nextStreak * 10, 40) : 0
    const earned = isCorrect ? 100 + bonus : 10

    setSession((current) => ({
      ...current,
      selectedOption: optionIndex,
      score: current.score + earned,
      correct: current.correct + (isCorrect ? 1 : 0),
      streak: nextStreak,
      bestStreak: Math.max(current.bestStreak, nextStreak),
      rewardFlash: {
        type: isCorrect ? 'success' : 'retry',
        text: isCorrect ? `+${earned} XP` : '+10 XP cố gắng',
      },
    }))

    toast[isCorrect ? 'success' : 'error'](
      isCorrect ? `Chính xác! +${earned} XP` : 'Chưa đúng, đọc gợi ý rồi thử câu tiếp theo'
    )
  }

  const nextQuestion = () => {
    const nextIndex = session.questionIndex + 1
    const isFinished = nextIndex >= activeChapter.questions.length

    if (!isFinished) {
      setSession((current) => ({
        ...current,
        questionIndex: nextIndex,
        selectedOption: null,
        rewardFlash: null,
      }))
      return
    }

    const finalSession = {
      ...session,
      finished: true,
    }
    const chapterBest = Math.max(rewards.chapterScores?.[activeChapter.id] || 0, session.score)
    const baseRewards = {
      ...rewards,
      xp: rewards.xp + session.score,
      bestScore: Math.max(rewards.bestScore || 0, session.score),
      completedRounds: (rewards.completedRounds || 0) + 1,
      chapterScores: {
        ...(rewards.chapterScores || {}),
        [activeChapter.id]: chapterBest,
      },
    }
    const { rewards: nextRewards, newlyUnlocked } = unlockBadges(baseRewards, finalSession)
    saveRewardState(nextRewards)

    setSession((current) => ({
      ...current,
      finished: true,
      rewardFlash: {
        type: 'finish',
        text: newlyUnlocked.length
          ? `Mở khóa ${newlyUnlocked.length} huy hiệu mới`
          : `Hoàn thành +${session.score} XP`,
      },
    }))

    toast.success('Hoàn thành lượt luyện tập')
  }

  const resetPractice = () => {
    setSession(defaultSession)
  }

  return (
    <div className="page-container">
      <section className="motion-pop mb-6 border-b border-slate-200 pb-6">
        <p className="muted-label mb-2">Kho game luyện tập</p>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Trạm luyện tập Công nghệ cơ khí 11</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Học sinh chọn chương và luyện tập độc lập bằng câu hỏi nhanh. Mỗi lượt có XP, chuỗi
              trả lời đúng, huy hiệu và phần thưởng để ghi nhớ kiến thức trước hoặc sau bài học.
            </p>
          </div>
          <div className="motion-pulse-soft w-full rounded-lg border border-slate-800 bp-sheet-dark px-5 py-4 text-white shadow-sm lg:w-[320px]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-blue-200">Level</p>
                <p className="text-4xl font-bold">{playerLevel}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase text-slate-300">Tổng XP</p>
                <p className="text-2xl font-bold text-blue-200">{rewards.xp || 0}</p>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700">
              <div className="h-full bg-blue-400" style={{ width: `${levelProgress}%` }}></div>
            </div>
            <p className="mt-2 text-xs text-slate-300">Mốc tiếp theo: {nextLevelXp} XP</p>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-5">
        {warmupGameChapters.map((chapter) => (
          <button
            key={chapter.id}
            type="button"
            onClick={() => chooseChapter(chapter.id)}
            className={`motion-card rounded-lg border p-4 text-left transition ${
              activeChapterId === chapter.id
                ? 'border-blue-500 bg-blue-50 text-blue-950'
                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
            }`}
          >
            <p className="text-xs font-bold uppercase">Chương {chapter.id}</p>
            <p className="mt-2 text-sm font-bold leading-6">{chapter.gameTitle}</p>
            <p className="mt-2 text-xs text-slate-500">
              Kỉ lục: {rewards.chapterScores?.[chapter.id] || 0} XP
            </p>
          </button>
        ))}
        <button
          type="button"
          onClick={showDesignGuide}
          className={`motion-card rounded-lg border p-4 text-left transition ${
            activeGuide.type === 'design'
              ? 'border-violet-500 bg-violet-50 text-violet-950'
              : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300'
          }`}
        >
          <p className="text-xs font-bold uppercase">Hoạt động</p>
          <p className="mt-2 text-sm font-bold leading-6">Thiết kế sơ đồ kiến thức</p>
          <p className="mt-2 text-xs text-slate-500">Kéo thả khối, nối mũi tên, lưu sơ đồ</p>
        </button>
      </section>

      <section className="motion-pop mb-6 rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-cyan-50 p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-violet-700">Hướng dẫn hoạt động</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{activeGuide.title}</h2>
            <ol className="mt-3 space-y-1 text-sm leading-6 text-slate-700">
              {activeGuide.steps.map((step, index) => (
                <li key={step}>{index + 1}. {step}</li>
              ))}
            </ol>
          </div>
          {activeGuide.type === 'design' && (
            <Link to="/game-rooms" className="primary-button shrink-0">
              Mở phòng quiz trò chơi
            </Link>
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <main className="space-y-5">
          <section className="panel p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div>
                <p className="muted-label">Game đang luyện</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">{activeChapter.gameTitle}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{activeChapter.objective}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                  {activeChapter.duration}
                </span>
                <span className="rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  {activeChapter.questions.length} câu hỏi
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {activeChapter.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="muted-label">Lượt luyện tập</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    {session.finished
                      ? 'Hoàn thành thử thách'
                      : session.started
                        ? `Câu ${session.questionIndex + 1}/${activeChapter.questions.length}`
                        : 'Sẵn sàng bắt đầu'}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={startPractice} className="primary-button">
                    Bắt đầu
                  </button>
                  <button type="button" onClick={resetPractice} className="secondary-button">
                    Làm lại
                  </button>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${session.finished ? 100 : progressPercent}%` }}
                ></div>
              </div>
            </div>

            {!session.started ? (
              <div className="p-10 text-center">
                <p className="text-lg font-bold text-slate-950">Chọn chương và bấm Bắt đầu</p>
                <p className="mt-2 text-sm text-slate-600">
                  Trả lời càng nhiều câu đúng liên tiếp thì XP thưởng combo càng cao.
                </p>
              </div>
            ) : session.finished ? (
              <div className="p-8">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
                  <p className="text-sm font-semibold uppercase">Phần thưởng lượt chơi</p>
                  <h3 className="mt-2 text-3xl font-bold">{session.score} XP</h3>
                  <p className="mt-2 text-sm leading-6">
                    Đúng {session.correct}/{activeChapter.questions.length} câu · Độ chính xác {accuracy}% ·
                    Chuỗi tốt nhất {session.bestStreak}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={startPractice} className="primary-button">
                    Chơi lượt mới
                  </button>
                  <button type="button" onClick={resetPractice} className="secondary-button">
                    Về màn chọn
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                {session.rewardFlash && (
                  <div
                    className={`mb-5 rounded-lg border px-5 py-4 text-center text-lg font-bold shadow-sm ${
                      session.rewardFlash.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-amber-200 bg-amber-50 text-amber-800'
                    }`}
                  >
                    {session.rewardFlash.text}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-blue-50 p-4 text-blue-950">
                    <p className="text-xs font-semibold uppercase">Điểm lượt này</p>
                    <p className="mt-1 text-3xl font-bold">{session.score}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4 text-emerald-950">
                    <p className="text-xs font-semibold uppercase">Đúng</p>
                    <p className="mt-1 text-3xl font-bold">{session.correct}</p>
                  </div>
                  <div className="rounded-lg bg-violet-50 p-4 text-violet-950">
                    <p className="text-xs font-semibold uppercase">Combo</p>
                    <p className="mt-1 text-3xl font-bold">x{session.streak}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-xl font-bold leading-8 text-slate-950">{currentQuestion.prompt}</h3>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {currentQuestion.options.map((option, index) => {
                      const isChosen = session.selectedOption === index
                      const isAnswer = currentQuestion.answer === index
                      const showResult = session.selectedOption !== null
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => answerQuestion(index)}
                          disabled={showResult}
                          className={`rounded-lg border bg-white p-4 text-left text-sm leading-6 transition disabled:cursor-default ${
                            showResult && isAnswer
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                              : isChosen
                                ? 'border-red-400 bg-red-50 text-red-900'
                                : 'border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                  {session.selectedOption !== null && (
                    <div className="mt-4 rounded-lg bg-white p-4 text-sm leading-6 text-slate-700">
                      <span className="font-bold text-slate-950">Giải thích: </span>
                      {currentQuestion.explanation}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={nextQuestion}
                  className="primary-button mt-5"
                  disabled={session.selectedOption === null}
                >
                  {session.questionIndex + 1 >= activeChapter.questions.length ? 'Nhận thưởng' : 'Câu tiếp theo'}
                </button>
              </div>
            )}
          </section>
        </main>

        <aside className="space-y-5">
          <section className="panel p-5">
            <h2 className="text-lg font-bold text-slate-950">Hồ sơ phần thưởng</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Tổng XP</p>
                <p className="mt-1 text-2xl font-bold text-slate-950">{rewards.xp || 0}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Kỉ lục</p>
                <p className="mt-1 text-2xl font-bold text-slate-950">{rewards.bestScore || 0}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Lượt chơi</p>
                <p className="mt-1 text-2xl font-bold text-slate-950">{rewards.completedRounds || 0}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Huy hiệu</p>
                <p className="mt-1 text-2xl font-bold text-slate-950">{rewards.unlockedBadges?.length || 0}</p>
              </div>
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="text-lg font-bold text-slate-950">Huy hiệu luyện tập</h2>
            <div className="mt-4 space-y-3">
              {rewardBadges.map((badge) => {
                const unlocked = unlockedBadgeSet.has(badge.id)
                return (
                  <div
                    key={badge.id}
                    className={`rounded-lg border p-4 ${
                      unlocked
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <p className="font-bold">{unlocked ? 'Đã nhận' : 'Chưa nhận'} · {badge.name}</p>
                    <p className="mt-2 text-sm leading-6">{badge.description}</p>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-blue-950">
            <h2 className="font-bold">Cách tính thưởng</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              <li>Đúng: 100 XP + thưởng combo.</li>
              <li>Sai: 10 XP cố gắng để khuyến khích luyện tiếp.</li>
              <li>Chuỗi đúng càng dài, thưởng mỗi câu càng cao.</li>
              <li>Hoàn thành lượt chơi sẽ lưu XP và mở huy hiệu nếu đạt điều kiện.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
