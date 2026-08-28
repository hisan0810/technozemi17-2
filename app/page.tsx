'use client'

import { useMemo, useState } from 'react'

type Field = '機械' | '情報' | '電気電子' | '土木' | '建築'
type Step = 0 | 1 | 2 | 3 | 4

const fields: { name: Field; note: string; topics: string[]; mark: string }[] = [
  { name: '機械', note: '動く仕組みを設計する', topics: ['ホバークラフト', 'ゴム動力ミニカー'], mark: '01' },
  { name: '情報', note: 'コードで世界を動かす', topics: ['マリオを5歩歩かせよう', 'マリオをジャンプさせよう'], mark: '02' },
  { name: '電気電子', note: '回路から未来をつくる', topics: ['スイッチで電気をつける'], mark: '03' },
  { name: '土木', note: '強く、美しい構造をつくる', topics: ['パスタブリッジ', 'ミニ地盤モデル'], mark: '04' },
  { name: '建築', note: '暮らしの空間を描く', topics: ['夢のマイハウス', 'ジオデシック・ドーム', 'シェードランプ'], mark: '05' },
]

const quiz = [
  { q: 'ホバークラフトが浮く理由に近いものは？', options: ['空気のクッションで摩擦を減らす', '重さがゼロになる', '磁石が反発する'], answer: 0 },
  { q: '歯車の組み合わせで変えられるものは？', options: ['回転の速さや力', '電気の色', '材料の温度'], answer: 0 },
  { q: 'プログラムで「もし〜なら」を表す考え方は？', options: ['条件分岐', '摩擦', '浮力'], answer: 0 },
]

const jobs: Record<Field, string[]> = {
  機械: ['機械設計エンジニア', 'ロボット開発者', '自動車技術者'], 情報: ['ソフトウェアエンジニア', 'ゲームプログラマー', 'AIエンジニア'],
  電気電子: ['電気主任技術者', '組込みエンジニア', '通信技術者'], 土木: ['土木設計技術者', '建設プロジェクト管理', '環境エンジニア'], 建築: ['建築家', '構造設計者', 'まちづくりプランナー'],
}

