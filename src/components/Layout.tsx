import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useProgress } from '../lib/progress'
import { Mail, LogOut, Menu, Terminal, ChevronRight, ChevronDown, Lock, CheckCircle, Circle, Trophy } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { modulesData } from './LessonView'

interface LayoutProps {
  children: React.ReactNode
}

const moduleSummary = modulesData.map(m => ({ id: m.id, title: m.title, slug: `/module/${m.id}` }))

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarClosing, setSidebarClosing] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['basics']))
  const location = useLocation()
  const { isLessonCompleted, isSubLessonCompleted, score, maxPoints } = useProgress()

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const handleCloseSidebar = () => {
    setSidebarClosing(true)
    setTimeout(() => {
      setSidebarOpen(false)
      setSidebarClosing(false)
    }, 200)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg-deep)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 flex flex-col
        border-r transition-all duration-200 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarClosing ? 'opacity-0 lg:opacity-100' : ''}
      `}
      style={{ 
        background: 'linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-bg-primary) 100%)',
        borderColor: 'var(--color-bg-hover)'
      }}>
        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: 'var(--color-bg-hover)' }}>
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 group"
            onClick={() => window.innerWidth < 1024 && handleCloseSidebar()}
          >
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-amber-400) 100%)',
                boxShadow: '0 4px 14px rgba(251, 191, 36, 0.3)'
              }}
            >
              <Terminal size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Let's go Go</h1>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Master Go from TS</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <Link 
              to="/dashboard"
              onClick={() => window.innerWidth < 1024 && handleCloseSidebar()}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${location.pathname === '/dashboard' 
                  ? 'sidebar-item-active' 
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-white'
                }
              `}
            >
              <span className="opacity-70">~/</span>
              Dashboard
            </Link>
            
            <div className="pt-4 pb-2">
              <span 
                className="px-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Modules
              </span>
            </div>

            {moduleSummary.map((mod, index) => {
              const moduleData = modulesData.find(m => m.id === mod.id)
              const isExpanded = expandedModules.has(mod.id)
              const hasSubLessons = moduleData?.lessons.some(l => l.subLessons && l.subLessons.length > 0)
              
              return (
                <div key={mod.id}>
                  <Link
                    to={mod.slug}
                    onClick={() => {
                      if (hasSubLessons) {
                        toggleModule(mod.id)
                      }
                      window.innerWidth < 1024 && handleCloseSidebar()
                    }}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${location.pathname.startsWith(`/module/${mod.id}`) || location.pathname === mod.slug
                        ? 'sidebar-item-active' 
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-white'
                      }
                    `}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    {hasSubLessons ? (
                      isExpanded ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />
                    ) : (
                      <ChevronRight size={14} className="opacity-50" />
                    )}
                    {mod.title}
                  </Link>
                  
                  {hasSubLessons && isExpanded && moduleData && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-[var(--color-bg-hover)] ml-6">
                      {moduleData.lessons.map((lesson) => {
                        const isLessonComplete = isLessonCompleted(lesson.id)
                        const hasSubLessons = lesson.subLessons && lesson.subLessons.length > 0
                        
                        return (
                          <div key={lesson.id}>
                            <Link
                              to={`/module/${mod.id}/${lesson.slug}`}
                              onClick={() => window.innerWidth < 1024 && handleCloseSidebar()}
                              className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                                ${location.pathname === `/module/${mod.id}/${lesson.slug}`
                                  ? 'text-amber-300 bg-amber-900/20' 
                                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-white'
                                }
                              `}
                            >
                              {isLessonComplete ? (
                                <CheckCircle size={12} className="text-emerald-500" />
                              ) : (
                                <Circle size={12} className="text-gray-600" />
                              )}
                              <span className={isLessonComplete ? 'text-emerald-400' : ''}>
                                {lesson.title}
                              </span>
                            </Link>
                            
                            {hasSubLessons && (
                              <div className="ml-4 mt-1 space-y-1">
                                {lesson.subLessons?.map((subLesson) => {
                                  const isSubComplete = isSubLessonCompleted(subLesson.id)
                                  const isLocked = !isLessonComplete
                                  
                                  return (
                                    <Link
                                      key={subLesson.id}
                                      to={`/module/${mod.id}/${lesson.slug}/${subLesson.slug}`}
                                      onClick={() => window.innerWidth < 1024 && handleCloseSidebar()}
                                      className={`
                                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all
                                        ${isLocked 
                                          ? 'text-gray-600 cursor-not-allowed' 
                                          : location.pathname === `/module/${mod.id}/${lesson.slug}/${subLesson.slug}`
                                            ? 'text-amber-300' 
                                            : 'text-[var(--color-text-muted)] hover:text-white'
                                        }
                                      `}
                                    >
                                      {isLocked ? (
                                        <Lock size={10} />
                                      ) : isSubComplete ? (
                                        <CheckCircle size={10} className="text-emerald-500" />
                                      ) : (
                                        <Circle size={10} className="text-gray-600" />
                                      )}
                                      {subLesson.title}
                                    </Link>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--color-bg-hover)' }}>
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-amber-400) 100%)',
                    color: 'var(--color-bg-deep)'
                  }}
                >
                  {user.email[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-white truncate">
                  {user.email.split('@')[0]}
                </span>
              </div>
              <button
                onClick={signOut}
                className="p-2 rounded-lg transition-colors text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-bg-hover)]"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
              style={{ 
                background: 'linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-amber-400) 100%)',
                color: 'var(--color-bg-deep)'
              }}
            >
              <Mail size={16} />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Progress Section */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--color-bg-hover)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-amber-400" />
              <span className="text-xs font-medium text-white">Score</span>
            </div>
            <span className="text-xs font-semibold text-amber-400">{score} / {maxPoints}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-hover)' }}>
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${maxPoints > 0 ? (score / maxPoints) * 100 : 0}%`,
                background: 'linear-gradient(90deg, var(--color-amber-500) 0%, var(--color-amber-400) 100%)'
              }}
            />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header 
          className="lg:hidden flex items-center justify-between p-4 border-b"
          style={{ 
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-bg-hover)'
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg transition-colors text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-hover)]"
          >
            <Menu size={22} />
          </button>
          <span className="font-semibold text-white">Let's go Go</span>
          <div className="flex items-center gap-2">
            <div 
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
              style={{ background: 'rgba(251, 191, 36, 0.15)' }}
            >
              <Trophy size={14} className="text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">{score}</span>
              <span className="text-xs text-amber-600">/ {maxPoints}</span>
            </div>
          </div>
        </header>

        <main 
          className="flex-1 overflow-y-auto"
          style={{ 
            background: 'radial-gradient(ellipse at top right, var(--color-bg-elevated) 0%, var(--color-bg-deep) 50%)'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
