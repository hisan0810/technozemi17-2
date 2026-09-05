'use client'

import { useEffect, useState } from 'react'

type WallId = 'north' | 'south' | 'east' | 'west'
type Phase = 'setup' | 'shaking' | 'result'
type Outcome = 'fail-budget' | 'fail-balance' | 'fail-dark' | 'fail-near' | 'success'

const WALLS: { id: WallId; label: string }[] = [
  { id: 'north', label: '北の壁' },
  { id: 'south', label: '南の壁' },
  { id: 'east', label: '東の壁' },
  { id: 'west', label: '西の壁' },
]

const BUDGET_MIN = 0
const BUDGET_MAX = 150
const BUDGET_FAIL_LIMIT = 30
const SUCCESS_BUDGET_MIN = 70
const SUCCESS_BUDGET_MAX = 130
const SHAKE_DURATION_MS = 3000

function evaluate(walls: Record<WallId, boolean>, budget: number): Outcome {
  const count = Object.values(walls).filter(Boolean).length
  if (budget <= BUDGET_FAIL_LIMIT) return 'fail-budget'
  if (count <= 2) return 'fail-balance'
  if (count === 4) return 'fail-dark'
  if (budget >= SUCCESS_BUDGET_MIN && budget <= SUCCESS_BUDGET_MAX) return 'success'
  return 'fail-near'
}

const OUTCOME_META: Record<Outcome, { title: string; hint?: string }> = {
  'fail-budget': {
    title: 'ガシャーン！予算をケチりすぎて、柱が細すぎて一瞬で崩壊した！',
    hint: `スライダーを動かして、予算（柱の太さ）を${SUCCESS_BUDGET_MIN}%以上に増やしてみよう！`,
  },
  'fail-balance': { title: 'グラッ…！壁の配置が偏っていたため、バランスを崩してペシャッと潰れた！' },
  'fail-dark': { title: '頑丈だけど…窓が1つもない、真っ暗で息苦しい部屋になっちゃった！これじゃ住めないよ…😫（不合格）' },
  'fail-near': {
    title: '惜しい！壁の配置は3方向でバッチリだけど、予算が合わなかったみたい。',
    hint: `予算を${SUCCESS_BUDGET_MIN}%〜${SUCCESS_BUDGET_MAX}%の間に調整してみよう。`,
  },
  success: { title: 'キラーン！おしゃれで絶対に倒れない最強の間取りが完成した！✨' },
}

export default function EarthquakeLayout({
  standalone = false,
  onComplete,
}: {
  standalone?: boolean
  onComplete?: () => void
}) {
  const [walls, setWalls] = useState<Record<WallId, boolean>>({ north: false, south: false, east: false, west: false })
  const [budget, setBudget] = useState(0)
  const [phase, setPhase] = useState<Phase>('setup')
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  const toggleWall = (id: WallId) => {
    if (phase !== 'setup') return
    setWalls((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const start = () => {
    if (phase !== 'setup') return
    setPhase('shaking')
    setOutcome(null)
    window.setTimeout(() => {
      setOutcome(evaluate(walls, budget))
      setPhase('result')
    }, SHAKE_DURATION_MS)
  }

  const retry = () => {
    setPhase('setup')
    setOutcome(null)
  }

  useEffect(() => {
    if (phase !== 'result' || outcome !== 'success' || standalone) return
    const timer = window.setTimeout(() => onComplete?.(), 2400)
    return () => window.clearTimeout(timer)
  }, [phase, outcome, standalone, onComplete])

  const meta = outcome ? OUTCOME_META[outcome] : null

  return (
    <div className="quake-lab">
      <span className="completion-badge">ARCHITECTURE LAB</span>
      <h3>グラグラ地震発生！絶対に倒れない部屋の間取りを作ろう</h3>
      <p className="circuit-lead">耐震壁を入れる場所と補強予算を選んで、震度6の揺れに耐える間取りを設計しよう。</p>

      <div className={`quake-room-wrap ${phase} ${outcome ?? ''}`}>
        <div className="quake-room">
          {WALLS.map((w) => (
            <span key={w.id} className={`quake-wall quake-wall-${w.id} ${walls[w.id] ? 'built' : ''}`}>
              {walls[w.id] ? '🧱' : ''}
            </span>
          ))}
          <span className="quake-character">👤</span>
          {phase === 'result' && outcome === 'fail-dark' && <div className="quake-dark-overlay" />}
          {phase === 'result' && outcome === 'fail-budget' && <div className="quake-crush-mark">🏚️💥</div>}
          {phase === 'result' && outcome === 'success' && <div className="quake-confetti">🎉🙌🏠✨</div>}
        </div>
      </div>

      {phase !== 'setup' && meta && (
        <div className={`arm-result ${outcome === 'success' ? 'success' : 'fail'}`}>
          <h4>{meta.title}</h4>
          {meta.hint && <p>{meta.hint}</p>}
          {outcome !== 'success' && (
            <button className="secondary-action" onClick={retry}>
              設計をやり直す
            </button>
          )}
        </div>
      )}

      {phase === 'setup' && (
        <div className="arm-controls">
          <p className="control-label">耐震壁を入れる場所を選ぶ</p>
          <div className="quake-checkboxes">
            {WALLS.map((w) => (
              <label key={w.id} className={`quake-checkbox ${walls[w.id] ? 'checked' : ''}`}>
                <input type="checkbox" checked={walls[w.id]} onChange={() => toggleWall(w.id)} />
                {w.label}
              </label>
            ))}
          </div>

          <p className="control-label">補強予算：{budget}%</p>
          <input
            type="range"
            className="lab-slider"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={5}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />

          <button className="primary-action arm-launch" onClick={start} style={{ margin: '24px auto 0' }}>
            震度6スタート 🌋
          </button>
        </div>
      )}
    </div>
  )
}
