import { useState, useCallback, useRef, useEffect } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import { Play, RotateCcw, Copy, Check, Loader2, X, CheckCircle, Terminal, Trophy, Star, Lightbulb, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { compileGo } from '../lib/goCompiler'
import { extractExcerpt, lessonContent } from '../lib/content'
import { challenges } from '../lib/challenges'

interface CodePlaygroundProps {
  initialCode?: string
  expectedOutput?: string
  validationPattern?: string
  testCode?: string
  challengeId?: string
  title?: string
  description?: string
  points?: number
  hints?: string[]
  lessonSlug?: string
  onClose?: () => void
  onSuccess?: () => void
  code?: string
  onCodeChange?: (code: string) => void
  isEmbedded?: boolean
}

interface LintError {
  line: number
  column: number
  message: string
}

const DEFAULT_CODE = `package main

import "fmt"

func main() {
	fmt.Println("Hello, Go!")
}`

export function CodePlayground({ 
  initialCode = DEFAULT_CODE, 
  expectedOutput,
  validationPattern,
  testCode,
  challengeId,
  title,
  description,
  points = 0,
  hints = [],
  lessonSlug,
  onClose,
  onSuccess,
  code: controlledCode,
  onCodeChange,
  isEmbedded = false
}: CodePlaygroundProps) {
  const [internalCode, setInternalCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errors, setErrors] = useState<LintError[]>([])
  const [challengeSolved, setChallengeSolved] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [currentHint, setCurrentHint] = useState(0)
  const [showLessonFull, setShowLessonFull] = useState(false)
  const editorRef = useRef<any>(null)

  const code = controlledCode ?? internalCode
  const setCode = onCodeChange ?? setInternalCode

  useEffect(() => {
    if (!challengeId) return
    const storageKey = `challenge-code-${challengeId}`
    const saved = localStorage.getItem(storageKey)
    if (saved && !controlledCode) {
      setInternalCode(saved)
    }
  }, [challengeId, controlledCode])

  useEffect(() => {
    if (!challengeId || !code || code === initialCode) return
    localStorage.setItem(`challenge-code-${challengeId}`, code)
  }, [code, challengeId, initialCode])

  const clearSavedCode = useCallback(() => {
    if (challengeId) {
      localStorage.removeItem(`challenge-code-${challengeId}`)
    }
  }, [challengeId])

  const isChallengeMode = !!expectedOutput || !!validationPattern || !!testCode

  const parseErrors = useCallback((errorStrings: string[]): LintError[] => {
    const parsed: LintError[] = []
    
    for (const err of errorStrings) {
      const lineMatch = err.match(/:(\d+):(\d+):\s*(.+)/)
      if (lineMatch) {
        parsed.push({
          line: parseInt(lineMatch[1], 10),
          column: parseInt(lineMatch[2], 10),
          message: lineMatch[3]
        })
      } else {
        parsed.push({
          line: 1,
          column: 1,
          message: err
        })
      }
    }
    
    return parsed
  }, [])

  const validateOutput = useCallback((actualOutput: string): boolean => {
    // For test-based challenges (testCode provided, or validationPattern signals
    // a Go test run with 'PASS'), verify that `go test` reported a clean pass.
    const isGoTestValidation = !!testCode || validationPattern === 'PASS'
    if (isGoTestValidation) {
      const lines = actualOutput.split('\n').map(l => l.trim())
      return lines.includes('PASS') && !lines.includes('FAIL')
    }
    if (expectedOutput && actualOutput.trim() === expectedOutput.trim()) {
      return true
    }
    if (validationPattern) {
      const regex = new RegExp(validationPattern)
      return regex.test(actualOutput.trim())
    }
    return false
  }, [expectedOutput, validationPattern, testCode])

  const runCode = useCallback(async () => {
    setLoading(true)
    setErrors([])
    setOutput('')

    try {
      const result = await compileGo(code, testCode)

      if (result.errors.length > 0) {
        const parsed = parseErrors(result.errors)
        setErrors(parsed)
      } else if (result.output) {
        setOutput(result.output)
        
        if (isChallengeMode && validateOutput(result.output)) {
          setChallengeSolved(true)
          clearSavedCode()
          onSuccess?.()
        }
      }
    } catch (err) {
      setErrors([{ line: 1, column: 1, message: `Failed to execute code: ${err instanceof Error ? err.message : 'Unknown error'}` }])
    } finally {
      setLoading(false)
    }
  }, [code, parseErrors, isChallengeMode, validateOutput, onSuccess])

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  const resetCode = useCallback(() => {
    setCode(initialCode)
    setOutput('')
    setErrors([])
    setChallengeSolved(false)
    clearSavedCode()
  }, [initialCode, setCode, clearSavedCode])

  const nextHint = () => {
    if (currentHint < hints.length - 1) {
      setCurrentHint(currentHint + 1)
      setShowHint(true)
    }
  }

  const containerClass = isEmbedded 
    ? 'h-full flex flex-col rounded-xl border overflow-hidden'
    : 'fixed inset-0 z-50 overflow-y-auto'

  const containerStyle = isEmbedded 
    ? { 
        background: 'var(--color-bg-card)', 
        borderColor: 'var(--color-bg-hover)' 
      }
    : { 
        background: 'rgba(10, 9, 8, 0.95)',
        backdropFilter: 'blur(20px)'
      }

  return (
    <div className={containerClass} style={containerStyle}>
      <div className={isEmbedded ? 'flex-1 flex flex-col overflow-hidden' : 'max-w-7xl mx-auto p-3 lg:p-6'}>
        {/* Header */}
        <div className={`flex items-center justify-between ${isEmbedded ? 'px-4 py-2.5 border-b shrink-0' : 'mb-4'}`}
          style={isEmbedded ? { borderColor: 'var(--color-bg-hover)', background: 'var(--color-bg-card)' } : {}}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ 
                background: 'linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-amber-400) 100%)',
                color: 'var(--color-bg-deep)'
              }}
            >
              <Terminal size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isChallengeMode ? 'Challenge' : 'Go Playground'}
              </h2>
              {isChallengeMode && points > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-amber-400)' }}>
                    <Star size={10} />
                    {points} points
                  </span>
                  {challengeSolved && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle size={10} />
                      Solved!
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors shrink-0"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Challenge Info */}
        {isChallengeMode && (
          <div 
            className="mb-4 p-4 rounded-xl border mx-4 mt-4"
            style={{ 
              background: challengeSolved ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-bg-card)',
              borderColor: challengeSolved ? 'rgba(16, 185, 129, 0.3)' : 'var(--color-bg-hover)'
            }}
          >
            {challengeSolved ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <Trophy size={24} className="text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-green-400">Challenge Complete!</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    You earned {points} points!
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {title && (
                  <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                )}
                {description && (
                  <p className="text-sm text-gray-300 mb-3">{description}</p>
                )}
                {testCode ? (
                  <p className="text-sm text-amber-400">
                    Hidden tests will validate your implementation.
                  </p>
                ) : expectedOutput ? (
                  <>
                    <p className="text-sm text-amber-400 mb-2">Expected output:</p>
                    <code 
                      className="block p-2 rounded text-sm font-mono"
                      style={{ background: 'var(--color-bg-primary)', color: '#10b981' }}
                    >
                      {expectedOutput}
                    </code>
                  </>
                ) : (
                  <p className="text-sm text-amber-400">
                    Your tests must pass.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Related Topic - only show in modal mode */}
        {!isEmbedded && (() => {
          const slug = lessonSlug || (expectedOutput ? challenges.find(c => c.starterCode === initialCode)?.lessonSlug : null)
          const content = slug ? lessonContent[slug] : null
          if (!content) return null
          
          return (
            <div 
              className="mb-4 p-4 rounded-xl border"
              style={{ 
                background: 'var(--color-bg-card)',
                borderColor: 'var(--color-bg-hover)'
              }}
            >
              <button
                onClick={() => setShowLessonFull(!showLessonFull)}
                className="w-full flex items-center justify-between mb-2"
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={14} style={{ color: 'var(--color-amber-400)' }} />
                  <span className="text-xs font-medium text-amber-400 uppercase tracking-wide">Related Topic</span>
                </div>
                {showLessonFull ? (
                  <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} />
                ) : (
                  <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />
                )}
              </button>
              {showLessonFull ? (
                <div className="text-sm text-gray-300 leading-relaxed markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-gray-300 leading-relaxed">
                  {extractExcerpt(content, 300)}
                </p>
              )}
            </div>
          )
        })()}

        <div className={`grid ${isEmbedded ? 'flex-1 gap-0' : 'lg:grid-cols-3 gap-3 lg:gap-4'} overflow-hidden`}>
          {/* Code Editor - Monaco */}
          <div 
            className={isEmbedded ? 'flex flex-col min-h-0' : 'lg:col-span-2 rounded-xl overflow-hidden border'}
            style={isEmbedded ? {} : { 
              background: 'var(--color-bg-elevated)',
              borderColor: 'var(--color-bg-hover)'
            }}
          >
            {/* Editor header */}
            <div 
              className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
              style={isEmbedded ? { borderColor: 'var(--color-bg-hover)', background: 'var(--color-bg-card)' } : { 
                background: 'var(--color-bg-card)',
                borderColor: 'var(--color-bg-hover)'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#10b981' }} />
                </div>
                <span className="text-sm font-mono" style={{ color: 'var(--color-text-muted)' }}>main.go</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={copyCode}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                  title="Copy code"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button
                  onClick={resetCode}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                  title="Reset code"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
            
            {/* Monaco Editor */}
            <div className={isEmbedded ? 'flex-1 min-h-0' : ''} style={isEmbedded ? {} : { height: '400px' }}>
              <Editor
                height="100%"
                defaultLanguage="go"
                value={code}
                onChange={(value) => setCode(value || '')}
                onMount={handleEditorMount}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  padding: { top: 12, bottom: 12 },
                  scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto'
                  },
                  quickSuggestions: true,
                  suggestOnTriggerCharacters: true,
                  parameterHints: { enabled: true },
                  hover: { enabled: true },
                  wordBasedSuggestions: 'currentDocument',
                  suggestSelection: 'first',
                  acceptSuggestionOnEnter: 'on',
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
          </div>

          {/* Output & Hints */}
          <div className={`space-y-3 lg:space-y-4 ${isEmbedded ? 'overflow-y-auto' : ''}`}>
            {/* Hints Panel */}
            {isChallengeMode && hints.length > 0 && !challengeSolved && (
              <div 
                className="rounded-xl overflow-hidden border"
                style={{ 
                  background: 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-bg-hover)'
                }}
              >
                <div 
                  className="flex items-center justify-between px-4 py-2.5 border-b"
                  style={{ 
                    background: 'var(--color-bg-card)',
                    borderColor: 'var(--color-bg-hover)'
                  }}
                >
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    <Lightbulb size={14} className="text-amber-400" />
                    Hints
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {currentHint + 1}/{hints.length}
                  </span>
                </div>
                <div className="p-3">
                  {showHint && hints[currentHint] ? (
                    <p className="text-sm text-gray-300">{hints[currentHint]}</p>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      Stuck? Use a hint to help solve the challenge.
                    </p>
                  )}
                  {currentHint < hints.length - 1 && (
                    <button
                      onClick={nextHint}
                      className="mt-2 text-xs text-amber-400 hover:underline"
                    >
                      Show next hint
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Output Panel */}
            <div 
              className="rounded-xl overflow-hidden border flex flex-col"
              style={isEmbedded ? { minHeight: '200px' } : { 
                background: 'var(--color-bg-elevated)',
                borderColor: 'var(--color-bg-hover)'
              }}
            >
              <div 
                className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
                style={{ 
                  background: 'var(--color-bg-card)',
                  borderColor: 'var(--color-bg-hover)'
                }}
              >
                <span className="text-sm font-medium text-white">Output</span>
                <button
                  onClick={runCode}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ 
                    background: challengeSolved
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-amber-400) 100%)',
                    color: challengeSolved ? '#10b981' : 'var(--color-bg-deep)'
                  }}
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                  {isChallengeMode ? 'Run & Check' : 'Run'}
                </button>
              </div>
              <div className="flex-1 p-4 overflow-auto min-h-0">
                {errors.length > 0 && !output ? (
                  <div style={{ color: '#ef4444' }}>
                    <p className="text-sm font-medium mb-2">Compilation failed</p>
                    <pre className="font-mono text-xs whitespace-pre-wrap" style={{ fontFamily: 'var(--font-mono)' }}>
                      {errors.map(e => e.message).join('\n')}
                    </pre>
                  </div>
                ) : output ? (
                  <div>
                    <pre 
                      className="font-mono text-sm whitespace-pre-wrap" 
                      style={{ 
                        fontFamily: 'var(--font-mono)',
                        color: isChallengeMode && validateOutput(output) ? '#10b981' : '#10b981'
                      }}
                    >
                      {output}
                    </pre>
                    {isChallengeMode && validateOutput(output) && (
                      <div className="mt-3 p-2 rounded-lg bg-green-500/10 border border-green-500/30">
                        <p className="text-sm text-green-400 flex items-center gap-2">
                          <CheckCircle size={14} />
                          Correct! +{points} points
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Press <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--color-bg-card)' }}>Ctrl</span> + <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--color-bg-card)' }}>Enter</span> or click Run
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - only show in modal mode */}
        {!isEmbedded && (
          <div className="mt-4 text-center">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Powered by go.dev • Keyboard shortcut: Ctrl+Enter • VS Code features enabled
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
