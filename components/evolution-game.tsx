'use client'

import { useState } from 'react'

type Fur = 'fluffy' | 'slick'
type Legs = 'short' | 'long'
type Phase = 'breeding' | 'event-anim' | 'event-result'

interface Creature {
  id: number
  fur: Fur
  legs: Legs
  mutant: boolean
}

interface StageMeta {
  name: string
  goal: string
  clue: string
  envLabel: string
  icon: string
  overlayClass: 'blizzard' | 'magma' | 'virus'
  headline: string
  sub: string
  clearNote: string
}

const STAGES: StageMeta[] = [
  {
    name: '氷河期',
    goal: '毛がフサフサの生き物を生き残らせよう',
    clue: '「毛がフサフサ」の生き物を2匹タッチして配合しよう',
    envLabel: '氷河期スタート',
    icon: '❄️',
    overlayClass: 'blizzard',
    headline: '大寒波が到来！吹雪が吹き荒れる…',
    sub: '毛がツルツルの個体は凍えてしまう',
    clearNote: 'フサフサの毛皮が寒さから身を守った！',
  },
  {
    name: 'マグマの海',
    goal: '足が長くジャンプ力の高い生き物を作ろう',
    clue: '「足が長い」生き物を2匹タッチして配合しよう',
    envLabel: '地震スタート',
    icon: '🌋',
    overlayClass: 'magma',
    headline: '大地が引き裂かれた！マグマが迫る…',
    sub: '足の短い個体は谷底へ落ちてしまう',
    clearNote: '長い足で崖を飛び越えた！',
  },
  {
    name: 'ウイルスの魔王',
    goal: '突然変異で毒に強い最強生物を誕生させろ',
    clue: 'どの2匹でもOK！配合ボタンを連打して突然変異を狙おう',
    envLabel: '最終バトル開始',
    icon: '👾',
    overlayClass: 'virus',
    headline: '魔王が猛毒を放った！',
    sub: '普通の個体は毒に侵されてしまう',
    clearNote: '紫色の突然変異体が毒を跳ね返し、魔王を消滅させた！',
  },
]

const CHILD_MIN = 3
const CHILD_MAX = 5
const FLIP_CHANCE = 0.12
const MUTANT_CHANCE = 0.25
const SURVIVAL_THRESHOLD = 3
const MAX_POPULATION = 50
const EVENT_ANIM_MS = 1600
const DEATH_ANIM_MS = 700

let nextId = 1
function newCreature(data: Omit<Creature, 'id'>): Creature {
  return { id: nextId++, ...data }
}

function randomChildCount() {
  return CHILD_MIN + Math.floor(Math.random() * (CHILD_MAX - CHILD_MIN + 1))
}

function seedStage1(): Creature[] {
  return [
    ...Array.from({ length: 2 }, () => newCreature({ fur: 'fluffy', legs: 'short', mutant: false })),
    ...Array.from({ length: 10 }, () => newCreature({ fur: 'slick', legs: 'short', mutant: false })),
  ]
}

function seedStage2(survivors: Creature[]): Creature[] {
  const base = survivors.map((c) => ({ fur: c.fur, legs: 'short' as Legs, mutant: false }))
  const longCount = Math.max(2, Math.round(base.length * 0.15))
  const indices = base
    .map((_, i) => i)
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(longCount, base.length))
  indices.forEach((i) => {
    base[i] = { ...base[i], legs: 'long' }
  })
  return base.map((data) => newCreature(data))
}

function seedStage3(survivors: Creature[]): Creature[] {
  return survivors.map((c) => newCreature({ fur: c.fur, legs: c.legs, mutant: false }))
}

function inheritBinary<T extends string>(a: T, b: T, other: T, flipChance = FLIP_CHANCE): T {
  const base = Math.random() < 0.5 ? a : b
  return Math.random() < flipChance ? other : base
}

function breedFur(p1: Creature, p2: Creature): Creature[] {
  return Array.from({ length: randomChildCount() }, () =>
    newCreature({
      fur: inheritBinary(p1.fur, p2.fur, p1.fur === 'fluffy' ? 'slick' : 'fluffy'),
      legs: 'short',
      mutant: false,
    }),
  )
}

function breedLegs(p1: Creature, p2: Creature): Creature[] {
  return Array.from({ length: randomChildCount() }, () =>
    newCreature({
      fur: 'fluffy',
      legs: inheritBinary(p1.legs, p2.legs, p1.legs === 'long' ? 'short' : 'long'),
      mutant: false,
    }),
  )
}

