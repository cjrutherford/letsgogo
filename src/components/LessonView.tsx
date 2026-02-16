import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Play, Trophy, Lock } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { CodePlayground } from './CodePlayground'
import { lessonContent } from '../lib/content'
import { getChallengesForLesson, type CodeChallenge } from '../lib/challenges'
import { useProgress } from '../lib/progress'

interface SubLesson {
  id: string
  title: string
  slug: string
  requiredChallenges?: string[]
}

interface Lesson {
  id: string
  module_id: string
  title: string
  slug: string
  content: string
  order: number
  subLessons?: SubLesson[]
  requiredChallenges?: string[]
}

interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
}

const modulesData: Module[] = [
  {
    id: 'basics',
    title: 'Go Basics',
    description: 'Get started with fundamental Go concepts',
    lessons: [
      { id: 'basics-01', module_id: 'basics', title: 'Hello World', slug: 'basics-hello-world', order: 1, content: '' },
      { 
        id: 'basics-02', 
        module_id: 'basics', 
        title: 'Variables & Types', 
        slug: 'basics-variables-types', 
        order: 2, 
        content: '',
        subLessons: [
          { id: 'basics-02a', title: 'Basic Types', slug: 'basic-types' },
          { id: 'basics-02b', title: 'Type Conversion', slug: 'type-conversion' },
          { id: 'basics-02c', title: 'Custom Types', slug: 'custom-types' },
        ]
      },
      { 
        id: 'basics-03', 
        module_id: 'basics', 
        title: 'Functions', 
        slug: 'basics-functions', 
        order: 3, 
        content: '',
        subLessons: [
          { id: 'basics-03a', title: 'Function Declarations', slug: 'function-declarations' },
          { id: 'basics-03b', title: 'Multiple Return Values', slug: 'multiple-returns' },
          { id: 'basics-03c', title: 'Variadic Functions', slug: 'variadic-functions' },
        ]
      },
      { 
        id: 'basics-04', 
        module_id: 'basics', 
        title: 'Control Flow', 
        slug: 'basics-control-flow', 
        order: 4, 
        content: '',
        subLessons: [
          { id: 'basics-04a', title: 'If/Else', slug: 'if-else' },
          { id: 'basics-04b', title: 'Switch Statements', slug: 'switch-statements' },
          { id: 'basics-04c', title: 'Loops', slug: 'loops' },
        ]
      },
      { 
        id: 'basics-05', 
        module_id: 'basics', 
        title: 'Packages & Imports', 
        slug: 'basics-packages-imports', 
        order: 5, 
        content: '',
        subLessons: [
          { id: 'basics-05a', title: 'Package Declaration', slug: 'package-declaration' },
          { id: 'basics-05b', title: 'Import Statements', slug: 'import-statements' },
          { id: 'basics-05c', title: 'Init Functions', slug: 'init-functions' },
        ]
      },
    ]
  },
  {
    id: 'typescript-to-go',
    title: 'From TypeScript to Go',
    description: 'Understanding Go coming from TypeScript',
    lessons: [
      { id: 'ts-go-01', module_id: 'typescript-to-go', title: 'Type System Comparison', slug: 'type-system-comparison', order: 1, content: '' },
      { id: 'ts-go-02', module_id: 'typescript-to-go', title: 'Zero Values', slug: 'zero-values', order: 2, content: '' },
      { 
        id: 'ts-go-03', 
        module_id: 'typescript-to-go', 
        title: 'Error Handling', 
        slug: 'error-handling', 
        order: 3, 
        content: '',
        subLessons: [
          { id: 'ts-go-03a', title: 'Error Values', slug: 'error-values' },
          { id: 'ts-go-03b', title: 'Error Wrapping', slug: 'error-wrapping' },
          { id: 'ts-go-03c', title: 'Custom Errors', slug: 'custom-errors' },
        ]
      },
    ]
  },
  {
    id: 'quirks',
    title: "Go's Unique Quirks",
    description: 'Learn the unique aspects of Go',
    lessons: [
      { id: 'quirks-01', module_id: 'quirks', title: 'Values vs Pointers', slug: 'values-vs-pointers', order: 1, content: '' },
      { id: 'quirks-02', module_id: 'quirks', title: 'Slices, Arrays, and Maps', slug: 'slices-arrays-maps', order: 2, content: '' },
      { 
        id: 'quirks-03', 
        module_id: 'quirks', 
        title: 'Defer, Panic, Recover', 
        slug: 'defer-panic-recover', 
        order: 3, 
        content: '',
        subLessons: [
          { id: 'quirks-03a', title: 'Defer Statements', slug: 'defer-statements' },
          { id: 'quirks-03b', title: 'Panic & Recover', slug: 'panic-recover' },
          { id: 'quirks-03c', title: 'Common Patterns', slug: 'defer-patterns' },
        ]
      },
    ]
  },
  {
    id: 'gc',
    title: 'Garbage Collection',
    description: 'Understanding Go GC and memory',
    lessons: [
      { id: 'gc-01', module_id: 'gc', title: 'How GC Works', slug: 'how-gc-works', order: 1, content: '' },
      { id: 'gc-02', module_id: 'gc', title: 'Escape Analysis', slug: 'escape-analysis', order: 2, content: '' },
      { 
        id: 'gc-03', 
        module_id: 'gc', 
        title: 'Writing GC-Friendly Code', 
        slug: 'gc-friendly-code', 
        order: 3, 
        content: '',
        subLessons: [
          { id: 'gc-03a', title: 'Memory Optimization', slug: 'memory-optimization' },
          { id: 'gc-03b', title: 'Object Pooling', slug: 'object-pooling' },
          { id: 'gc-03c', title: 'Profiling Memory', slug: 'memory-profiling' },
        ]
      },
    ]
  },
  {
    id: 'concurrency',
    title: 'Concurrency (Async)',
    description: 'Goroutines and channels',
    lessons: [
      { id: 'conc-01', module_id: 'concurrency', title: 'Goroutines 101', slug: 'goroutines-101', order: 1, content: '' },
      { id: 'conc-02', module_id: 'concurrency', title: 'Channels', slug: 'channels', order: 2, content: '' },
      { 
        id: 'conc-03', 
        module_id: 'concurrency', 
        title: 'Select Statement', 
        slug: 'select-statement', 
        order: 3, 
        content: '',
        subLessons: [
          { id: 'conc-03a', title: 'Basic Select', slug: 'basic-select' },
          { id: 'conc-03b', title: 'Timeouts', slug: 'select-timeouts' },
          { id: 'conc-03c', title: 'Channel Patterns', slug: 'channel-patterns' },
        ]
      },
    ]
  },
  {
    id: 'parallelism',
    title: 'Parallelism',
    description: 'Synchronization and patterns',
    lessons: [
      { 
        id: 'par-01', 
        module_id: 'parallelism', 
        title: 'WaitGroup and Mutex', 
        slug: 'waitgroup-mutex', 
        order: 1, 
        content: '',
        subLessons: [
          { id: 'par-01a', title: 'WaitGroup Basics', slug: 'waitgroup-basics' },
          { id: 'par-01b', title: 'Mutex Patterns', slug: 'mutex-patterns' },
          { id: 'par-01c', title: 'RWMutex', slug: 'rw-mutex' },
        ]
      },
      { id: 'par-02', module_id: 'parallelism', title: 'sync/atomic', slug: 'sync-atomic', order: 2, content: '' },
      { id: 'par-03', module_id: 'parallelism', title: 'Race Conditions', slug: 'race-conditions', order: 3, content: '' },
    ]
  },
  {
    id: 'testing',
    title: 'Testing in Go',
    description: 'Writing tests the Go way',
    lessons: [
      { id: 'test-01', module_id: 'testing', title: 'Testing Package', slug: 'testing-package', order: 1, content: '' },
      { id: 'test-02', module_id: 'testing', title: 'Table-Driven Tests', slug: 'table-tests', order: 2, content: '' },
      { 
        id: 'test-03', 
        module_id: 'testing', 
        title: 'Benchmarks', 
        slug: 'benchmarks', 
        order: 3, 
        content: '',
        subLessons: [
          { id: 'test-03a', title: 'Benchmark Basics', slug: 'benchmark-basics' },
          { id: 'test-03b', title: 'Benchmark Examples', slug: 'benchmark-examples' },
          { id: 'test-03c', title: 'Profiling Benchmarks', slug: 'profiling-benchmarks' },
        ]
      },
    ]
  },
  {
    id: 'webservices',
    title: 'Web Services',
    description: 'Building APIs with Go',
    lessons: [
      { id: 'web-01', module_id: 'webservices', title: 'net/http Basics', slug: 'net-http-basics', order: 1, content: '' },
      { id: 'web-02', module_id: 'webservices', title: 'REST APIs', slug: 'rest-apis', order: 2, content: '' },
      { 
        id: 'web-03', 
        module_id: 'webservices', 
        title: 'Middleware', 
        slug: 'middleware', 
        order: 3, 
        content: '',
        subLessons: [
          { id: 'web-03a', title: 'Middleware Pattern', slug: 'middleware-pattern' },
          { id: 'web-03b', title: 'Common Middleware', slug: 'common-middleware' },
          { id: 'web-03c', title: 'Third-party', slug: 'middleware-third-party' },
        ]
      },
    ]
  },
  {
    id: 'stdlib',
    title: 'Standard Library',
    description: 'Survey of Go standard library',
    lessons: [
      { id: 'stdlib-01', module_id: 'stdlib', title: 'fmt, strings, strconv', slug: 'fmt-strings-strconv', order: 1, content: '' },
      { 
        id: 'stdlib-02', 
        module_id: 'stdlib', 
        title: 'encoding packages', 
        slug: 'encoding-packages', 
        order: 2, 
        content: '',
        subLessons: [
          { id: 'stdlib-02a', title: 'JSON Encoding', slug: 'json-encoding' },
          { id: 'stdlib-02b', title: 'XML & TOML', slug: 'xml-toml' },
          { id: 'stdlib-02c', title: 'Gob Encoding', slug: 'gob-encoding' },
        ]
      },
      { 
        id: 'stdlib-03', 
        module_id: 'stdlib', 
        title: 'net/http and context', 
        slug: 'net-http-context', 
        order: 3, 
        content: '',
        subLessons: [
          { id: 'stdlib-03a', title: 'HTTP Client', slug: 'http-client' },
          { id: 'stdlib-03b', title: 'Context Basics', slug: 'context-basics' },
          { id: 'stdlib-03c', title: 'WithCancel & WithTimeout', slug: 'context-advanced' },
        ]
      },
    ]
  },
  {
    id: 'packages',
    title: 'Popular Packages',
    description: 'Essential third-party libraries',
    lessons: [
      { 
        id: 'pkg-01', 
        module_id: 'packages', 
        title: 'Web Frameworks', 
        slug: 'web-frameworks', 
        order: 1, 
        content: '',
        subLessons: [
          { id: 'pkg-01a', title: 'Gin Framework', slug: 'gin-framework' },
          { id: 'pkg-01b', title: 'Echo Framework', slug: 'echo-framework' },
          { id: 'pkg-01c', title: 'Fiber Framework', slug: 'fiber-framework' },
        ]
      },
      { id: 'pkg-02', module_id: 'packages', title: 'ORMs and DB', slug: 'orms-db', order: 2, content: '' },
      { id: 'pkg-03', module_id: 'packages', title: 'Utilities', slug: 'utilities', order: 3, content: '' },
    ]
  },
  {
    id: 'polish',
    title: 'Production Polish',
    description: 'Final touches for production',
    lessons: [
      { 
        id: 'polish-01', 
        module_id: 'polish', 
        title: 'Profiling', 
        slug: 'profiling', 
        order: 1, 
        content: '',
        subLessons: [
          { id: 'polish-01a', title: 'CPU Profiling', slug: 'cpu-profiling' },
          { id: 'polish-01b', title: 'Memory Profiling', slug: 'memory-profiling-p' },
          { id: 'polish-01c', title: 'pprof Tool', slug: 'pprof-tool' },
        ]
      },
      { id: 'polish-02', module_id: 'polish', title: 'Security', slug: 'security', order: 2, content: '' },
      { 
        id: 'polish-03', 
        module_id: 'polish', 
        title: 'Deployment', 
        slug: 'deployment', 
        order: 3, 
        content: '',
        subLessons: [
          { id: 'polish-03a', title: 'Docker Basics', slug: 'docker-basics' },
          { id: 'polish-03b', title: 'Multi-stage Builds', slug: 'multistage-builds' },
          { id: 'polish-03c', title: 'CI/CD Integration', slug: 'cicd-integration' },
        ]
      },
    ]
  },
]