export default function Page() {
  const [step, setStep] = useState<Step>(0)
  const [field, setField] = useState<Field | null>(null)
  const [topic, setTopic] = useState('')
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const [route, setRoute] = useState('')
  const [job, setJob] = useState('')
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [started, setStarted] = useState(false)
  const [result, setResult] = useState(false)

  const selected = field ? fields.find((item) => item.name === field) : null
  const score = useMemo(() => Object.values(answers).filter((a) => a === 'はい').length, [answers])
  const go = (next: Step) => { setStep(next); setStarted(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const reset = () => { setStep(0); setField(null); setTopic(''); setQuizAnswer(null); setRoute(''); setJob(''); setAnswers({}); setStarted(false); setResult(false) }

  if (result) return <Result field={field ?? '情報'} topic={topic} job={job} score={score} onReset={reset} />

  return (
    <main className="app-shell">
      <header className="topbar"><div className="brand"><span className="brand-symbol">TK</span><span><b>TECH QUEST</b><small>徳山高専 ものづくり適性診断</small></span></div><button className="reset-link" onClick={reset}>最初からやり直す</button></header>
      <div className="progress-wrap"><div className="progress-line"><span style={{ width: `${step / 4 * 100}%` }} /></div><div className="step-labels">{['エントリー', '体験を選ぶ', '深掘りする', '適性を診断', '結果を見る'].map((label, i) => <span key={label} className={step >= i ? 'active' : ''}><i>{String(i + 1).padStart(2, '0')}</i>{label}</span>)}</div></div>
      <section className="hero"><div><p className="eyebrow">DISCOVER YOUR ENGINEERING PATH</p><h1>未来をつくる、<br /><em>最初の一歩。</em></h1><p className="hero-copy">つくって、考えて、試してみる。<br />あなたの「好き」から、向いている学科を見つけよう。</p></div><div className="hero-stamp">約 5 分で<br /><strong>診断</strong></div></section>
      <section className="workspace">
        {!started && <div className="intro-note"><span>●</span> 正解よりも、選ぶ気持ちと試す姿勢を大切にしています。</div>}
        {step === 0 && <FieldStep field={field} topic={topic} setField={setField} setTopic={setTopic} onNext={() => go(1)} />}
        {step === 1 && <QuizStep field={field!} topic={topic} answer={quizAnswer} setAnswer={setQuizAnswer} onNext={() => go(2)} />}
        {step === 2 && <RouteStep route={route} setRoute={setRoute} field={field!} job={job} setJob={setJob} onNext={() => go(3)} />}
        {step === 3 && <SurveyStep answers={answers} setAnswers={setAnswers} onNext={() => { setResult(true) }} />}
      </section>
      <footer><span>TECH QUEST / TOKUYAMA COLLEGE OF TECHNOLOGY</span><span>あなたの可能性を、技術に。</span></footer>
    </main>
  )
}

function FieldStep({ field, topic, setField, setTopic, onNext }: any) { const selected = field ? fields.find((item) => item.name === field) : null; return <div className="step-card"><div className="step-heading"><span className="section-kicker">01 / ENTRY</span><h2>何をつくってみたい？</h2><p>直感で選んでみよう。迷ったら、気になる言葉から。</p></div><div className="field-grid">{fields.map((item) => <button key={item.name} className={`field-tile ${field === item.name ? 'selected' : ''}`} onClick={() => { setField(item.name); setTopic('') }}><span className="tile-mark">{item.mark}</span><strong>{item.name}</strong><small>{item.note}</small><span className="tile-arrow">→</span></button>)}</div>{field && <div className="topic-panel"><p>具体的に、どちらを試したい？</p><div className="topic-options">{selected?.topics.map((t) => <button key={t} className={topic === t ? 'chosen' : ''} onClick={() => setTopic(t)}>{t}<span>↗</span></button>)}</div></div>}<button className="primary-action" disabled={!field || !topic} onClick={onNext}>体験をはじめる <span>→</span></button></div> }

function QuizStep({ field, topic, answer, setAnswer, onNext }: any) { const item = quiz[fields.findIndex((f) => f.name === field) % quiz.length]; return <div className="step-card"><div className="step-heading"><span className="section-kicker">02 / CONNECT</span><h2>体験を、学びにつなげる。</h2><p><b>{field}</b>「{topic}」に関連する、社会と理科のクイズです。</p></div><div className="quiz-box"><div className="quiz-number">QUESTION <b>01</b></div><h3>{item.q}</h3><div className="quiz-options">{item.options.map((o, i) => <button key={o} className={answer === i ? 'chosen' : ''} onClick={() => setAnswer(i)}><span>{String.fromCharCode(65 + i)}</span>{o}</button>)}</div></div><button className="primary-action" disabled={answer === null} onClick={onNext}>次へ進む <span>→</span></button></div> }

function RouteStep({ route, setRoute, field, job, setJob, onNext }: any) { return <div className="step-card"><div className="step-heading"><span className="section-kicker">03 / GO FURTHER</span><h2>次は、どこへ進む？</h2><p>あなたの「もっと知りたい」を教えてください。</p></div><div className="route-list">{[['another', '他の作品もつくってみたい', '別の分野にも触れて、視野を広げる'], ['advanced', 'さらに応用したものをつくりたい', '難しい課題に挑戦してみる'], ['job', '技術を使う職業を知りたい', '学んだ先の未来をのぞいてみる']].map(([value, title, desc]) => <button key={value} className={`route-row ${route === value ? 'selected' : ''}`} onClick={() => { setRoute(value); if (value !== 'job') setJob('') }}><span className="route-radio" /><span><b>{title}</b><small>{desc}</small></span><span className="route-arrow">→</span></button>)}</div>{route === 'job' && <div className="job-panel"><p>気になる職業をひとつ選んでください</p>{jobs[field].map((j) => <button key={j} className={job === j ? 'chosen' : ''} onClick={() => setJob(j)}>{j}</button>)}</div>}<button className="primary-action" disabled={!route || (route === 'job' && !job)} onClick={onNext}>適性アンケートへ <span>→</span></button></div> }

function SurveyStep({ answers, setAnswers, onNext }: any) { const questions = ['どの内容が楽しかったですか？', 'もっと専門的に学びたいですか？', 'ものづくりに興味が湧きましたか？', '実験・プログラミング、工作教室は楽しかったですか？', '授業を積極的に受けていますか？', '家などで積極的に自習していますか？', '数学か理科に苦手意識がありますか？']; return <div className="step-card"><div className="step-heading"><span className="section-kicker">04 / SELF CHECK</span><h2>あなたの今を、教えてください。</h2><p>答えに正解はありません。素直な気持ちで選んでください。</p></div><div className="survey-list">{questions.map((q, i) => <div className="survey-row" key={q}><span className="survey-index">{String(i + 1).padStart(2, '0')}</span><b>{q}</b><div className="answer-buttons">{(i === 0 ? ['機械', '情報', '電気回路', '土木', '建築'] : i === 6 ? ['はい', 'いいえ', 'どちらでもない'] : ['はい', 'いいえ']).map((a) => <button key={a} className={answers[i] === a ? 'chosen' : ''} onClick={() => setAnswers({ ...answers, [i]: a })}>{a}</button>)}</div></div>)}</div><button className="primary-action" disabled={Object.keys(answers).length < 7} onClick={onNext}>診断結果を見る <span>→</span></button></div> }

function Result({ field, topic, job, score, onReset }: any) { const scores = [Math.min(98, 64 + score * 5), Math.min(95, 58 + score * 6), Math.min(96, 62 + score * 4), Math.min(99, 70 + score * 4)]; const labels = ['数学・理科の基礎', 'コミュニケーション', '勉学・課外活動への意欲', 'ものづくり・社会貢献']; return <main className="app-shell result-page"><header className="topbar"><div className="brand"><span className="brand-symbol">TK</span><span><b>TECH QUEST</b><small>徳山高専 ものづくり適性診断</small></span></div><button className="reset-link" onClick={onReset}>もう一度診断する</button></header><section className="result-hero"><p className="eyebrow">YOUR ENGINEERING PROFILE</p><h1>あなたの未来は、<br /><em>{field}からはじまる。</em></h1><p>「{topic}」への挑戦から見えてきた、あなたの適性です。</p></section><section className="result-grid"><div className="major-card"><span className="section-kicker">RECOMMENDED DEPARTMENT</span><div className="major-number">{fields.find((f) => f.name === field)?.mark}</div><h2>{field}<small>学科</small></h2><p>仕組みを考え、手を動かして形にする。あなたの好奇心は、{field}の世界で大きく育ちそうです。</p>{job && <div className="job-result">興味を持った職業 <b>{job}</b></div>}</div><div className="ap-card"><span className="section-kicker">TOKUYAMA KOSEN / AP SCORE</span><h3>高専に最適です。</h3><p>あなたの選択と回答から算出した適性度</p>{scores.map((s, i) => <div className="score-row" key={labels[i]}><span>{labels[i]}</span><div><i style={{ width: `${s}%` }} /></div><b>{s}</b></div>)}</div></section><button className="primary-action result-button" onClick={onReset}>もう一度、未来を探す <span>↗</span></button><footer><span>TECH QUEST / TOKUYAMA COLLEGE OF TECHNOLOGY</span><span>あなたの可能性を、技術に。</span></footer></main> }
