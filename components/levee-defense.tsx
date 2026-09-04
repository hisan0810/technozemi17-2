'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, CloudRain, Hammer, RotateCcw, ShieldCheck, Waves } from 'lucide-react'

type Material = 'soil' | 'concrete'
type Mode = 'build' | 'rain' | 'failed' | 'won'
type Block = { material: Material; hp: number }
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string }

const W = 900
const H = 520
const INITIAL_WATER_Y = 379
const WATER_X = 0
const WATER_W = 225
const GRID_X = WATER_W + 18
const TOWN_X = 585
const GROUND_Y = 364
const CELL_W = 70
const CELL_H = 38
const COLS = 3
const ROWS = 4
const GRID_Y = GROUND_Y - ROWS * CELL_H
const MAX_BUDGET = 100
const PEAK_WATER = 242
const blocksCount = COLS * ROWS
const price = { soil: 3, concrete: 8 }

export default function LeveeDefense({
  standalone = false,
  onComplete,
}: {
  standalone?: boolean
  onComplete?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const blocksRef = useRef<(Block | null)[]>(Array(blocksCount).fill(null))
  const frameRef = useRef<number | null>(null)
  const rainStartRef = useRef(0)
  const outcomeRef = useRef<Mode>('build')
  const particlesRef = useRef<Particle[]>([])
  const collapseRef = useRef<number[]>([])
  const floodProgressRef = useRef(0)
  const completedRef = useRef(false)
  const [material, setMaterial] = useState<Material>('soil')
  const [mode, setMode] = useState<Mode>('build')
  const [elapsed, setElapsed] = useState(0)
  const [budget, setBudget] = useState(0)
  const [toast, setToast] = useState('')

  const stats = useCallback(() => {
    const blocks = blocksRef.current.filter(Boolean) as Block[]
    const soil = blocks.filter((b) => b.material === 'soil').length
    const occupiedRows = Array.from({ length: ROWS }, (_, row) => blocksRef.current.slice(row * COLS, (row + 1) * COLS).some(Boolean))
    const height = occupiedRows.reduce((max, occupied, row) => (occupied ? Math.max(max, row + 1) : max), 0)
    const completeRows = height > 0 && Array.from({ length: height }, (_, row) => blocksRef.current.slice(row * COLS, (row + 1) * COLS).every(Boolean)).every(Boolean)
    const strength = blocks.reduce((sum, b) => sum + (b.material === 'concrete' ? 13 : 6), 0)
    return { blocks, soil, height, completeRows, strength, soilRatio: blocks.length ? soil / blocks.length : 0 }
  }, [])

  const reset = useCallback(() => {
    blocksRef.current = Array(blocksCount).fill(null)
    particlesRef.current = []
    collapseRef.current = []
    floodProgressRef.current = 0
    completedRef.current = false
    outcomeRef.current = 'build'
    setMode('build'); setElapsed(0); setBudget(0); setToast('')
  }, [])

  const place = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== 'build') return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * W
    const y = ((event.clientY - rect.top) / rect.height) * H
    const col = Math.floor((x - GRID_X) / CELL_W)
    const row = Math.floor((GROUND_Y - y) / CELL_H)
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return
    const index = row * COLS + col
    if (blocksRef.current[index]) return
    if (row > 0 && !blocksRef.current[(row - 1) * COLS + col]) {
      setToast('下のマスから順に積み上げてください。')
      window.setTimeout(() => setToast(''), 1800)
      return
    }
    if (budget + price[material] > MAX_BUDGET) {
      setToast('予算オーバーです！')
      window.setTimeout(() => setToast(''), 1800)
      return
    }
    blocksRef.current[index] = { material, hp: material === 'concrete' ? 5 : 2 }
    setBudget((value) => value + price[material])
  }, [budget, material, mode])

  const startRain = useCallback(() => {
    if (mode !== 'build' || budget > MAX_BUDGET || !blocksRef.current.some(Boolean)) return
    rainStartRef.current = performance.now()
    floodProgressRef.current = 0
    outcomeRef.current = 'rain'
    setMode('rain'); setToast('')
  }, [budget, mode])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const draw = (now: number) => {
      const current = outcomeRef.current
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#d8c9a7'; ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#dff0d8'; ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#78b9c7'; ctx.fillRect(WATER_X, INITIAL_WATER_Y, WATER_W, H - INITIAL_WATER_Y)
      ctx.fillStyle = '#5ca1b2'; ctx.fillRect(WATER_X, INITIAL_WATER_Y + 42, WATER_W, H - INITIAL_WATER_Y - 42)
      ctx.strokeStyle = '#537155'; ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(WATER_W, GROUND_Y); ctx.lineTo(W, GROUND_Y); ctx.stroke()
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2
      for (let i = 0; i < 4; i++) { const y = GROUND_Y + 24 + i * 28; ctx.beginPath(); ctx.moveTo(18, y); ctx.quadraticCurveTo(92, y - 10 + Math.sin(now / 480 + i) * 4, WATER_W - 18, y); ctx.stroke() }
      ctx.fillStyle = '#537155'; ctx.fillRect(GRID_X, GROUND_Y - 8, W - GRID_X, 8)
      ctx.fillStyle = '#304f59'; ctx.font = '700 13px sans-serif'; ctx.fillText('川・海', 26, GROUND_Y - 18); ctx.fillText('暮らしのある町', 686, GROUND_Y - 18)
      ctx.fillStyle = '#f4ead7'; ctx.fillRect(TOWN_X + 18, 202, 145, 80); ctx.fillStyle = '#c8755d'; ctx.fillRect(TOWN_X + 37, 220, 38, 62); ctx.fillRect(TOWN_X + 95, 213, 43, 69); ctx.fillStyle = '#fff3c8'; ctx.fillRect(TOWN_X + 46, 231, 12, 15); ctx.fillRect(TOWN_X + 104, 223, 14, 17)
      ctx.fillStyle = '#e9eef0'; ctx.fillRect(TOWN_X + 201, 188, 70, 94); ctx.fillStyle = '#d9a44b'; ctx.fillRect(TOWN_X + 212, 199, 48, 30); ctx.fillStyle = '#496b58'; ctx.font = '700 11px "Noto Sans JP", sans-serif'; ctx.fillText('学校', 809, 217)
      ctx.fillStyle = '#304f59'; ctx.font = '21px sans-serif'; ctx.fillText(current === 'failed' ? '☹  ☹  ☹' : current === 'won' ? '↑  ↑  ↑' : '•  •  •', 642, 322)
      ctx.strokeStyle = '#d79b3b'; ctx.setLineDash([7, 5]); ctx.strokeRect(GRID_X - 6, GRID_Y - 6, COLS * CELL_W + 12, ROWS * CELL_H + 6); ctx.setLineDash([])
      ctx.fillStyle = '#856a45'; ctx.font = '700 12px sans-serif'; ctx.fillText('ここに堤防をつくる', GRID_X, GRID_Y - 14)
      for (let row = 0; row < ROWS; row++) for (let col = 0; col < COLS; col++) { const b = blocksRef.current[row * COLS + col]; const x = GRID_X + col * CELL_W; const y = GROUND_Y - (row + 1) * CELL_H; ctx.strokeStyle = 'rgba(115,96,65,.35)'; ctx.strokeRect(x, y, CELL_W, CELL_H); if (b) { ctx.fillStyle = b.material === 'concrete' ? '#667984' : '#a47943'; ctx.fillRect(x, y, CELL_W, CELL_H); ctx.fillStyle = b.material === 'concrete' ? '#b8c4c9' : '#c59654'; ctx.fillRect(x + 8, y + 8, 8, 6) } }
      if (current === 'rain' || current === 'failed' || current === 'won') {
        const rainMs = now - rainStartRef.current
        const targetWaterLevel = GROUND_Y - 110
        const waterY = current === 'won' ? INITIAL_WATER_Y : INITIAL_WATER_Y - Math.min(1, rainMs / 4000) * (INITIAL_WATER_Y - targetWaterLevel)
        const water = H - waterY
        const reachesGround = waterY <= GROUND_Y
        ctx.fillStyle = 'rgba(35,79,103,.84)'; ctx.fillRect(WATER_X, waterY, WATER_W, H - waterY)
        const leveeBlocks = blocksRef.current.filter(Boolean).length
        const leveeHeight = leveeBlocks ? Math.max(CELL_H, Math.min(ROWS * CELL_H, Math.ceil(leveeBlocks / COLS) * CELL_H)) : 0
        const overtops = reachesGround && leveeHeight < water
        if (current === 'failed') floodProgressRef.current = Math.min(W - 200, floodProgressRef.current + 8)
        if (current === 'failed' && floodProgressRef.current > 0) { const floodX = 200; const floodWidth = floodProgressRef.current; const waterHeight = Math.min(110, Math.max(12, GROUND_Y - waterY)); ctx.fillStyle = 'rgba(35,79,103,.72)'; ctx.fillRect(floodX, GROUND_Y - waterHeight, floodWidth, waterHeight) }
        if (reachesGround && overtops) { const waterHeight = Math.min(110, Math.max(12, GROUND_Y - waterY)); ctx.fillStyle = 'rgba(35,79,103,.42)'; ctx.fillRect(GRID_X, GROUND_Y - waterHeight, W - GRID_X, waterHeight) }
        ctx.strokeStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 70; i++) { const x = (i * 97 + now / 8) % W; const y = (i * 43 + now / 4) % 300; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 13); ctx.stroke() }
        if (current === 'won' && particlesRef.current.length < 100) for (let i = 0; i < 20; i++) particlesRef.current.push({ x: 580 + Math.random() * 260, y: 180, vx: Math.random() * 4 - 2, vy: Math.random() * 3 + 1, life: 1, color: ['#d99336', '#245a68', '#a94d47'][i % 3] })
        if (current === 'failed' && water >= PEAK_WATER) ctx.fillStyle = 'rgba(35,79,103,.38)'
      }
      particlesRef.current.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += .04; p.life -= .012; ctx.fillStyle = p.color; ctx.globalAlpha = p.life; ctx.fillRect(p.x, p.y, 5, 5); ctx.globalAlpha = 1 })
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0)
      if (current === 'rain') {
        const seconds = Math.floor((now - rainStartRef.current) / 1000); setElapsed(seconds)
        const s = stats(); const low = s.height <= 2; const thin = !s.completeRows; const soilFail = s.soilRatio >= .6
        const targetWaterLevel = GROUND_Y - 110
        const waterReachedGround = INITIAL_WATER_Y - Math.min(1, (now - rainStartRef.current) / 4000) * (INITIAL_WATER_Y - targetWaterLevel) <= GROUND_Y
        if (waterReachedGround && !collapseRef.current.length) {
          if (soilFail) { blocksRef.current = Array(blocksCount).fill(null); outcomeRef.current = 'failed'; setMode('failed'); setToast('失敗！土砂が多すぎて堤防が崩れました。') }
          else if (low) { outcomeRef.current = 'failed'; setMode('failed'); setToast('失敗！堤防が低すぎて水が溢れました。') }
          else if (thin) { blocksRef.current = Array(blocksCount).fill(null); outcomeRef.current = 'failed'; setMode('failed'); setToast('失敗！堤防の厚みが足りず崩れました。') }
          else { outcomeRef.current = 'won'; setMode('won'); setToast('大成功！頑丈な堤防で街を守りきりました！') }
        }
      }
      frameRef.current = requestAnimationFrame(draw)
    }
    frameRef.current = requestAnimationFrame(draw)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [stats])

  // 成功したら少し余韻を見せてからクイズへ合流する。
  useEffect(() => {
    if (mode !== 'won' || completedRef.current) return
    completedRef.current = true
    if (standalone) return
    const timer = setTimeout(() => onComplete?.(), 2400)
    return () => clearTimeout(timer)
  }, [mode, standalone, onComplete])

  const s = stats()
  const label = mode === 'build' ? '建設準備中' : mode === 'rain' ? '大雨が接近中' : mode === 'won' ? '防衛成功' : '堤防が決壊'
  return (
    <div className="levee-app">
      <header className="levee-header">
        <div className="levee-brand"><span className="brand-mark"><Waves size={19} /></span><div><strong>洪水から街を守れ！</strong><small>LEVEE DEFENSE / FIELD 01</small></div></div>
        <button className="reset-link" onClick={reset}><RotateCcw size={15} /> 最初から</button>
      </header>
      <div className="levee-shell">
        <section className="levee-intro">
          <div>
            <p className="eyebrow">HANDS-ON DISASTER PREVENTION LAB</p>
            <h1>水のちからを、<br /><em>堤防で受け止めろ。</em></h1>
            <p>材料を選び、建設ゾーンをクリックして配置します。<br />押し寄せる大雨から、川沿いの町を守り抜こう。</p>
          </div>
          <div className="goal-card"><ShieldCheck size={22} /><span>MISSION</span><strong>あふれる前に町を守る</strong></div>
        </section>
        <div className="sim-grid">
          <aside className="control-panel">
            <div className="panel-title"><Hammer size={18} /><span>建設コントロール</span></div>
            <div className="status-box"><span>STATUS</span><strong className={mode}>{label}</strong><small>{mode === 'rain' ? `${elapsed} 秒経過` : '建設ゾーンに配置してください'}</small></div>
            <p className="control-label">材料を選ぶ</p>
            <button className={`material ${material === 'soil' ? 'selected' : ''}`} onClick={() => setMaterial('soil')}><span className="material-swatch soil" /><span><b>土砂パーツ</b><small>安価 / 強度 +6</small></span><strong>¥3</strong></button>
            <button className={`material ${material === 'concrete' ? 'selected' : ''}`} onClick={() => setMaterial('concrete')}><span className="material-swatch concrete" /><span><b>コンクリート</b><small>頑丈 / 強度 +13</small></span><strong>¥8</strong></button>
            <div className="readouts"><div><small>予算</small><b className={toast === '予算オーバーです！' ? 'danger-text' : ''}>¥{budget} <i>/ ¥100</i></b></div><div><small>堤防の強度</small><b>{s.strength} <i>/ 50</i></b></div></div>
            <div className="meter"><span style={{ width: `${Math.min(100, s.strength * 2)}%` }} /></div>
            {toast === '予算オーバーです！' && <p className="budget-toast">{toast}</p>}
            <button className="rain-button" disabled={mode !== 'build' || budget > MAX_BUDGET || !s.blocks.length} onClick={startRain}><CloudRain size={17} /> 大雨スタート</button>
            <button className="clear-button" disabled={mode !== 'build'} onClick={reset}>堤防をリセット</button>
          </aside>
          <section className="stage-panel">
            <div className="stage-toolbar"><span><Waves size={15} /> CROSS-SECTION / SIDE VIEW</span><small>左：水の流れ　｜　中央：建設ゾーン　｜　右：町</small></div>
            <canvas ref={canvasRef} width={W} height={H} onPointerDown={place} aria-label="川と町の断面図。中央の建設ゾーンをクリックして堤防を作ります。" />
            <div className="stage-note"><span>TIP</span> コンクリートを混ぜると、堤防が崩れにくくなります。</div>
            {toast && toast !== '予算オーバーです！' && (
              <div className={`result ${mode === 'failed' ? 'failure' : ''}`}>
                {mode === 'failed' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                <div><strong>{toast}</strong><span>{mode === 'failed' ? 'リセットして、設計を見直してみよう。' : standalone ? '町のみんなが喜んでいます。' : 'このあと、まなびのクイズに進みます。'}</span></div>
                <button onClick={reset}>もう一度</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
