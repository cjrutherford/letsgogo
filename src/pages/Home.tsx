import { Link } from 'react-router-dom'
import { ChevronRight, Rocket, Sparkles, ArrowRight, Trophy, X, Lightbulb, ChevronDown, CheckCircle, Circle } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useProgress } from '../lib/progress'
import { useEffect, useState } from 'react'
import { challenges, type CodeChallenge } from '../lib/challenges'
import { CodePlayground } from '../components/CodePlayground'
import { lessonContent, extractExcerpt } from '../lib/content'
import { modulesData } from '../components/LessonView'

const topicExcerpts: Record<string, string> = {
  'type-system-comparison': extractExcerpt(lessonContent['type-system-comparison']),
  'error-handling': extractExcerpt(lessonContent['error-handling']),
  'values-vs-pointers': extractExcerpt(lessonContent['values-vs-pointers']),
  'slices-arrays-maps': extractExcerpt(lessonContent['slices-arrays-maps']),
  'defer-panic-recover': extractExcerpt(lessonContent['defer-panic-recover']),
  'goroutines-101': extractExcerpt(lessonContent['goroutines-101']),
  'channels': extractExcerpt(lessonContent['channels']),
  'select-statement': extractExcerpt(lessonContent['select-statement']),
  'waitgroup-mutex': extractExcerpt(lessonContent['waitgroup-mutex']),
  'sync-atomic': extractExcerpt(lessonContent['sync-atomic']),
  'testing-package': extractExcerpt(lessonContent['testing-package']),
  'table-tests': extractExcerpt(lessonContent['table-tests']),
  'benchmarks': extractExcerpt(lessonContent['benchmarks']),
  'escape-analysis': extractExcerpt(lessonContent['escape-analysis']),
  'net-http-basics': extractExcerpt(lessonContent['net-http-basics']),
  'fmt-strings-strconv': extractExcerpt(lessonContent['fmt-strings-strconv']),
  'web-frameworks': extractExcerpt(lessonContent['web-frameworks']),
  'profiling': extractExcerpt(lessonContent['profiling'])
}

