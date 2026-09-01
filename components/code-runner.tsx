'use client'

import { useEffect, useState } from 'react'
import { Balloon, ChevronRight, Flag, Play, RotateCcw, Square, Trash2, Trophy, Zap } from 'lucide-react'

type Kind = 'flag' | 'walk' | 'jump'
type Block = { id: number; kind: Kind; value?: number }

const palette: { kind: Kind; label: string }[] = [
  { kind: 'flag', label: '緑の旗が押されたとき' },
  { kind: 'walk', label: '歩あるく' },
  { kind: 'jump', label: '高さ ジャンプする' },
]

const stageInfo = [
  ['基本', '勇者を5歩歩かせよう', '5歩以上歩いて右に進もう。'],
  ['基本', '勇者をジャンプさせよう', 'ジャンプブロックを追加して実行しよう。'],
  ['応用', '勇者を歩かせ、ジャンプさせ、風船を割ろう', '歩いて近づき、ジャンプで風船に触れよう。'],
] as const

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const heroSource =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_pl17uvpl17uvpl17-Ti8jGYF6Ps5k6qupj6fJBT6wRjkuxb.jpg'
const stageBackground =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_pijzjapijzjapijz-5MLxItwAEPcRHctteo14ib2xBShb80.jpg'

const blockStyle = (kind: Kind) =>
  kind === 'flag'
    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
    : kind === 'jump'
      ? 'border-purple-200 bg-purple-50 text-purple-700'
      : 'border-orange-200 bg-orange-50 text-orange-700'

