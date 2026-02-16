import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Mail, Lock, LogIn, UserPlus, Terminal, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
        style={{ 
          background: 'radial-gradient(circle, var(--color-amber-500) 0%, transparent 70%)',
          top: '-20%',
          left: '-10%'
        }}
      />
      <div 
        className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[80px]"
        style={{ 
          background: 'radial-gradient(circle, var(--color-amber-400) 0%, transparent 70%)',
          bottom: '-15%',
          right: '-5%'
        }}
      />
    </div>
  )
}

export function Login() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--color-bg-deep)' }}>
      <AnimatedBackground />
      
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-sm transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>

      <div className="relative w-full max-w-md px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ 
              background: 'linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-amber-400) 100%)',
              color: 'var(--color-bg-deep)',
              boxShadow: '0 8px 30px rgba(251, 191, 36, 0.3)'
            }}
          >
            <Terminal size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Let's go Go</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            {isSignUp ? 'Create your account to start learning' : 'Welcome back to continue learning'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div 
              className="p-3 rounded-lg text-sm border"
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#ef4444'
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
            <div className="relative">
              <Mail 
                className="absolute left-3 top-1/2 -translate-y-1/2" 
                size={18} 
                style={{ color: 'var(--color-text-muted)' }} 
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border text-white"
                style={{ 
                  background: 'var(--color-bg-card)',
                  borderColor: 'var(--color-bg-hover)'
                }}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>Password</label>
            <div className="relative">
              <Lock 
                className="absolute left-3 top-1/2 -translate-y-1/2" 
                size={18} 
                style={{ color: 'var(--color-text-muted)' }} 
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border text-white"
                style={{ 
                  background: 'var(--color-bg-card)',
                  borderColor: 'var(--color-bg-hover)'
                }}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ 
              background: 'linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-amber-400) 100%)',
              color: 'var(--color-bg-deep)'
            }}
          >
            {loading ? (
              <span>Loading...</span>
            ) : isSignUp ? (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            className="text-sm transition-colors hover:underline"
            style={{ color: 'var(--color-amber-400)' }}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Note */}
        <div 
          className="mt-8 p-4 rounded-xl border"
          style={{ 
            background: 'var(--color-bg-card)',
            borderColor: 'var(--color-bg-hover)'
          }}
        >
          <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
            <strong>Local Demo:</strong> Your account is stored in browser localStorage. 
            For production, connect to a Turso database.
          </p>
        </div>
      </div>
    </div>
  )
}
