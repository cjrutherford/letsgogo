import { useState } from 'react'
import { Trophy, Star, HelpCircle, ChevronDown, ChevronUp, Code, CheckCircle } from 'lucide-react'
import type { CodeChallenge } from '../lib/challenges'
import { useProgress } from '../lib/progress'
import { CodePlayground } from './CodePlayground'
import { challenges } from '../lib/challenges'

interface ChallengeCardProps {
  challenge: CodeChallenge
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { isChallengeCompleted, completeChallenge } = useProgress()
  const [expanded, setExpanded] = useState(false)
  const [showPlayground, setShowPlayground] = useState(false)
  const [hintIndex, setHintIndex] = useState(-1)
  const [solved, setSolved] = useState(isChallengeCompleted(challenge.id))

  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    hard: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const handleChallengeComplete = () => {
    setSolved(true)
    completeChallenge(challenge.id, challenge.points)
  }

  return (
    <>
      <div 
        className="rounded-xl border overflow-hidden"
        style={{ 
          background: solved ? 'rgba(16, 185, 129, 0.05)' : 'var(--color-bg-card)',
          borderColor: solved ? 'rgba(16, 185, 129, 0.3)' : 'var(--color-bg-hover)'
        }}
      >
        {/* Challenge Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ 
                background: solved ? 'rgba(16, 185, 129, 0.2)' : 'var(--color-amber-glow)'
              }}
            >
              {solved ? (
                <CheckCircle size={20} className="text-green-400" />
              ) : (
                <Trophy size={20} style={{ color: 'var(--color-amber-400)' }} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">{challenge.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded border ${difficultyColors[challenge.difficulty]}`}>
                  {challenge.difficulty}
                </span>
                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-amber-400)' }}>
                  <Star size={12} />
                  {challenge.points} pts
                </span>
                {solved && (
                  <span className="text-xs text-green-400">Completed!</span>
                )}
              </div>
            </div>
          </div>
          {expanded ? (
            <ChevronUp size={20} style={{ color: 'var(--color-text-muted)' }} />
          ) : (
            <ChevronDown size={20} style={{ color: 'var(--color-text-muted)' }} />
          )}
        </button>

        {/* Expanded Content */}
        {expanded && (
          <div className="px-4 pb-4">
            {/* Description */}
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {challenge.description}
            </p>

            {/* Starter Code Preview */}
            <div 
              className="rounded-lg p-3 mb-4 overflow-x-auto"
              style={{ background: 'var(--color-bg-primary)' }}
            >
              <pre className="text-xs font-mono text-gray-300 whitespace-pre">
                {challenge.starterCode}
              </pre>
            </div>

            {/* Hints */}
            {hintIndex >= 0 && (
              <div 
                className="rounded-lg p-3 mb-4"
                style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}
              >
                <p className="text-xs font-semibold text-amber-400 mb-1">Hint {hintIndex + 1}:</p>
                <p className="text-sm text-gray-300">{challenge.hints[hintIndex]}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowPlayground(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
                style={{ 
                  background: solved 
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : 'linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-amber-400) 100%)',
                  color: solved ? '#10b981' : 'var(--color-bg-deep)'
                }}
              >
                <Code size={16} />
                {solved ? 'Try Again' : 'Start Challenge'}
              </button>
              
              {!solved && hintIndex < challenge.hints.length - 1 && (
                <button
                  onClick={() => setHintIndex(hintIndex + 1)}
                  className="px-4 py-2 rounded-lg border transition-colors"
                  style={{ borderColor: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }}
                >
                  <HelpCircle size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Challenge Playground Modal */}
      {showPlayground && (
        <CodePlayground
          initialCode={challenge.starterCode}
          expectedOutput={challenge.expectedOutput}
          validationPattern={challenge.validationPattern}
          challengeId={challenge.id}
          points={challenge.points}
          hints={challenge.hints}
          onClose={() => {
            setShowPlayground(false)
            setSolved(isChallengeCompleted(challenge.id))
          }}
          onSuccess={handleChallengeComplete}
        />
      )}
    </>
  )
}

interface ChallengeListProps {
  lessonSlug: string
}

export function ChallengeList({ lessonSlug }: ChallengeListProps) {
  const lessonChallenges = challenges.filter((c: CodeChallenge) => c.lessonSlug === lessonSlug)

  if (lessonChallenges.length === 0) return null

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Trophy size={20} style={{ color: 'var(--color-amber-400)' }} />
        Code Challenges
      </h2>
      <div className="space-y-3">
        {lessonChallenges.map((challenge: CodeChallenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  )
}