export default function CodeRunner({
  standalone = true,
  initialStage = 0,
  onComplete,
}: {
  standalone?: boolean
  initialStage?: number
  onComplete?: () => void
}) {
  const [heroImage, setHeroImage] = useState(heroSource)

  useEffect(() => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d')
      if (!context) return
      context.drawImage(image, 0, 0)
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < pixels.data.length; i += 4) {
        const red = pixels.data[i]
        const green = pixels.data[i + 1]
        const blue = pixels.data[i + 2]
        const whiteness = Math.min(red, green, blue)
        if (whiteness > 242 && Math.max(red, green, blue) - whiteness < 18) pixels.data[i + 3] = 0
        else if (whiteness > 220 && Math.max(red, green, blue) - whiteness < 24)
          pixels.data[i + 3] = Math.round((255 - whiteness) * 7.3)
      }
      context.putImageData(pixels, 0, 0)
      setHeroImage(canvas.toDataURL('image/png'))
    }
    image.src = heroSource
  }, [])

  const clampedInitial = Math.max(0, Math.min(2, initialStage))
  const [stage, setStage] = useState(clampedInitial)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [x, setX] = useState(12)
  const [y, setY] = useState(0)
  const [balloon, setBalloon] = useState(true)
  const [running, setRunning] = useState(false)
  const [cleared, setCleared] = useState(false)

  const addBlock = (kind: Kind) =>
    setBlocks((items) => [
      ...items,
      { id: Date.now() + Math.random(), kind, value: kind === 'walk' ? 1 : kind === 'jump' ? 80 : undefined },
    ])
  const update = (id: number, value: string) =>
    setBlocks((items) => items.map((b) => (b.id === id ? { ...b, value: Number(value) } : b)))
  const reset = () => {
    setBlocks([])
    setX(12)
    setY(0)
    setBalloon(true)
    setCleared(false)
    setRunning(false)
  }
  const next = () => {
    setStage((s) => Math.min(2, s + 1))
    reset()
  }

  const execute = async () => {
    if (running || !blocks.length) return
    setRunning(true)
    setCleared(false)
    setX(12)
    setY(0)
    setBalloon(true)
    let walked = 0
    let jumped = false
    let hit = false
    for (const block of blocks) {
      if (block.kind === 'walk') {
        const steps = Number.isFinite(block.value) ? block.value ?? 0 : 0
        const direction = steps < 0 ? -1 : 1
        for (let i = 0; i < Math.abs(steps); i++) {
          walked += direction
          setX((current) => Math.max(8, Math.min(88, current + direction * (stage === 2 ? 5 : 4))))
          await wait(240)
        }
      }
      if (block.kind === 'jump') {
        const height = Math.max(0, block.value ?? 0)
        if (height > 0) {
          jumped = true
          for (let t = 0; t <= 1; t += 0.1) {
            setY(Math.sin(t * Math.PI) * Math.min(150, height))
            await wait(55)
          }
          const nearBalloon = stage === 2 && x >= 55 && x <= 82 && height >= 45
          if (nearBalloon) {
            hit = true
            setBalloon(false)
          }
          for (let t = 1; t >= 0; t -= 0.1) {
            setY(Math.sin(t * Math.PI) * Math.min(150, height))
            await wait(55)
          }
          setY(0)
        }
      }
    }
    const success = stage === 0 ? walked >= 5 : stage === 1 ? jumped : walked > 0 && jumped && hit
    if (success) setCleared(true)
    setRunning(false)
  }

  const workspace = (
    <div className="grid gap-3 lg:grid-cols-[170px_minmax(220px,1fr)_minmax(300px,1.25fr)]">
      {/* Palette */}
      <aside className="rounded-xl border border-border bg-card p-3">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">命令ブロック</h3>
          <span className="text-[10px] text-muted-foreground">クリックで追加</span>
        </div>
        <div className="space-y-2">
          {palette.map((item) => (
            <button
              key={item.kind}
              onClick={() => addBlock(item.kind)}
              className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition hover:-translate-y-0.5 ${blockStyle(item.kind)}`}
            >
              <span className="grid size-6 place-items-center rounded-md bg-current/10">
                {item.kind === 'flag' ? <Flag size={14} /> : item.kind === 'jump' ? <Zap size={14} /> : <ChevronRight size={14} />}
              </span>
              {item.label}
              <span className="ml-auto text-base">＋</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Workspace */}
      <section className="rounded-xl border border-border bg-card p-3">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-widest text-accent">WORKSPACE</p>
            <h3 className="mt-1 text-sm font-semibold">コードを組み立てる</h3>
          </div>
          <button onClick={reset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <RotateCcw size={14} /> リセット
          </button>
        </div>
        <div
          className="min-h-[280px] rounded-lg border border-dashed border-border bg-secondary p-3"
          style={{
            backgroundImage:
              'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {blocks.length === 0 ? (
            <div className="grid h-full min-h-[250px] place-items-center text-center text-sm text-muted-foreground">
              <div>
                <p className="mb-2 text-2xl">＋</p>
                <p>左のブロックをクリックして開始</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${blockStyle(block.kind)}`}
                >
                  <span className="w-5 text-xs text-muted-foreground">{index + 1}</span>
                  {block.kind === 'flag' && (
                    <>
                      <Flag size={15} /> 緑の旗が押されたとき
                    </>
                  )}
                  {block.kind === 'walk' && (
                    <>
                      <input
                        aria-label="歩数"
                        type="number"
                        value={block.value}
                        onChange={(e) => update(block.id, e.target.value)}
                        className="w-16 rounded border border-current/30 bg-card px-2 py-1 text-center"
                      />
                      歩あるく
                    </>
                  )}
                  {block.kind === 'jump' && (
                    <>
                      高さ
                      <input
                        aria-label="ジャンプの高さ"
                        type="number"
                        min="1"
                        value={block.value}
                        onChange={(e) => update(block.id, e.target.value)}
                        className="w-16 rounded border border-current/30 bg-card px-2 py-1 text-center"
                      />
                      ジャンプする
                    </>
                  )}
                  <button
                    aria-label="ブロックを削除"
                    onClick={() => setBlocks((items) => items.filter((b) => b.id !== block.id))}
                    className="ml-auto text-muted-foreground hover:text-rose-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stage area */}
      <section className="rounded-xl border border-border bg-card p-3">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-widest text-accent">STAGE AREA</p>
            <h3 className="mt-1 text-sm font-semibold">勇者を動かそう</h3>
          </div>
          <div className="flex gap-2">
            <button
              aria-label="実行"
              onClick={execute}
              disabled={running || !blocks.length}
              className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm disabled:opacity-40"
            >
              <Play size={16} fill="currentColor" />
            </button>
            <button
              aria-label="停止"
              onClick={() => setRunning(false)}
              className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground"
            >
              <Square size={14} fill="currentColor" />
            </button>
          </div>
        </div>
        <div
          className="relative min-h-[280px] overflow-hidden rounded-lg border border-border"
          style={{
            backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px), url(${stageBackground})`,
            backgroundSize: '32px 32px, 32px 32px, cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 z-0 bg-white/35" />
          <div className="absolute bottom-5 left-0 right-0 z-[1] h-px bg-orange-300" />
          {/* 勇者: モーダルより必ず下に来るよう z-10 に制限 */}
          <div
            className="absolute bottom-5 z-10 transition-all duration-100"
            style={{ left: `${x}%`, transform: `translate(-50%, ${-y}px)` }}
          >
            <img src={heroImage || '/placeholder.svg'} alt="勇者" className="h-32 w-32 object-contain" />
          </div>
          {stage === 2 && balloon && (
            <div className="absolute right-[15%] top-[25%] z-[2] text-rose-500">
              <Balloon size={52} strokeWidth={1.5} />
            </div>
          )}
          {stage === 2 && !balloon && (
            <p className="absolute right-[12%] top-[22%] z-[2] rounded-full bg-card px-3 py-2 text-xs font-semibold text-primary">
              パチン！
            </p>
          )}
          <div className="absolute left-3 top-3 z-[2] rounded bg-card/80 px-2 py-1 font-mono text-[10px] text-muted-foreground">
            X: {Math.round(x)}　Y: {Math.round(y)}
          </div>
        </div>
      </section>
    </div>
  )

  // ---- Embedded mode (used inside TECH QUEST 情報 experience) ----
  if (!standalone) {
    if (cleared) {
      return (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Trophy className="mx-auto mb-3 text-accent" size={38} />
          <p className="font-mono text-[11px] font-semibold tracking-widest text-accent">MISSION COMPLETE</p>
          <h3 className="mt-2 text-xl font-bold">クリア！おめでとう！</h3>
          <p className="mt-2 text-sm text-muted-foreground">コードが正しく実行されました。</p>
          <button
            onClick={() => onComplete?.()}
            className="mx-auto mt-6 flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            クイズに進む <ChevronRight size={17} />
          </button>
        </div>
      )
    }
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-secondary px-4 py-3">
          <p className="text-xs font-semibold text-accent">
            {stageInfo[stage][0]}　·　CODE RUNNER
          </p>
          <p className="mt-1 text-sm font-bold">{stageInfo[stage][1]}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{stageInfo[stage][2]}</p>
        </div>
        {workspace}
      </div>
    )
  }

  // ---- Standalone mode (full page) ----
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-mono font-bold">TQ</span>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[.22em] text-accent">TECH QUEST / 02 INFORMATION</p>
              <h1 className="font-semibold">
                CODE RUNNER <span className="font-normal text-muted-foreground">// 体験コンテンツ</span>
              </h1>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            {[0, 1, 2].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <span
                  className={`grid size-8 place-items-center rounded-full border text-sm ${
                    n === stage
                      ? 'border-primary bg-primary text-primary-foreground'
                      : n < stage
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border text-muted-foreground'
                  }`}
                >
                  {n + 1}
                </span>
                {n < 2 && <span className="h-px w-8 bg-border" />}
              </div>
            ))}
          </div>
          <div className="text-right font-mono text-[10px] text-muted-foreground">
            <span className="text-accent">● SYSTEM ONLINE</span>
            <br />
            STAGE {stage + 1} / 3
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium text-accent">
              STAGE {stage + 1} / 3　·　{stageInfo[stage][0]}
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight">{stageInfo[stage][1]}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{stageInfo[stage][2]}</p>
          </div>
          <span className="hidden rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground md:block">
            PC推奨
          </span>
        </div>
        {workspace}
      </div>

      {/* ステージクリアのモーダル: 十分な重ね順(z-50)で勇者(z-10)より必ず手前 */}
      {cleared && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-5 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
            <Trophy className="mx-auto mb-4 text-accent" size={42} />
            <p className="text-xs font-semibold tracking-widest text-accent">MISSION COMPLETE</p>
            <h2 className="mt-3 text-2xl font-bold">クリア！おめでとう！</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {stage === 2 ? '情報の体験を完了しました！' : 'コードが正しく実行されました。'}
            </p>
            <button
              onClick={stage === 2 ? reset : next}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground"
            >
              {stage === 2 ? 'もう一度挑戦する' : '次のステージへ進む'} <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}

      <footer className="mx-auto flex max-w-7xl justify-between px-6 pb-6 text-[10px] tracking-wider text-muted-foreground">
        <span>徳山高専 / MONOZUKURI APTITUDE DIAGNOSIS</span>
        <span>BUILD YOUR LOGIC, MOVE YOUR WORLD.</span>
      </footer>
    </main>
  )
}
