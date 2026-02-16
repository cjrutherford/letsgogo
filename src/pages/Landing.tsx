import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Terminal, ArrowRight, Code2, Zap, Target, Sparkles, ChevronRight } from 'lucide-react'

export function Landing() {
  const [mounted, setMounted] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    {
      icon: Code2,
      title: "TypeScript to Go",
      description: "Bridge your existing knowledge. Understand how Go's type system differs from what you know."
    },
    {
      icon: Zap,
      title: "Interactive Challenges",
      description: "Learn by doing. Solve coding challenges that reinforce every concept you learn."
    },
    {
      icon: Target,
      title: "Mental Models First",
      description: "Build deep understanding. Go beyond syntax to grasp why Go works the way it does."
    }
  ]

  const modules = [
    { name: 'Go Basics', lessons: 5, desc: 'Variables, functions, control flow' },
    { name: 'Type System', lessons: 3, desc: 'Zero values, interfaces, generics' },
    { name: 'Concurrency', lessons: 5, desc: 'Goroutines, channels, select' },
    { name: 'Memory', lessons: 3, desc: 'GC, escape analysis, optimization' },
    { name: 'Testing', lessons: 4, desc: 'Table tests, benchmarks, mocks' },
    { name: 'Web Services', lessons: 3, desc: 'HTTP, REST, middleware' }
  ]

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: '#0a0908', fontFamily: "'Playfair Display', Georgia, serif" }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(251, 191, 36, 0.15) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(180, 83, 9, 0.1) 0%, transparent 40%)`
      }} />
      
      {/* Navigation */}
      <nav className={`relative z-10 flex items-center justify-between px-8 py-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)' }}>
            <Terminal size={20} className="text-black" />
          </div>
          <span className="text-xl font-semibold text-white tracking-tight">Let's Go</span>
        </div>
        
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Sign In
          </Link>
          <Link to="/dashboard" className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#0a0908' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-8 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Text */}
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                <Sparkles size={12} style={{ color: '#fbbf24' }} />
                <span style={{ color: '#fbbf24' }}>For TypeScript Developers</span>
              </div>

              <h1 className={`text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '-0.02em' }}>
                From TypeScript
                <br />
                <span className="italic" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  to Go
                </span>
              </h1>

              <p className={`text-lg leading-relaxed mb-10 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '480px', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>
                You already know how to code. Now learn how to think in Go. 
                Interactive lessons that bridge your TypeScript knowledge to idiomatic Go—with challenges that make concepts stick.
              </p>

              <div className={`flex flex-wrap gap-4 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <Link to="/dashboard" className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-semibold transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#0a0908', boxShadow: '0 8px 30px rgba(245, 158, 11, 0.3)' }}>
                  Start Learning
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link to="/dashboard" className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-semibold transition-all hover:bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
                  View Curriculum
                </Link>
              </div>
            </div>

            {/* Right - Visual */}
            <div className={`relative transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
              {/* Code preview card */}
              <div className="rounded-2xl overflow-hidden" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#eab308' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
                  <span className="ml-4 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>main.go</span>
                </div>
                
                {/* Code */}
                <div className="p-6" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem' }}>
                  <div style={{ color: '#6b7280' }}><span style={{ color: '#8b5cf6' }}>package</span> main</div>
                  <div style={{ color: '#6b7280' }}>&nbsp;</div>
                  <div><span style={{ color: '#8b5cf6' }}>import</span> {"\"fmt\""}</div>
                  <div style={{ color: '#6b7280' }}>&nbsp;</div>
                  <div><span style={{ color: '#f59e0b' }}>func</span> <span style={{ color: '#60a5fa' }}>main</span>() {"{"}</div>
                  <div className="pl-4"><span style={{ color: '#8b5cf6' }}>go</span> <span style={{ color: '#f472b6' }}>func</span>() {"{"}</div>
                  <div className="pl-8">fmt.<span style={{ color: '#fbbf24' }}>Println</span>(<span style={{ color: '#22c55e' }}>"Hello from Go!"</span>)</div>
                  <div className="pl-4">{"}"}</div>
                  <div>&nbsp;</div>
                  <div className="pl-4" style={{ color: '#6b7280' }}><span style={{ color: '#f59e0b' }}>select</span> {"{"}</div>
                  <div className="pl-8" style={{ color: '#6b7280' }}><span style={{ color: '#f59e0b' }}>case</span> {"<-"}time.After(1*time.Second):</div>
                  <div className="pl-12" style={{ color: '#6b7280' }}>fmt.<span style={{ color: '#fbbf24' }}>Println</span>(<span style={{ color: '#22c55e' }}>"Done"</span>)</div>
                  <div className="pl-4">{"}"}</div>
                  <div>{"}"}</div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-6 -right-6 px-4 py-2 rounded-lg backdrop-blur-md" style={{ background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <span className="text-sm font-medium" style={{ color: '#fbbf24' }}>700+ Points</span>
              </div>
              
              <div className="absolute -bottom-4 -left-6 px-4 py-2 rounded-lg backdrop-blur-md" style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <span className="text-sm font-medium" style={{ color: '#22c55e' }}>30+ Challenges</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-8 py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={feature.title} className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${600 + i * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                  <feature.icon size={24} style={{ color: '#f59e0b' }} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>{feature.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Preview */}
      <section className="relative z-10 px-8 py-24" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>What You'll Learn</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>Structured path from fundamentals to production-ready</p>
            </div>
            <Link to="/dashboard" className="hidden md:inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.6)' }}>
              View all modules
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((mod, i) => (
              <Link key={mod.name} to="/dashboard" className={`group p-6 rounded-xl transition-all duration-300 hover:scale-[1.02] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.05)', transitionDelay: `${800 + i * 50}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">{mod.name}</h3>
                  <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#f59e0b' }}>{mod.lessons} lessons</span>
                </div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{mod.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-8 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Ready to think in Go?</h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>Join developers who made the leap from TypeScript to Go</p>
          <Link to="/dashboard" className="inline-flex items-center gap-3 px-10 py-5 rounded-xl text-lg font-semibold transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#0a0908', boxShadow: '0 8px 40px rgba(245, 158, 11, 0.4)' }}>
            Start Your Journey
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Terminal size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Let's Go — Built for TypeScript Developers</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>Dashboard</Link>
            <a href="#" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
