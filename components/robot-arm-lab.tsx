'use client'

import { useEffect, useState } from 'react'

type Part = 'A' | 'B' | 'C'
type Phase = 'setup' | 'running' | 'result'
type Outcome = 'fail-a' | 'fail-b' | 'fail-power-high' | 'fail-power-low' | 'fail-near' | 'success'

const PARTS: { id: Part; label: string; note: string }[] = [
  { id: 'A', label: '細いアーム', note: '図形・レバー比重視' },
  { id: 'B', label: '長いアーム', note: 'パワー重視' },
  { id: 'C', label: 'バランス型アーム', note: '太さ・長さのバランス' },
]

const POWER_MIN = 50
const POWER_MAX = 200
const POWER_HIGH_LIMIT = 160
const POWER_LOW_LIMIT = 90
const SUCCESS_POWER_MIN = 95
const SUCCESS_POWER_MAX = 150
const RUN_DURATION_MS = 2000

function evaluate(part: Part, power: number): Outcome {
  if (power >= POWER_HIGH_LIMIT) return 'fail-power-high'
  if (power <= POWER_LOW_LIMIT) return 'fail-power-low'
  if (part === 'A') return 'fail-a'
  if (part === 'B') return 'fail-b'
  if (power >= SUCCESS_POWER_MIN && power <= SUCCESS_POWER_MAX) return 'success'
  return 'fail-near'
}

const OUTCOME_META: Record<Outcome, { title: string; hint?: string; dropsBomb: boolean; explodes: boolean; shakes: boolean }> = {
  'fail-a': { title: 'バキッ！爆弾が重く、アームが折れたーーー！💥', dropsBomb: true, explodes: true, shakes: false },
  'fail-power-high': { title: 'パワーが強すぎてアームが故障💥！', dropsBomb: false, explodes: true, shakes: false },
  'fail-b': { title: 'アームが長すぎて、爆弾を掴めなかった...😔', dropsBomb: false, explodes: false, shakes: false },
  'fail-power-low': { title: 'ウググ…重さに負けてパワー不足！動かない！😫', dropsBomb: true, explodes: false, shakes: true },
  'fail-near': {
    title: '惜しい！設計はバランス型で正解だけど、パワーが合わなかったみたい。',
    hint: `パワーを${SUCCESS_POWER_MIN}%〜${SUCCESS_POWER_MAX}%の間に調整してみよう。`,
    dropsBomb: false,
    explodes: false,
    shakes: true,
  },
  success: { title: 'キラーン！完璧な設計だ！✨', dropsBomb: false, explodes: false, shakes: false },
}

export default function RobotArmLab({
  standalone = false,
  onComplete,
}: {
  standalone?: boolean
  onComplete?: () => void
}) {
  const [part, setPart] = useState<Part | null>(null)
  const [power, setPower] = useState(100)
  const [phase, setPhase] = useState<Phase>('setup')
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  const launch = () => {
    if (!part || phase !== 'setup') return
    setPhase('running')
    setOutcome(null)
    window.setTimeout(() => {
      setOutcome(evaluate(part, power))
      setPhase('result')
    }, RUN_DURATION_MS)
  }

  const retry = () => {
    setPhase('setup')
    setOutcome(null)
  }

  useEffect(() => {
    if (phase !== 'result' || outcome !== 'success' || standalone) return
    const timer = window.setTimeout(() => onComplete?.(), 2200)
    return () => window.clearTimeout(timer)
  }, [phase, outcome, standalone, onComplete])

  const meta = outcome ? OUTCOME_META[outcome] : null
  const isFail = outcome !== null && outcome !== 'success'

  return (
    <div className="arm-lab">
      <span className="completion-badge">MACHINE LAB</span>
      <h3>大爆破！？ロボットアームで爆弾を運べ</h3>
      <p className="circuit-lead">
        アームの設計とモーターのパワーを選んで、爆弾を安全地帯まで運ぼう。パワーが強すぎても弱すぎても失敗する。
      </p>

      <div className={`arm-stage ${phase} ${outcome ?? ''}`}>
        <div className="arm-zone arm-zone-bomb">
          <span className="arm-zone-label">爆弾（荷物）</span>
          <span className={`arm-bomb ${meta?.dropsBomb ? 'dropped' : ''} ${outcome === 'success' ? 'carried' : ''}`}>
            💣
          </span>
        </div>
        <div className="arm-zone arm-zone-center">
          <span className="arm-zone-label">ロボットアーム</span>
          <span className="arm-robot">🦾</span>
          {meta?.explodes && <span className="arm-explosion">💥🔥💣</span>}
        </div>
        <div className="arm-zone arm-zone-safe">
          <span className="arm-zone-label">安全地帯（ゴール）</span>
          <span className="arm-safe-marker">🟩</span>
          {outcome === 'success' && <span className="arm-bomb-delivered">💣✅</span>}
        </div>
        {isFail && <div className="arm-red-filter" />}
      </div>

      {phase !== 'setup' && meta && (
        <div className={`arm-result ${outcome === 'success' ? 'success' : 'fail'}`}>
          <h4>{meta.title}</h4>
          {meta.hint && <p>{meta.hint}</p>}
          {outcome !== 'success' && (
            <button className="secondary-action" onClick={retry}>
              もう一度設計する
            </button>
          )}
        </div>
      )}

      {phase === 'setup' && (
        <div className="arm-controls">
          <p className="control-label">① アームの設計図を選ぶ</p>
          <div className="arm-part-grid">
            {PARTS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`arm-part ${part === p.id ? 'selected' : ''}`}
                onClick={() => setPart(p.id)}
              >
                <b>{p.label}</b>
                <small>{p.note}</small>
              </button>
            ))}
          </div>

          <p className="control-label">② モーターのパワー：{power}%</p>
          <input
            type="range"
            className="lab-slider"
            min={POWER_MIN}
            max={POWER_MAX}
            step={5}
            value={power}
            onChange={(e) => setPower(Number(e.target.value))}
          />

          <button className="primary-action arm-launch" disabled={!part} onClick={launch} style={{ margin: '24px auto 0' }}>
            アーム起動 🚀
          </button>
        </div>
      )}
    </div>
  )
}
