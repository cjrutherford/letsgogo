import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { challenges, TOTAL_POINTS } from './challenges'

interface LessonProgress {
  scrollProgress: number
  challengesCompleted: string[]
}

interface UserProgress {
  completedChallenges: string[]
  lessonScores: Record<string, number>
  completedLessons: string[]
  completedSubLessons: string[]
  lessonProgress: Record<string, LessonProgress>
}

interface ProgressContextType {
  score: number
  completedChallenges: string[]
  lessonScores: Record<string, number>
  completedLessons: string[]
  completedSubLessons: string[]
  lessonProgress: Record<string, LessonProgress>
  completeChallenge: (challengeId: string, points: number) => void
  uncompleteChallenge: (challengeId: string) => void
  getModuleScore: (moduleId: string) => number
  getModuleMaxPoints: (moduleId: string) => number
  isChallengeCompleted: (challengeId: string) => boolean
  totalPoints: number
  maxPoints: number
  completeLesson: (lessonId: string) => void
  uncompleteLesson: (lessonId: string) => void
  completeSubLesson: (subLessonId: string, parentLessonId?: string) => void
  uncompleteSubLesson: (subLessonId: string) => void
  isLessonCompleted: (lessonId: string) => boolean
  isSubLessonCompleted: (subLessonId: string) => boolean
  updateLessonProgress: (lessonId: string, progress: Partial<LessonProgress>) => void
  getLessonProgress: (lessonId: string) => LessonProgress | null
  resetAllProgress: () => void
}

const STORAGE_KEY = 'lets-go-go-progress'

