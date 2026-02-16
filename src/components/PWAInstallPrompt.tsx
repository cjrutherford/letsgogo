import { useState, useEffect } from 'react'
import { Download, X, Terminal } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed
    const wasDismissed = localStorage.getItem('pwa-install-dismissed')
    if (wasDismissed) {
      setDismissed(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showBanner || dismissed) return null

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-6 lg:w-96 p-4 rounded-xl border shadow-2xl z-40 animate-fade-in-up"
      style={{ 
        background: 'var(--color-bg-card)',
        borderColor: 'var(--color-amber-500)'
      }}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-lg transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-amber-glow)' }}
        >
          <Terminal size={20} style={{ color: 'var(--color-amber-400)' }} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm mb-1">
            Install "Let's go Go"
          </h3>
          <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Add to your home screen for offline access and a native app experience.
          </p>
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
            style={{ 
              background: 'linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-amber-400) 100%)',
              color: 'var(--color-bg-deep)'
            }}
          >
            <Download size={14} />
            Install App
          </button>
        </div>
      </div>
    </div>
  )
}