function ChallengeSidebar({ isOpen, onClose, onSelectChallenge }: { 
  isOpen: boolean
  onClose: () => void
  onSelectChallenge: (challenge: CodeChallenge) => void
}) {
  const { isChallengeCompleted, score: userScore } = useProgress()
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')

  const filteredChallenges = challenges.filter(c => 
    filter === 'all' || c.difficulty === filter
  )

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'var(--color-bg-deep)' }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: 'var(--color-bg-hover)' }}
          >
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy size={20} style={{ color: 'var(--color-amber-400)' }} />
                Challenges
              </h2>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {userScore} / {challenges.reduce((s, c) => s + c.points, 0)} points
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-white/10"
            >
              <X size={20} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>

          {/* Filters */}
          <div className="p-3 border-b flex gap-2" style={{ borderColor: 'var(--color-bg-hover)' }}>
            {(['all', 'easy', 'medium', 'hard'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  filter === f ? 'font-medium' : ''
                }`}
                style={{
                  background: filter === f ? 'var(--color-amber-500)' : 'var(--color-bg-card)',
                  color: filter === f ? 'var(--color-bg-deep)' : 'var(--color-text-muted)'
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Challenge List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {filteredChallenges.map((challenge) => {
              const completed = isChallengeCompleted(challenge.id)
              const excerpt = topicExcerpts[challenge.lessonSlug] || ''
              
              return (
                <button
                  key={challenge.id}
                  onClick={() => onSelectChallenge(challenge)}
                  className="w-full text-left p-3 rounded-xl border transition-all hover:scale-[1.01]"
                  style={{
                    background: completed ? 'rgba(16, 185, 129, 0.05)' : 'var(--color-bg-card)',
                    borderColor: completed ? 'rgba(16, 185, 129, 0.3)' : 'var(--color-bg-hover)'
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-white text-sm">{challenge.title}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {completed && <span className="text-green-400 text-xs">✓</span>}
                      <span 
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          challenge.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                          challenge.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {challenge.points}pts
                      </span>
                    </div>
                  </div>
                  
                  {excerpt && (
                    <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                      {excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ 
                      background: 'var(--color-bg-hover)',
                      color: 'var(--color-text-muted)'
                    }}>
                      {challenge.lessonSlug.replace(/-/g, ' ')}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div 
        className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
        style={{ 
          background: 'radial-gradient(circle, var(--color-amber-500) 0%, transparent 70%)',
          top: '-10%',
          right: '-5%'
        }}
      />
      <div 
        className="absolute w-64 h-64 rounded-full opacity-15 blur-3xl"
        style={{ 
          background: 'radial-gradient(circle, var(--color-amber-400) 0%, transparent 70%)',
          bottom: '10%',
          left: '-10%'
        }}
      />
    </div>
  )
}

export function Home() {
  const { user } = useAuth()
  const { score, maxPoints, completeChallenge, isLessonCompleted, getModuleScore, getModuleMaxPoints } = useProgress()
  const [completedCount, setCompletedCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<CodeChallenge | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('completedLessons')
    if (saved) {
      setCompletedCount(JSON.parse(saved).length)
    }
  }, [])

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const progress = Math.round((completedCount / 30) * 100)
  const scoreProgress = maxPoints > 0 ? Math.round((score / maxPoints) * 100) : 0

  return (
    <div className="relative min-h-full">
      <AnimatedBackground />
      
      <div className="relative max-w-4xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        
        {/* Hero section */}
        <div className={`text-center mb-12 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ 
              background: 'var(--color-amber-glow)',
              color: 'var(--color-amber-300)',
              border: '1px solid rgba(251, 191, 36, 0.2)'
            }}
          >
            <Sparkles size={12} />
            <span>Zero to Hero in Go</span>
          </div>
          
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Let's <span className="gradient-text">go</span> Go
          </h1>
          
          <p className="text-base lg:text-lg max-w-2xl mx-auto mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Master Go's unique approach to memory, concurrency, and building services. 
            Interactive lessons with real code execution.
          </p>

          {/* Prominent Score Display */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <div 
              className="flex items-center gap-3 px-5 py-3 rounded-xl border"
              style={{ 
                background: 'var(--color-bg-card)',
                borderColor: 'var(--color-amber-500)'
              }}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--color-amber-glow)' }}
              >
                <Trophy size={22} style={{ color: 'var(--color-amber-400)' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Your Score</p>
                <p className="text-xl font-bold text-white">
                  {score} <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>/ {maxPoints}</span>
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border transition-all hover:scale-105"
              style={{ 
                background: 'var(--color-bg-card)',
                borderColor: 'var(--color-bg-hover)'
              }}
            >
              <Lightbulb size={18} style={{ color: 'var(--color-amber-400)' }} />
              <span className="text-white font-medium">Challenges</span>
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'var(--color-amber-500)', color: 'var(--color-bg-deep)' }}
              >
                {challenges.length}
              </span>
            </button>
          </div>

          {user && (
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg" style={{ background: 'var(--color-bg-card)' }}>
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold"
                style={{ background: 'var(--color-amber-500)', color: 'var(--color-bg-deep)' }}
              >
                {user.email[0]?.toUpperCase()}
              </div>
              <span className="text-white">Welcome back, {user.email.split('@')[0]}</span>
            </div>
          )}
        </div>

        {/* Quick start CTA */}
        <div className={`mb-10 ${mounted ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
          <Link
            to="/module/typescript-to-go"
            className="group flex items-center justify-center gap-3 w-full lg:w-auto mx-auto px-8 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02]"
            style={{ 
              background: 'linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-amber-400) 100%)',
              color: 'var(--color-bg-deep)',
              boxShadow: '0 8px 30px rgba(251, 191, 36, 0.3)'
            }}
          >
            <Rocket size={20} />
            <span>Start Learning</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Score & Progress summary */}
        {(score > 0 || completedCount > 0) && (
          <div 
            className={`mb-10 p-5 rounded-xl border ${mounted ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}
            style={{ 
              background: 'var(--color-bg-card)',
              borderColor: 'var(--color-bg-hover)'
            }}
          >
            {/* Score Display */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--color-amber-glow)' }}
                >
                  <Trophy size={24} style={{ color: 'var(--color-amber-400)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Total Score</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-2">
                    {score}
                    <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>
                      / {maxPoints}
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Progress</p>
                <p className="text-lg font-semibold" style={{ color: 'var(--color-amber-400)' }}>
                  {scoreProgress}%
                </p>
              </div>
            </div>
            
            {/* Score Progress Bar */}
            <div 
              className="h-3 rounded-full overflow-hidden mb-4"
              style={{ background: 'var(--color-bg-hover)' }}
            >
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${scoreProgress}%`,
                  background: 'linear-gradient(90deg, var(--color-amber-500) 0%, var(--color-amber-400) 100%)'
                }}
              />
            </div>

            {/* Lessons Progress */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Lessons Completed</h2>
              <span className="text-sm font-medium" style={{ color: 'var(--color-amber-400)' }}>
                {completedCount} / 30 lessons
              </span>
            </div>
            <div 
              className="h-1.5 rounded-full overflow-hidden mt-1"
              style={{ background: 'var(--color-bg-hover)' }}
            >
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${progress}%`,
                  background: 'var(--color-text-muted)'
                }}
              />
            </div>
          </div>
        )}

        {/* Modules list */}
        <div className="space-y-3">
          <h2 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${mounted ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`} style={{ color: 'var(--color-text-muted)' }}>
            Course Modules
          </h2>
          
          {modulesData.map((module, index) => {
            const isExpanded = expandedModules.has(module.id)
            const moduleScore = getModuleScore(module.id)
            const moduleMax = getModuleMaxPoints(module.id)
            const moduleHasSubLessons = module.lessons.some(l => l.subLessons && l.subLessons.length > 0)
            const moduleProgress = moduleMax > 0 ? Math.round((moduleScore / moduleMax) * 100) : 0
            
            return (
              <div 
                key={module.id}
                className={`rounded-xl border overflow-hidden ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ 
                  background: 'var(--color-bg-card)',
                  borderColor: 'var(--color-bg-hover)',
                  animationDelay: `${index * 0.05 + 0.3}s`
                }}
              >
                {/* Module Header - Clickable */}
                <Link
                  to={moduleHasSubLessons ? '#' : `/module/${module.id}`}
                  onClick={(e) => {
                    if (moduleHasSubLessons) {
                      e.preventDefault()
                      toggleModule(module.id)
                    }
                  }}
                  className="group flex items-center gap-4 p-4 transition-all duration-200 hover:bg-[var(--color-bg-hover)]"
                >
                  <div 
                    className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                    style={{ 
                      background: 'var(--color-amber-glow)',
                      color: 'var(--color-amber-400)'
                    }}
                  >
                    {moduleHasSubLessons ? (
                      isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-[var(--color-amber-300)] transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {module.description}
                    </p>
                  </div>

                  {moduleMax > 0 && (
                    <div className="text-right shrink-0">
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {moduleScore}/{moduleMax} pts
                      </p>
                      <div className="w-16 h-1 rounded-full overflow-hidden mt-1" style={{ background: 'var(--color-bg-hover)' }}>
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${moduleProgress}%`,
                            background: 'var(--color-amber-500)'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </Link>

                {/* Lessons List - Expanded */}
                {moduleHasSubLessons && isExpanded && (
                  <div className="border-t" style={{ borderColor: 'var(--color-bg-hover)' }}>
                    {module.lessons.map((lesson) => {
                      const isLessonComplete = isLessonCompleted(lesson.id)
                      const hasSubLessons = lesson.subLessons && lesson.subLessons.length > 0
                      
                      return (
                        <Link
                          key={lesson.id}
                          to={`/module/${module.id}/${lesson.slug}`}
                          className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 transition-colors hover:bg-[var(--color-bg-hover)]"
                          style={{ borderColor: 'var(--color-bg-hover)' }}
                        >
                          {isLessonComplete ? (
                            <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                          ) : (
                            <Circle size={14} className="text-gray-600 shrink-0" />
                          )}
                          <span className={`text-sm ${isLessonComplete ? 'text-emerald-400' : 'text-gray-300'}`}>
                            {lesson.title}
                          </span>
                          {hasSubLessons && (
                            <span className="text-xs ml-auto" style={{ color: 'var(--color-text-muted)' }}>
                              {lesson.subLessons?.length} sub-lessons
                            </span>
                          )}
                          <ChevronRight size={14} className="shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className={`mt-12 text-center ${mounted ? 'animate-fade-in-up stagger-5' : 'opacity-0'}`}>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <span className="font-mono">go run learning.go</span> • Install as PWA for offline access
          </p>
        </div>
      </div>

      {/* Challenge Sidebar */}
      <ChallengeSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onSelectChallenge={(challenge) => {
          setSelectedChallenge(challenge)
          setSidebarOpen(false)
        }}
      />

      {/* Challenge Playground Modal */}
      {selectedChallenge && (
        <CodePlayground
          initialCode={selectedChallenge.starterCode}
          expectedOutput={selectedChallenge.expectedOutput}
          validationPattern={selectedChallenge.validationPattern}
          challengeId={selectedChallenge.id}
          points={selectedChallenge.points}
          hints={selectedChallenge.hints}
          lessonSlug={selectedChallenge.lessonSlug}
          onClose={() => setSelectedChallenge(null)}
          onSuccess={() => completeChallenge(selectedChallenge.id, selectedChallenge.points)}
        />
      )}
    </div>
  )
}