const defaultLessonProgress: LessonProgress = {
  scrollProgress: 0,
  challengesCompleted: []
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([])
  const [lessonScores, setLessonScores] = useState<Record<string, number>>({})
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [completedSubLessons, setCompletedSubLessons] = useState<string[]>([])
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({})

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data: UserProgress = JSON.parse(saved)
        setCompletedChallenges(data.completedChallenges || [])
        setLessonScores(data.lessonScores || {})
        setCompletedLessons(data.completedLessons || [])
        setCompletedSubLessons(data.completedSubLessons || [])
        setLessonProgress(data.lessonProgress || {})
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const saveProgress = (
    completed: string[], 
    scores: Record<string, number>,
    lessons: string[],
    subLessons: string[],
    progress: Record<string, LessonProgress>
  ) => {
    const data: UserProgress = {
      completedChallenges: completed,
      lessonScores: scores,
      completedLessons: lessons,
      completedSubLessons: subLessons,
      lessonProgress: progress
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  const completeChallenge = (challengeId: string, points: number) => {
    if (!completedChallenges.includes(challengeId)) {
      const newCompleted = [...completedChallenges, challengeId]
      const newScores = { ...lessonScores, [challengeId]: points }
      setCompletedChallenges(newCompleted)
      setLessonScores(newScores)
      saveProgress(newCompleted, newScores, completedLessons, completedSubLessons, lessonProgress)
    }
  }

  const uncompleteChallenge = (challengeId: string) => {
    if (completedChallenges.includes(challengeId)) {
      const newCompleted = completedChallenges.filter(id => id !== challengeId)
      const newScores = { ...lessonScores }
      delete newScores[challengeId]
      setCompletedChallenges(newCompleted)
      setLessonScores(newScores)
      saveProgress(newCompleted, newScores, completedLessons, completedSubLessons, lessonProgress)
    }
  }

  const completeLesson = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      const newCompleted = [...completedLessons, lessonId]
      setCompletedLessons(newCompleted)
      saveProgress(completedChallenges, lessonScores, newCompleted, completedSubLessons, lessonProgress)
    }
  }

  const uncompleteLesson = (lessonId: string) => {
    if (completedLessons.includes(lessonId)) {
      const newCompleted = completedLessons.filter(id => id !== lessonId)
      setCompletedLessons(newCompleted)
      saveProgress(completedChallenges, lessonScores, newCompleted, completedSubLessons, lessonProgress)
    }
  }

  const uncompleteSubLesson = (subLessonId: string) => {
    if (completedSubLessons.includes(subLessonId)) {
      const newCompleted = completedSubLessons.filter(id => id !== subLessonId)
      setCompletedSubLessons(newCompleted)
      saveProgress(completedChallenges, lessonScores, completedLessons, newCompleted, lessonProgress)
    }
  }

  const resetAllProgress = () => {
    setCompletedChallenges([])
    setLessonScores({})
    setCompletedLessons([])
    setCompletedSubLessons([])
    setLessonProgress({})
    saveProgress([], {}, [], [], {})
  }

  const completeSubLesson = (subLessonId: string, parentLessonId?: string) => {
    let newCompleted = completedSubLessons
    let newLessons = completedLessons
    
    if (!completedSubLessons.includes(subLessonId)) {
      newCompleted = [...completedSubLessons, subLessonId]
      setCompletedSubLessons(newCompleted)
    }
    
    // Auto-complete parent lesson if all sub-lessons are done
    if (parentLessonId && !completedLessons.includes(parentLessonId)) {
      // Check if this sub-lesson's parent has all sub-lessons completed.
      // Note: framework modules (gin, echo, fiber, chi) are full modules with their
      // own top-level lessons — they don't use the sub-lesson grouping mechanism here.
      const basicsSubLessons = ['basic-types', 'type-conversion', 'custom-types']
      const functionsSubLessons = ['function-declarations', 'multiple-returns', 'variadic-functions']
      const controlFlowSubLessons = ['if-else', 'switch-statements', 'loops']
      const packagesSubLessons = ['package-declaration', 'import-statements', 'init-functions']
      const errorHandlingSubLessons = ['error-values', 'error-wrapping', 'custom-errors']
      const deferSubLessons = ['defer-statements', 'panic-recover', 'defer-patterns']
      const gcSubLessons = ['memory-optimization', 'object-pooling', 'memory-profiling']
      const selectSubLessons = ['basic-select', 'select-timeouts', 'channel-patterns']
      const waitgroupSubLessons = ['waitgroup-basics', 'mutex-patterns', 'rw-mutex']
      const benchmarkSubLessons = ['benchmark-basics', 'benchmark-examples', 'profiling-benchmarks']
      const middlewareSubLessons = ['middleware-pattern', 'common-middleware', 'middleware-third-party']
      const encodingSubLessons = ['json-encoding', 'xml-toml', 'gob-encoding']
      const httpSubLessons = ['http-client', 'context-basics', 'context-advanced']
      const profilingSubLessons = ['cpu-profiling', 'memory-profiling-p', 'pprof-tool']
      const deploymentSubLessons = ['docker-basics', 'multistage-builds', 'cicd-integration']
      
      const subLessonGroups = [
        { group: basicsSubLessons, parentId: 'basics-02' },
        { group: functionsSubLessons, parentId: 'basics-03' },
        { group: controlFlowSubLessons, parentId: 'basics-04' },
        { group: packagesSubLessons, parentId: 'basics-05' },
        { group: errorHandlingSubLessons, parentId: 'ts-go-03' },
        { group: deferSubLessons, parentId: 'quirks-03' },
        { group: gcSubLessons, parentId: 'gc-03' },
        { group: selectSubLessons, parentId: 'conc-03' },
        { group: waitgroupSubLessons, parentId: 'par-01' },
        { group: benchmarkSubLessons, parentId: 'test-03' },
        { group: middlewareSubLessons, parentId: 'web-03' },
        { group: encodingSubLessons, parentId: 'stdlib-02' },
        { group: httpSubLessons, parentId: 'stdlib-03' },
        { group: profilingSubLessons, parentId: 'polish-01' },
        { group: deploymentSubLessons, parentId: 'polish-03' },
      ]
      
      let parentComplete = false
      for (const sg of subLessonGroups) {
        if (sg.group.includes(subLessonId)) {
          parentComplete = sg.group.every(sl => newCompleted.includes(sl))
          break
        }
      }
      
      if (parentComplete && !completedLessons.includes(parentLessonId)) {
        newLessons = [...completedLessons, parentLessonId]
        setCompletedLessons(newLessons)
      }
    }
    
    saveProgress(completedChallenges, lessonScores, newLessons, newCompleted, lessonProgress)
  }

  const isChallengeCompleted = (challengeId: string) => {
    return completedChallenges.includes(challengeId)
  }

  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.includes(lessonId)
  }

  const isSubLessonCompleted = (subLessonId: string) => {
    return completedSubLessons.includes(subLessonId)
  }

  const updateLessonProgress = (lessonId: string, progress: Partial<LessonProgress>) => {
    const currentProgress = lessonProgress[lessonId] || defaultLessonProgress
    const newProgress = { ...currentProgress, ...progress }
    const newLessonProgress = { ...lessonProgress, [lessonId]: newProgress }
    setLessonProgress(newLessonProgress)
    saveProgress(completedChallenges, lessonScores, completedLessons, completedSubLessons, newLessonProgress)
  }

  const getLessonProgress = (lessonId: string): LessonProgress => {
    return lessonProgress[lessonId] || defaultLessonProgress
  }

  const getModuleScore = (moduleId: string) => {
    const moduleLessonMap: Record<string, string[]> = {
      'basics': ['b-01', 'b-02', 'b-03', 'b-04', 'b-05', 'b-06', 'b-07', 'b-08'],
      'typescript-to-go': ['tsg-01', 'tsg-02', 'tsg-03', 'tsg-04', 'tsg-05', 'tsg-06', 'tsg-07'],
      'quirks': ['q-01', 'q-02', 'q-03'],
      'gc': ['gc-01', 'gc-02', 'gc-03'],
      'concurrency': ['c-01', 'c-02', 'c-03', 'c-04', 'c-05'],
      'parallelism': ['p-01', 'p-02'],
      'testing': ['t-01', 't-02', 't-03', 't-04'],
      'webservices': ['w-01', 'w-02', 'w-03'],
      'stdlib': ['s-01', 's-02', 's-03'],
      'gin': ['gin-01', 'gin-02', 'gin-03', 'gin-04'],
      'echo': ['echo-01', 'echo-02', 'echo-03', 'echo-04'],
      'fiber': ['fiber-01', 'fiber-02', 'fiber-03', 'fiber-04'],
      'chi': ['chi-01', 'chi-02', 'chi-03', 'chi-04'],
      'db-tools': ['pkg-02', 'pkg-03'],
      'polish': ['pol-01', 'pol-02', 'pol-03']
    }
    
    const moduleChallenges = moduleLessonMap[moduleId] || []
    return moduleChallenges.reduce((sum, id) => {
      const challenge = challenges.find(c => c.id === id)
      return sum + (completedChallenges.includes(id) ? (challenge?.points || 0) : 0)
    }, 0)
  }

  const getModuleMaxPoints = (moduleId: string) => {
    const moduleLessonMap: Record<string, string[]> = {
      'basics': ['b-01', 'b-02', 'b-03', 'b-04', 'b-05', 'b-06', 'b-07', 'b-08'],
      'typescript-to-go': ['tsg-01', 'tsg-02', 'tsg-03', 'tsg-04', 'tsg-05', 'tsg-06', 'tsg-07'],
      'quirks': ['q-01', 'q-02', 'q-03'],
      'gc': ['gc-01', 'gc-02', 'gc-03'],
      'concurrency': ['c-01', 'c-02', 'c-03', 'c-04', 'c-05'],
      'parallelism': ['p-01', 'p-02'],
      'testing': ['t-01', 't-02', 't-03', 't-04'],
      'webservices': ['w-01', 'w-02', 'w-03'],
      'stdlib': ['s-01', 's-02', 's-03'],
      'gin': ['gin-01', 'gin-02', 'gin-03', 'gin-04'],
      'echo': ['echo-01', 'echo-02', 'echo-03', 'echo-04'],
      'fiber': ['fiber-01', 'fiber-02', 'fiber-03', 'fiber-04'],
      'chi': ['chi-01', 'chi-02', 'chi-03', 'chi-04'],
      'db-tools': ['pkg-02', 'pkg-03'],
      'polish': ['pol-01', 'pol-02', 'pol-03']
    }
    
    const moduleChallenges = moduleLessonMap[moduleId] || []
    return moduleChallenges.reduce((sum, id) => {
      const challenge = challenges.find(c => c.id === id)
      return sum + (challenge?.points || 0)
    }, 0)
  }

  const score = Object.values(lessonScores).reduce((a, b) => a + b, 0)

  return (
    <ProgressContext.Provider value={{
      score,
      completedChallenges,
      lessonScores,
      completedLessons,
      completedSubLessons,
      lessonProgress,
      completeChallenge,
      uncompleteChallenge,
      getModuleScore,
      getModuleMaxPoints,
      isChallengeCompleted,
      totalPoints: score,
      maxPoints: TOTAL_POINTS,
      completeLesson,
      uncompleteLesson,
      completeSubLesson,
      uncompleteSubLesson,
      isLessonCompleted,
      isSubLessonCompleted,
      updateLessonProgress,
      getLessonProgress,
      resetAllProgress
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}
