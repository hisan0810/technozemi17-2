'use client'

import { useState } from 'react'
import {
  Check,
  ChevronRight,
  FlaskConical,
  RotateCcw,
  Sparkles,
  Waves,
} from 'lucide-react'

type Liquid = 'lemon' | 'soap' | 'fizz'
type Phase = 'experiment' | 'quiz' | 'result'

const liquids: {
  id: Liquid
  label: string
  note: string
  color: string
}[] = [
  {
    id: 'lemon',
    label: 'レモン汁',
    note: '酸性の液体',
    color: '#de5962',
  },
  {
    id: 'soap',
    label: '石鹸水',
    note: 'アルカリ性の液体',
    color: '#9bd03f',
  },
  {
    id: 'fizz',
    label: '重曹＋クエン酸',
    note: '泡が出る組み合わせ',
    color: '#e5a13b',
  },
]

export default function Page() {
  const [phase, setPhase] = useState<Phase>('experiment')
  const [selected, setSelected] = useState<Liquid | null>(null)
  const [answer, setAnswer] = useState<Liquid | null>(null)

  const reset = () => {
    setPhase('experiment')
    setSelected(null)
    setAnswer(null)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="app-shell topbar">
        <div className="brand">
          <div className="brand-symbol">
            <FlaskConical size={20} />
          </div>

          <div>
            <b>LAB NOTE / 01</b>
            <small>A LIQUID × B LIQUID</small>
          </div>
        </div>

        <button className="reset-link" onClick={reset}>
          <RotateCcw size={14} />
          最初から
        </button>
      </header>

      <div className="app-shell lab-content">
        <nav className="lab-progress" aria-label="実験の進行">
          <span className={phase === 'experiment' ? 'active' : ''}>
            01 EXPERIMENT
          </span>

          <i>/</i>

          <span className={phase === 'quiz' ? 'active' : ''}>
            02 OBSERVE
          </span>

          <i>/</i>

          <span className={phase === 'result' ? 'active' : ''}>
            03 NOTE
          </span>
        </nav>

        {phase === 'experiment' && (
          <section className="lab-page">
            <div className="lab-heading">
              <p className="eyebrow">CHEMISTRY / 物質の変化</p>

              <h1>
                A液とB液を
                <br />
                <em>混ぜろ！</em>
              </h1>

              <p>
                棚からB液をひとつ選んで、ビーカーへ注ごう。
                <br />
                色や泡の変化をよく観察してみて。
              </p>
            </div>

            <div className="lab-layout">
              <section className="liquid-shelf">
                <p className="section-kicker">SHELF / B LIQUIDS</p>

                <div className="liquid-list">
                  {liquids.map((liquid) => (
                    <button
                      key={liquid.id}
                      className={`liquid-card ${
                        selected === liquid.id ? 'selected' : ''
                      }`}
                      onClick={() => setSelected(liquid.id)}
                    >
                      <span
                        className="liquid-swatch"
                        style={{ backgroundColor: liquid.color }}
                      />

                      <span>
                        <strong>{liquid.label}</strong>
                        <small>{liquid.note}</small>
                      </span>

                      <ChevronRight size={18} />
                    </button>
                  ))}
                </div>
              </section>

              <section
                className={`beaker-stage ${
                  selected ? 'has-liquid' : ''
                }`}
                aria-live="polite"
              >
                <span className="stage-label">BEAKER / A LIQUID</span>

                <div
                  className={`beaker ${
                    selected ? `beaker-${selected}` : ''
                  }`}
                >
                  <div className="beaker-line" />
                  <div className="liquid" />

                  {selected === 'fizz' && (
                    <div className="bubbles">
                      {Array.from({ length: 12 }).map((_, index) => (
                        <i
                          key={index}
                          style={
                            {
                              '--i': index,
                            } as React.CSSProperties
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>

                <h2>
                  {!selected
                    ? '液体を選んでビーカーに注ぐ'
                    : selected === 'lemon'
                      ? '鮮やかな赤色に変化！'
                      : selected === 'soap'
                        ? '怪しい緑色に変化！'
                        : 'シュワシュワ泡が発生！'}
                </h2>

                <p className="stage-note">
                  <Waves size={16} />
                  変化を観察しよう
                </p>

                <button
                  className="primary-action"
                  disabled={!selected}
                  onClick={() => setPhase('quiz')}
                >
                  観察メモを書く
                  <ChevronRight size={18} />
                </button>
              </section>
            </div>
          </section>
        )}

        {phase === 'quiz' && (
          <section className="note-page">
            <p className="eyebrow">OBSERVATION / 考えてみよう</p>

            <h1>
              重曹とクエン酸を混ぜると、
              <br />
              <em>泡が出たのはなぜ？</em>
            </h1>

            <div className="answer-list">
              {[
                ['fizz', '気体（二酸化炭素）が発生したから'],
                ['lemon', '液体が温められて蒸発したから'],
                ['soap', '色素が光で分解されたから'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={answer === id ? 'answer selected' : 'answer'}
                  onClick={() => setAnswer(id as Liquid)}
                >
                  {label}
                  {answer === id && <Check size={20} />}
                </button>
              ))}
            </div>

            <button
              className="primary-action"
              disabled={!answer}
              onClick={() => setPhase('result')}
            >
              記録を保存する
              <ChevronRight size={18} />
            </button>
          </section>
        )}

        {phase === 'result' && (
          <section className="note-page result-page">
            <div className="result-icon">
              <Sparkles size={30} />
            </div>

            <p className="eyebrow">LAB NOTE / COMPLETE</p>

            <h1>
              化学変化で
              <br />
              <em>気体が生まれた。</em>
            </h1>

            <p>
              重曹とクエン酸が反応すると、二酸化炭素の泡が発生します。
              <br />
              身近な製品にも使われている、化学の力です。
            </p>

            <button className="primary-action" onClick={reset}>
              <RotateCcw size={18} />
              もう一度実験する
            </button>
          </section>
        )}
      </div>
    </main>
  )
}