const DEFAULT_CODE = `package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}`

const SAMPLE_CODE: Record<string, string> = {
  'type-system-comparison': `package main

import "fmt"

type User struct {
    ID    int
    Name  string
    Email string
}

func main() {
    user := User{ID: 1, Name: "Alice", Email: "alice@example.com"}
    fmt.Printf("User: %+v\\n", user)
}`,
  'zero-values': `package main

import "fmt"

func main() {
    var i int
    var f float64
    var b bool
    var s string
    var p *int
    
    fmt.Printf("int: %d, float: %.1f, bool: %v, string: %q\\n", i, f, b, s)
    fmt.Printf("pointer: %v\\n", p)
}`,
  'error-handling': `package main

import (
    "errors"
    "fmt"
)

var ErrDivideByZero = errors.New("division by zero")

func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, ErrDivideByZero
    }
    return a / b, nil
}

func main() {
    result, err := divide(10, 0)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    fmt.Println("Result:", result)
}`,
}

export function LessonView() {
  const { moduleId, lessonSlug, subLessonSlug } = useParams()
  const navigate = useNavigate()
  const [showPlayground, setShowPlayground] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<CodeChallenge | null>(null)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [editorCode, setEditorCode] = useState<Record<string, string>>({})

  const module = modulesData.find(m => m.id === moduleId)
  const lesson = module?.lessons.find(l => l.slug === lessonSlug)
  const subLesson = lesson?.subLessons?.find(sl => sl.slug === subLessonSlug)
  
  const effectiveSlug = subLessonSlug && lessonContent[subLessonSlug] ? subLessonSlug : (lessonSlug || '')
  const lessonChallenges = effectiveSlug ? getChallengesForLesson(effectiveSlug) : []

  const displayTitle = subLesson?.title || lesson?.title || 'Lesson'
  const displaySlug = subLessonSlug && lessonContent[subLessonSlug] ? subLessonSlug : (lessonSlug || '')

  const { 
    isChallengeCompleted, 
    completeChallenge,
    isLessonCompleted,
    isSubLessonCompleted,
    completeLesson,
    uncompleteLesson,
    completeSubLesson,
    uncompleteSubLesson,
    updateLessonProgress,
    getLessonProgress
  } = useProgress()

  const isLessonComplete = lesson ? isLessonCompleted(lesson.id) : false
  const isSubLessonComplete = subLesson ? isSubLessonCompleted(subLesson.id) : false
  const lessonProgress = lesson ? getLessonProgress(lesson.id) : { scrollProgress: 0, challengesCompleted: [] }
  const currentProgress = lessonProgress || { scrollProgress: 0, challengesCompleted: [] }

  // Current item is either the sub-lesson or the lesson
  const currentItemComplete = subLesson ? isSubLessonComplete : isLessonComplete

  const handleCodeChange = useCallback((id: string, code: string) => {
    setEditorCode(prev => ({ ...prev, [id]: code }))
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollElement = document.documentElement
      const scrollTop = scrollElement.scrollTop
      const scrollHeight = scrollElement.scrollHeight
      const clientHeight = scrollElement.clientHeight
      
      if (scrollHeight <= clientHeight) return
      
      const scrollPercent = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)
      
      if (lesson) {
        updateLessonProgress(lesson.id, { scrollProgress: Math.max(scrollPercent, currentProgress.scrollProgress) })
      }
      
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setHasScrolledToBottom(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lesson, currentProgress.scrollProgress])

  useEffect(() => {
    if (!lesson || !lessonSlug) return
    
    const allChallengesCompleted = lessonChallenges.length === 0 || lessonChallenges.every(c => isChallengeCompleted(c.id))
    const isAlreadyCompleted = subLesson ? isSubLessonCompleted(subLesson.id) : isLessonCompleted(lesson.id)
    
    // For sub-lessons, complete the sub-lesson. For lessons, complete the lesson.
    if (hasScrolledToBottom && allChallengesCompleted && !isAlreadyCompleted) {
      if (subLesson && lesson) {
        completeSubLesson(subLesson.id, lesson.id)
      } else {
        completeLesson(lesson.id)
      }
    }
  }, [hasScrolledToBottom, lessonChallenges, isChallengeCompleted, lesson, subLesson])

  // Scroll to top when navigating between lessons
  useEffect(() => {
    window.scrollTo(0, 0)
    setHasScrolledToBottom(false)
  }, [lessonSlug, subLessonSlug])

  const markComplete = () => {
    if (currentItemComplete) {
      if (subLesson) {
        uncompleteSubLesson(subLesson.id)
      } else if (lesson) {
        uncompleteLesson(lesson.id)
      }
    } else {
      if (subLesson && lesson) {
        completeSubLesson(subLesson.id, lesson.id)
      } else if (lesson) {
        completeLesson(lesson.id)
      }
    }
  }

  const currentIndex = module?.lessons.findIndex(l => l.slug === lessonSlug) ?? -1
  const prevLesson = currentIndex > 0 ? module?.lessons[currentIndex - 1] : null
  const nextLesson = module && currentIndex < module.lessons.length - 1 ? module.lessons[currentIndex + 1] : null

  if (!module || !lesson) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Lesson not found</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Select a lesson from the sidebar</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-7xl mx-auto p-3 lg:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
            <span className="truncate max-w-[120px] sm:max-w-none">{module.title}</span>
            <span>/</span>
            <span style={{ color: 'var(--color-amber-400)' }} className="truncate">{displayTitle}</span>
          </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{displayTitle}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Progress indicator */}
              {lessonChallenges.length > 0 && !currentItemComplete && (
                <div className="text-xs flex items-center gap-1 sm:gap-2" style={{ color: 'var(--color-text-muted)' }}>
                  <span>{lessonChallenges.filter(c => isChallengeCompleted(c.id)).length}/{lessonChallenges.length}</span>
                  {!hasScrolledToBottom ? (
                    <span className="text-amber-400 hidden sm:inline">• scroll</span>
                  ) : lessonChallenges.some(c => !isChallengeCompleted(c.id)) ? (
                    <span className="text-amber-400 hidden sm:inline">• do challenges</span>
                  ) : null}
                </div>
              )}
              <button
                onClick={markComplete}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm hover:scale-105"
                style={currentItemComplete 
                  ? { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }
                  : { background: 'var(--color-bg-card)', color: 'var(--color-text-muted)' }
                }
                title={currentItemComplete ? 'Click to mark incomplete' : 'Click to mark complete'}
              >
                {currentItemComplete ? (
                  <>
                    <CheckCircle size={18} />
                    <span className="hidden xs:inline sm:hidden md:inline">Done</span>
                  </>
                ) : (
                  <>
                    <Circle size={18} />
                    <span className="hidden xs:inline sm:hidden md:inline">Complete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div 
          className="mb-6 p-3 sm:p-4 rounded-xl border"
          style={{ 
            background: 'var(--color-bg-card)', 
            borderColor: 'var(--color-amber-500)'
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-semibold text-white">Try it yourself</h3>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>Run Go code in your browser</p>
            </div>
            <button 
              onClick={() => setShowPlayground(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-amber-400) 100%)',
                color: 'var(--color-bg-deep)'
              }}
            >
              <Play size={18} />
              <span className="hidden sm:inline">Open Playground</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2">
            <div 
              className="rounded-xl border"
              style={{ 
                background: 'var(--color-bg-card)', 
                borderColor: 'var(--color-bg-hover)'
              }}
            >
              {displaySlug && lessonContent[displaySlug] ? (
                <div className="p-4 sm:p-6 markdown-content overflow-x-hidden">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children}) => <h1 className="text-xl sm:text-2xl font-bold text-amber-100 mb-4">{children}</h1>,
                      h2: ({children}) => <h2 className="text-lg sm:text-xl font-semibold text-amber-300 mt-6 mb-3">{children}</h2>,
                      h3: ({children}) => <h3 className="text-base sm:text-lg font-semibold text-white mt-4 mb-2">{children}</h3>,
                      p: ({children}) => <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base">{children}</p>,
                      ul: ({children}) => <ul className="list-disc list-inside mb-4 text-gray-300 space-y-1 text-sm sm:text-base">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-inside mb-4 text-gray-300 space-y-1 text-sm sm:text-base">{children}</ol>,
                      li: ({children}) => <li className="text-gray-300">{children}</li>,
                      code: ({className, children, ...props}) => {
                        const match = /language-(\w+)/.exec(className || '')
                        const isInline = !match && !className
                        
                        if (isInline) {
                          return <code className="bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded text-amber-300 text-xs sm:text-sm font-mono border border-[var(--color-bg-hover)]" {...props}>{children}</code>
                        }
                        
                        return (
                          <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match ? match[1] : 'go'}
                              PreTag="div"
                              customStyle={{
                                margin: '1rem 0',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--color-bg-hover)',
                                background: 'var(--color-bg-elevated)',
                                minWidth: 'fit-content',
                              }}
                              codeTagProps={{
                                style: {
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: '0.75rem',
                                }
                              }}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        )
                      },
                      pre: ({children}) => <>{children}</>,
                      a: ({children, href}) => <a href={href} className="text-amber-300 hover:text-amber-100 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-amber-500 pl-4 py-2 my-4 bg-amber-900/20 rounded-r-lg">{children}</blockquote>,
                      table: ({children}) => <table className="w-full border-collapse my-4">{children}</table>,
                      th: ({children}) => <th className="border border-gray-700 px-3 py-2 text-left text-amber-300 bg-gray-800">{children}</th>,
                      td: ({children}) => <td className="border border-gray-700 px-3 py-2 text-gray-300">{children}</td>,
                    }}
                  >
                    {lessonContent[displaySlug]}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="p-6">
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    This lesson is currently being written. Check back soon or contribute to the content!
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    In the meantime, explore the code playground to experiment with Go concepts.
                  </p>
                </div>
              )}
            </div>

            {/* Sub-Lessons Section */}
            {lesson.subLessons && lesson.subLessons.length > 0 && (
              <div className="mt-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Sub-Lessons</h3>
                <div className="space-y-2">
                  {lesson.subLessons.map((subLesson) => {
                    const isSubLessonComplete = isSubLessonCompleted(subLesson.id)
                    const isLocked = !isLessonComplete
                    
                    return (
                      <button
                        key={subLesson.id}
                        onClick={() => !isLocked && navigate(`/module/${moduleId}/${lessonSlug}/${subLesson.slug}`)}
                        disabled={isLocked}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                          isLocked 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-[var(--color-bg-hover)] cursor-pointer'
                        }`}
                        style={{ 
                          background: isSubLessonComplete ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-bg-card)',
                          borderColor: isSubLessonComplete ? 'rgba(16, 185, 129, 0.3)' : 'var(--color-bg-hover)'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {isLocked ? (
                            <Lock size={16} className="text-gray-500 shrink-0" />
                          ) : isSubLessonComplete ? (
                            <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                          ) : (
                            <Circle size={16} className="text-gray-500 shrink-0" />
                          )}
                          <span className={`text-sm sm:text-base ${isSubLessonComplete ? 'text-emerald-400' : 'text-gray-300'}`}>
                            {subLesson.title}
                          </span>
                        </div>
                        {isLocked && <Lock size={14} className="text-gray-500 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t flex justify-between gap-2" style={{ borderColor: 'var(--color-bg-hover)' }}>
              {prevLesson ? (
                <button
                  onClick={() => navigate(`/module/${moduleId}/${prevLesson.slug}`)}
                  className="flex items-center gap-1 sm:gap-2 transition-colors hover:text-white text-xs sm:text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <ChevronLeft size={20} />
                  <span className="hidden xs:inline truncate max-w-[100px] sm:max-w-none">{prevLesson.title}</span>
                </button>
              ) : (
                <div />
              )}
              {nextLesson && (
                <button
                  onClick={() => navigate(`/module/${moduleId}/${nextLesson.slug}`)}
                  className="flex items-center gap-1 sm:gap-2 transition-colors hover:text-white text-xs sm:text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <span>{nextLesson.title}</span>
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Challenges Sidebar */}
          <div className="lg:col-span-1">
            <div 
              className="sticky top-4 lg:top-8 rounded-xl border overflow-hidden"
              style={{ 
                background: 'var(--color-bg-card)', 
                borderColor: 'var(--color-bg-hover)'
              }}
            >
              <div 
                className="flex items-center gap-2 px-3 lg:px-4 py-3 border-b"
                style={{ 
                  background: 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-bg-hover)'
                }}
              >
                <Trophy size={18} style={{ color: 'var(--color-amber-400)' }} />
                <span className="font-semibold text-white text-sm lg:text-base">Challenges</span>
                <span 
                  className="ml-auto text-xs px-1.5 lg:px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--color-amber-500)', color: 'var(--color-bg-deep)' }}
                >
                  {lessonChallenges.length}
                </span>
              </div>

              <div className="p-2 lg:p-3 space-y-2 lg:space-y-3 max-h-[50vh] lg:max-h-[calc(100vh-200px)] overflow-y-auto">
                {lessonChallenges.length > 0 ? (
                  lessonChallenges.map((challenge) => {
                    const completed = isChallengeCompleted(challenge.id)
                    const isSelected = selectedChallenge?.id === challenge.id
                    
                    return (
                      <button
                        key={challenge.id}
                        onClick={() => setSelectedChallenge(challenge)}
                        className="w-full text-left p-2 lg:p-3 rounded-lg border transition-all hover:scale-[1.01]"
                        style={{
                          background: completed ? 'rgba(16, 185, 129, 0.05)' : isSelected ? 'var(--color-amber-glow)' : 'var(--color-bg-elevated)',
                          borderColor: completed ? 'rgba(16, 185, 129, 0.3)' : isSelected ? 'var(--color-amber-500)' : 'var(--color-bg-hover)'
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-white text-sm">{challenge.title}</h4>
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
                        <p className="text-xs line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                          {challenge.description}
                        </p>
                      </button>
                    )
                  })
                ) : (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                    No challenges for this lesson yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Playground Modal */}
      {showPlayground && !selectedChallenge && (
        <CodePlayground 
          initialCode={SAMPLE_CODE[lessonSlug || ''] || DEFAULT_CODE}
          lessonSlug={lessonSlug}
          code={editorCode['playground']}
          onCodeChange={(code) => handleCodeChange('playground', code)}
          onClose={() => setShowPlayground(false)} 
        />
      )}

      {/* Challenge Playground Modal */}
      {selectedChallenge && (
        <CodePlayground 
          initialCode={selectedChallenge.starterCode}
          expectedOutput={selectedChallenge.expectedOutput}
          validationPattern={selectedChallenge.validationPattern}
          challengeId={selectedChallenge.id}
          title={selectedChallenge.title}
          description={selectedChallenge.description}
          points={selectedChallenge.points}
          hints={selectedChallenge.hints}
          lessonSlug={selectedChallenge.lessonSlug}
          onClose={() => setSelectedChallenge(null)}
          onSuccess={() => completeChallenge(selectedChallenge.id, selectedChallenge.points)}
        />
      )}
    </>
  )
}

export function ModuleView() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const { isLessonCompleted, isSubLessonCompleted } = useProgress()
  
  const module = modulesData.find(m => m.id === moduleId)

  if (!module) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Module not found</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Select a module from the sidebar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{module.title}</h1>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>{module.description}</p>
      </div>

      <div className="space-y-3">
        {module.lessons.map((lesson, index) => {
          const hasSubLessons = lesson.subLessons && lesson.subLessons.length > 0
          const isLessonComplete = isLessonCompleted(lesson.id)

          return (
            <div key={lesson.id}>
              <button
                onClick={() => navigate(`/module/${moduleId}/${lesson.slug}`)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01]"
                style={{ 
                  background: 'var(--color-bg-card)',
                  borderColor: 'var(--color-bg-hover)'
                }}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{ 
                    background: 'var(--color-amber-glow)',
                    color: 'var(--color-amber-400)'
                  }}
                >
                  {index + 1}
                </div>
                <span className="flex-1 text-left text-white">{lesson.title}</span>
                {hasSubLessons && (
                  <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }}>
                    {lesson.subLessons?.length} sub-lessons
                  </span>
                )}
                <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
              </button>

              {/* Sub-lessons */}
              {hasSubLessons && (
                <div className="ml-12 mt-2 space-y-2">
                  {lesson.subLessons?.map((subLesson, subIndex) => {
                    const isSubComplete = isSubLessonCompleted(subLesson.id)
                    const isLocked = !isLessonComplete

                    return (
                      <button
                        key={subLesson.id}
                        onClick={() => !isLocked && navigate(`/module/${moduleId}/${lesson.slug}/${subLesson.slug}`)}
                        disabled={isLocked}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg border transition-all ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--color-bg-hover)]'}`}
                        style={{ 
                          background: isSubComplete ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-bg-card)',
                          borderColor: isSubComplete ? 'rgba(16, 185, 129, 0.3)' : 'var(--color-bg-hover)'
                        }}
                      >
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {index + 1}.{subIndex + 1}
                        </span>
                        {isLocked ? (
                          <Lock size={12} className="text-gray-500" />
                        ) : isSubComplete ? (
                          <CheckCircle size={12} className="text-emerald-500" />
                        ) : (
                          <Circle size={12} className="text-gray-500" />
                        )}
                        <span className={`flex-1 text-left text-sm ${isSubComplete ? 'text-emerald-400' : 'text-gray-300'}`}>
                          {subLesson.title}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { modulesData }