function breedMutation(): { children: Creature[]; mutantBorn: boolean } {
  const n = randomChildCount()
  const mutantBorn = Math.random() < MUTANT_CHANCE
  const mutantIndex = mutantBorn ? Math.floor(Math.random() * n) : -1
  const children = Array.from({ length: n }, (_, i) =>
    newCreature({ fur: 'fluffy', legs: 'long', mutant: i === mutantIndex }),
  )
  return { children, mutantBorn }
}

export function EvolutionGame({
  standalone = true,
  onCleared,
}: {
  standalone?: boolean
  onCleared?: () => void
}) {
  const [stageIndex, setStageIndex] = useState(0)
  const [population, setPopulation] = useState<Creature[]>(() => seedStage1())
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [dyingIds, setDyingIds] = useState<Set<number>>(new Set())
  const [phase, setPhase] = useState<Phase>('breeding')
  const [outcome, setOutcome] = useState<'clear' | 'fail' | null>(null)
  const [message, setMessage] = useState('')
  const [gameCleared, setGameCleared] = useState(false)

  const stage = STAGES[stageIndex]

  const toggleSelect = (id: number) => {
    if (phase !== 'breeding') return
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id)
      if (prev.length < 2) return [...prev, id]
      return [prev[1], id]
    })
  }

  const handleBreed = () => {
    if (phase !== 'breeding' || selectedIds.length !== 2 || population.length >= MAX_POPULATION) return
    const parents = selectedIds.map((id) => population.find((c) => c.id === id)!) as [Creature, Creature]
    let children: Creature[]
    if (stageIndex === 0) {
      children = breedFur(parents[0], parents[1])
      setMessage(`${children.length}匹の赤ちゃんが生まれた！`)
    } else if (stageIndex === 1) {
      children = breedLegs(parents[0], parents[1])
      setMessage(`${children.length}匹の赤ちゃんが生まれた！`)
    } else {
      const result = breedMutation()
      children = result.children
      setMessage(
        result.mutantBorn
          ? '✨ 突然変異が発生！紫色の個体が生まれた！'
          : `${children.length}匹生まれた（突然変異なし、もう一度配合してみよう）`,
      )
    }
    setPopulation((pop) => [...pop, ...children])
  }

  const checkSurvival = (c: Creature) => {
    if (stageIndex === 0) return c.fur === 'fluffy'
    if (stageIndex === 1) return c.legs === 'long'
    return c.mutant
  }

  const handleStartEvent = () => {
    if (phase !== 'breeding') return
    setPhase('event-anim')
    setMessage('')
    setTimeout(() => {
      const threshold = stageIndex === 2 ? 1 : SURVIVAL_THRESHOLD
      const survivorCount = population.filter(checkSurvival).length
      if (survivorCount >= threshold) {
        const toRemove = new Set(population.filter((c) => !checkSurvival(c)).map((c) => c.id))
        setDyingIds(toRemove)
        setOutcome('clear')
        setPhase('event-result')
        setTimeout(() => {
          setPopulation((pop) => pop.filter((c) => !toRemove.has(c.id)))
          setDyingIds(new Set())
        }, DEATH_ANIM_MS)
      } else {
        setOutcome('fail')
        setPhase('event-result')
      }
    }, EVENT_ANIM_MS)
  }

  const handleContinueAfterFail = () => {
    setPhase('breeding')
    setOutcome(null)
  }

  const handleNextStage = () => {
    const survivors = population.filter(checkSurvival)
    if (stageIndex < STAGES.length - 1) {
      const next = stageIndex + 1
      setStageIndex(next)
      setPopulation(next === 1 ? seedStage2(survivors) : seedStage3(survivors))
      setSelectedIds([])
      setPhase('breeding')
      setOutcome(null)
      setMessage('')
    } else {
      setGameCleared(true)
    }
  }

  const restartGame = () => {
    setStageIndex(0)
    setPopulation(seedStage1())
    setSelectedIds([])
    setDyingIds(new Set())
    setPhase('breeding')
    setOutcome(null)
    setMessage('')
    setGameCleared(false)
  }

  if (gameCleared) {
    if (!standalone) {
      return (
        <div className="evo-embedded-clear">
          <div className="evo-icon-big">🏆</div>
          <h3>3つのステージをすべて生き抜いた！</h3>
          <p>
            氷河期・マグマの海・ウイルスの魔王――過酷な環境を、配合としんかの力で乗り越えた。
            生き残った「最強のしんか」を胸に、次のクイズに挑戦しよう。
          </p>
          <button className="primary-action" style={{ margin: '0 auto' }} onClick={() => onCleared?.()}>
            クイズに進む <span>→</span>
          </button>
        </div>
      )
    }
    return (
      <main className="app-shell evo-victory">
        <div className="evo-icon-big">🏆</div>
        <h1>すべてのステージをクリア！</h1>
        <p>
          氷河期を乗り越え、マグマの海を飛び越え、そして突然変異の力でウイルスの魔王を打ち破った。
          あなたが選び、配合し続けた生き物たちは、地球の歴史で最も過酷な環境を生き抜いた「最強のしんか」だ。
        </p>
        <button className="primary-action" style={{ margin: '0 auto' }} onClick={restartGame}>
          もう一度さいしょから <span>↗</span>
        </button>
      </main>
    )
  }

  const stageDots = (
    <div className="evo-stage-dots">
      {STAGES.map((s, i) => (
        <span key={s.name} className={i < stageIndex ? 'done' : i === stageIndex ? 'current' : ''} title={s.name} />
      ))}
    </div>
  )

  const stageBody = (
    <>
      <div className="step-heading">
        <span className="section-kicker">
          STAGE {stageIndex + 1} / {STAGES.length} ・ {stage.icon} {stage.name}
        </span>
        <h2>{stage.goal}</h2>
        <p>{stage.clue}</p>
      </div>

      <div className="evo-select-status">選択中の親: {selectedIds.length} / 2</div>

      <div className="creature-pond">
        {population.map((c) => (
          <button
            key={c.id}
            className={`creature-slot ${selectedIds.includes(c.id) ? 'selected' : ''} ${
              dyingIds.has(c.id) ? 'dying' : ''
            }`}
            onClick={() => toggleSelect(c.id)}
            disabled={phase !== 'breeding'}
          >
            <CreatureAvatar fur={c.fur} legs={c.legs} mutant={c.mutant} />
          </button>
        ))}
      </div>

      <div className="evo-controls">
        <button
          className="primary-action"
          style={{ margin: 0 }}
          disabled={selectedIds.length !== 2 || phase !== 'breeding' || population.length >= MAX_POPULATION}
          onClick={handleBreed}
        >
          配合ボタン
        </button>
        <button className="secondary-action" disabled={phase !== 'breeding'} onClick={handleStartEvent}>
          {stage.icon} {stage.envLabel}
        </button>
      </div>

      {message && <div className="evo-message">{message}</div>}
      {population.length >= MAX_POPULATION && (
        <div className="evo-message">個体数がいっぱいです。環境スタートで選抜しよう</div>
      )}

      {outcome === 'fail' && phase === 'event-result' && (
        <div className="evo-result fail">
          <h4>まだ生き残れない…</h4>
          <p>{stage.sub}。対象の生き物がまだ少ないようだ。配合を続けて数を増やしてから、もう一度挑戦しよう。</p>
          <button className="secondary-action" style={{ alignSelf: 'flex-end' }} onClick={handleContinueAfterFail}>
            配合を続ける
          </button>
        </div>
      )}

      {outcome === 'clear' && phase === 'event-result' && (
        <div className="evo-result">
          <h4>🎉 ステージクリア！</h4>
          <p>{stage.clearNote}</p>
          <button
            className="primary-action"
            style={{ margin: 0, alignSelf: 'flex-end' }}
            disabled={dyingIds.size > 0}
            onClick={handleNextStage}
          >
            {stageIndex < STAGES.length - 1 ? '次のステージへ' : '結末を見る'} <span>→</span>
          </button>
        </div>
      )}
    </>
  )

  const overlay = phase === 'event-anim' && (
    <div className={`evo-overlay ${stage.overlayClass}`}>
      <div className="evo-icon">{stage.icon}</div>
      <h3>{stage.headline}</h3>
      <p>{stage.sub}</p>
    </div>
  )

  if (!standalone) {
    return (
      <div className="evo-embedded">
        {stageDots}
        {stageBody}
        {overlay}
      </div>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-symbol">🧬</span>
          <span>
            <b>SHINKA SURVIVOR</b>
            <small>配合としんかで生き残れ</small>
          </span>
        </div>
      </header>

      {stageDots}

      <section className="step-card">{stageBody}</section>

      {overlay}

      <footer>
        <span>SHINKA SURVIVOR / technozemi17-2</span>
        <span>選んで、配合して、生き残れ。</span>
      </footer>
    </main>
  )
}

function CreatureAvatar({ fur, legs, mutant }: { fur: Fur; legs: Legs; mutant: boolean }) {
  return (
    <span className={`creature-avatar ${mutant ? 'mutant' : fur} ${legs === 'long' ? 'legs-long' : 'legs-short'}`}>
      <span className="creature-eyes">
        <i />
        <i />
      </span>
      <span className="creature-legs">
        <i />
        <i />
      </span>
      {mutant && <span className="creature-spark">✨</span>}
    </span>
  )
}
