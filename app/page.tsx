'use client'

import { useMemo, useState } from 'react'

type Field = '機械' | '情報' | '電気電子' | '土木' | '建築'
type Step = 0 | 1 | 2 | 3 | 4
type RouteView = 'choices' | 'repeat' | 'advanced' | 'jobs'

type AdvancedProject = { name: string; description: string; quiz: { q: string; options: string[]; answer: number } }

const advancedProjects: Record<Field, AdvancedProject[]> = {
  機械: [
    { name: '水圧ロボットアーム', description: '水圧で動くアームを設計し、力の伝わり方を試す。', quiz: { q: '水圧で力を伝える原理は？', options: ['パスカルの原理', 'オームの法則', '反射の法則'], answer: 0 } },
    { name: 'リンク機構歩行ロボット', description: 'リンクの組み合わせで歩く動きをつくる。', quiz: { q: 'リンク機構で動きを生み出す考え方は？', options: ['部品同士の連動', '温度の変化', '光の屈折'], answer: 0 } },
  ],
  情報: [{ name: 'マリオのゲームプログラミング', description: '歩く、ジャンプする、風船を割るゲームをつくる。', quiz: { q: '風船を割ったときに得点を増やす処理は？', options: ['イベント処理', '電圧変換', '地盤改良'], answer: 0 } }],
  土木: [
    { name: 'ダ・ヴィンチの橋', description: '釘や接着剤を使わず、部材の組み合わせで橋をつくる。', quiz: { q: '橋が崩れにくい理由は？', options: ['部材同士が支え合う', '水を吸収する', '電流が流れる'], answer: 0 } },
    { name: '砂ろ過システム', description: '砂の層を重ねて、水をきれいにする仕組みを考える。', quiz: { q: '砂ろ過で粒を取り除く働きは？', options: ['ろ材のすき間で捕捉する', '水を加熱する', '電気を発生させる'], answer: 0 } },
  ],
  電気電子: [{ name: 'センサー付きスマートライト', description: 'センサーとLEDを組み合わせた回路をつくる。', quiz: { q: '明るさを検知する部品は？', options: ['光センサー', '歯車', '梁'], answer: 0 } }],
  建築: [{ name: '環境配慮型スマートハウス', description: '採光・通風・省エネを組み合わせた住まいを設計する。', quiz: { q: '設計で大切な視点は？', options: ['環境と快適性の両立', '柱をなくすこと', '窓をすべて閉じること'], answer: 0 } }],
}

const careerDetails: Record<Field, { name: string; description: string }[]> = {
  機械: [{ name: 'ロボットエンジニア', description: '人を助けるロボットを開発する。' }, { name: '自動車技術者', description: '安全で環境に配慮した移動をつくる。' }, { name: '機械設計エンジニア', description: '製品の構造を考え、形にする。' }],
  情報: [{ name: 'ソフトウェアエンジニア', description: 'コードでサービスや生活を支える。' }, { name: 'データサイエンティスト', description: 'データ分析で社会課題を解決する。' }, { name: 'AIエンジニア', description: '人工知能で新しい価値を生み出す。' }],
  電気電子: [{ name: '組込みエンジニア', description: '機器の中で動く制御システムを開発する。' }, { name: '通信技術者', description: '人と情報をつなぐ通信を支える。' }, { name: '電力エンジニア', description: '安定した電気を届ける仕組みを設計する。' }],
  土木: [{ name: 'インフラエンジニア', description: '道路・橋・上下水道など暮らしの基盤を守る。' }, { name: '環境エンジニア', description: '水や土の環境を守る。' }, { name: '土木設計技術者', description: '災害に強い構造物を計画する。' }],
  建築: [{ name: '建築家', description: '暮らしと地域の未来を空間として描く。' }, { name: '構造設計者', description: '建物の安全性を計算する。' }, { name: 'まちづくりプランナー', description: '暮らしやすいまちを計画する。' }],
}

const fields: { name: Field; note: string; topics: { name: string; quiz: { q: string; options: string[]; answer: number } }[]; mark: string; advanced: string }[] = [
  {
    name: '機械',
    note: '動く仕組みを設計する',
    topics: [
      { name: 'ホバークラフト', quiz: { q: 'ホバークラフトが浮くのは、空気の「（　）」を高めているからです。', options: ['圧力', '温度', '速度'], answer: 0 } },
      { name: 'ゴム動力ミニカー', quiz: { q: '大きな歯車と小さな歯車の回転数の関係を表す「歯車比」は、数学のどの単元に関係しますか？', options: ['比例・反比例', '確率', '関数'], answer: 0 } },
    ],
    mark: '01',
    advanced: '水圧ロボットアーム',
  },
  {
    name: '情報',
    note: 'コードで世界を動かす',
    topics: [
      { name: 'マリオを5歩歩かせよう', quiz: { q: 'マリオを5歩歩かせるには、同じ動作を5回「（　）」することが重要です。', options: ['繰り返す', '変える', '待つ'], answer: 0 } },
      { name: 'マリオをジャンプさせよう', quiz: { q: 'プログラムで「もしジャンプキーが押されたら、上に移動する」という考え方は？', options: ['条件分岐', '繰り返し', '関数'], answer: 0 } },
    ],
    mark: '02',
    advanced: 'ゲーム画面設計',
  },
  {
    name: '電気電子',
    note: '回路から未来をつくる',
    topics: [
      { name: 'スイッチで電気をつける', quiz: { q: '回路に流れる電流と電圧の関係を表す法則は？', options: ['オームの法則', '万有引力の法則', '浮力の法則'], answer: 0 } },
    ],
    mark: '03',
    advanced: 'LED制御回路',
  },
  {
    name: '土木',
    note: '強く、美しい構造をつくる',
    topics: [
      { name: 'パスタブリッジ', quiz: { q: '橋に上から力がかかるとき、下向きの力とつり合う上向きの力はなんと呼ばれますか？', options: ['反力', '摩擦力', 'ジュール熱'], answer: 0 } },
      { name: 'ミニ地盤モデル', quiz: { q: '地盤の強さを決める主な要因は、土の「（　）」と「含水量」です。', options: ['密度', '色', '温度'], answer: 0 } },
    ],
    mark: '04',
    advanced: '建造物耐震設計',
  },
  {
    name: '建築',
    note: '暮らしの空間を描く',
    topics: [
      { name: '夢のマイハウス', quiz: { q: '快適な家を設計するには、採光と通風を考えることが大切です。これは何に関係しますか？', options: ['環境設計', '力学', '化学変化'], answer: 0 } },
      { name: 'ジオデシック・ドーム', quiz: { q: 'ドーム型構造は、なぜ安定しているのでしょう？', options: ['形全体で荷重を分散', '材料が特殊', '重さがない'], answer: 0 } },
      { name: 'シェードランプ', quiz: { q: 'ランプのデザインで最も大切な機能は？', options: ['光の広がり方', '色の美しさ', '材料の価格'], answer: 0 } },
      { name: 'ミニコンクリート', quiz: { q: 'コンクリートの強度は、「セメント」「砂」「石」の混合比で変わります。これは何の学習に近いですか？', options: ['化学反応', '物理変化', 'エネルギー'], answer: 0 } },
      { name: '紙の高層ビル', quiz: { q: '紙でビルを建てるとき、最も工夫が必要な部分は？', options: ['柱の設計（構造）', '壁の色', '窓の配置'], answer: 0 } },
      { name: '暑くならない家', quiz: { q: '夏に家を涼しく保つための重要な工夫は？', options: ['通風と遮光', 'ペンキの色', '家の大きさ'], answer: 0 } },
    ],
    mark: '05',
    advanced: 'スマートビル設計',
  },
]

const jobs: Record<Field, string[]> = {
  機械: ['機械設計エンジニア', 'ロボット開発者', '自動車技術者'],
  情報: ['ソフトウェアエンジニア', 'ゲームプログラマー', 'AIエンジニア'],
  電気電子: ['電気主任技術者', '組込みエンジニア', '通信技術者'],
  土木: ['土木設計技術者', '建設プロジェクト管理', '環境エンジニア'],
  建築: ['建築家', '構造設計者', 'まちづくりプランナー'],
}

export default function Page() {
  const [step, setStep] = useState<Step>(0)
  const [field, setField] = useState<Field | null>(null)
  const [topic, setTopic] = useState('')
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const [quizCorrect, setQuizCorrect] = useState(false)
  const [route, setRoute] = useState('')
  const [routeView, setRouteView] = useState<RouteView>('choices')
  const [advancedProject, setAdvancedProject] = useState(0)
  const [advancedAnswer, setAdvancedAnswer] = useState<number | null>(null)
  const [job, setJob] = useState('')
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [started, setStarted] = useState(false)
  const [result, setResult] = useState(false)
  const [score, setScore] = useState(0)
  const [userSelected, setUserSelected] = useState(false)
  const [buildingComplete, setBuildingComplete] = useState(false)

  const selected = field ? fields.find((item) => item.name === field) : null
  const selectedTopic = selected?.topics.find((t) => t.name === topic)
  const surveyScore = useMemo(() => Object.values(answers).filter((a) => a === 'はい').length, [answers])

  const go = (next: Step) => {
    setStep(next)
    setStarted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => {
    setStep(0)
    setField(null)
    setTopic('')
    setQuizAnswer(null)
    setQuizCorrect(false)
    setRoute('')
    setRouteView('choices')
    setAdvancedProject(0)
    setAdvancedAnswer(null)
    setJob('')
    setAnswers({})
    setStarted(false)
    setResult(false)
    setScore(0)
    setUserSelected(false)
    setBuildingComplete(false)
  }

  const handleFieldSelect = (fieldName: Field) => {
    setField(fieldName)
    setTopic('')
  }

  const handleTopicSelect = (topicName: string) => {
    setTopic(topicName)
    setUserSelected(true)
  }

  const handleRandomSelect = () => {
    const allTopics = fields.flatMap((f) => f.topics.map((t) => ({ field: f.name, topic: t.name })))
    const random = allTopics[Math.floor(Math.random() * allTopics.length)]
    setField(random.field as Field)
    setTopic(random.topic)
    setUserSelected(false)
    setScore(score)
    setTimeout(() => go(1), 600)
  }

  const handleQuizSubmit = () => {
    if (quizAnswer === null) return
    const correct = quizAnswer === selectedTopic?.quiz.answer
    setQuizCorrect(correct)
    if (routeView === 'repeat') setRouteView('choices')
    if (correct) {
      setScore(score + 10)
    }
    setTimeout(() => go(2), 1500)
  }

  const handleRouteSelect = (routeValue: string) => {
    setRoute(routeValue)
    if (routeValue === 'another') {
      setScore((value) => value + 10)
      setRouteView('repeat')
    } else if (routeValue === 'advanced') {
      setAdvancedProject(0)
      setAdvancedAnswer(null)
      setRouteView('advanced')
    } else {
      setJob('')
      setRouteView('jobs')
    }
  }

  const returnToRouteChoices = () => {
    setRouteView('choices')
    setAdvancedAnswer(null)
  }

  const startAnotherExperience = () => {
    setTopic('')
    setUserSelected(false)
    go(0)
  }

  if (result)
    return (
      <Result field={field ?? '情報'} topic={topic} job={job} score={score + surveyScore * 5} onReset={reset} />
    )

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-symbol">TK</span>
          <span>
            <b>TECH QUEST</b>
            <small>徳山高専 ものづくり適性診断</small>
          </span>
        </div>
        <button className="reset-link" onClick={reset}>
          最初からやり直す
        </button>
      </header>

      <div className="progress-wrap">
        <div className="progress-line">
          <span style={{ width: `${(step / 4) * 100}%` }} />
        </div>
        <div className="step-labels">
          {['エントリー', '体験を選ぶ', '深掘りする', '適性を診断', '結果を見る'].map((label, i) => (
            <span key={label} className={step >= i ? 'active' : ''}>
              <i>{String(i + 1).padStart(2, '0')}</i>
              {label}
            </span>
          ))}
        </div>
      </div>

      <section className="hero">
        <div>
          <p className="eyebrow">DISCOVER YOUR ENGINEERING PATH</p>
          <h1>
            未来をつくる、<br />
            <em>最初の一歩。</em>
          </h1>
          <p className="hero-copy">
            つくって、考えて、試してみる。<br />
            あなたの「好き」から、向いている学科を見つけよう。
          </p>
        </div>
        <div className="hero-stamp">
          約 5 分で
          <br />
          <strong>診断</strong>
        </div>
      </section>

      <section className="workspace">
        {!started && (
          <div className="intro-note">
            <span>●</span> 正解よりも、選ぶ気持ちと試す姿勢を大切にしています。
          </div>
        )}

        {step === 0 && (
          <FieldStep
            field={field}
            topic={topic}
            onFieldSelect={handleFieldSelect}
            onTopicSelect={handleTopicSelect}
            onRandomSelect={handleRandomSelect}
            onNext={() => {
              if (userSelected) setScore(score + 10)
              go(1)
            }}
          />
        )}

        {step === 1 && (
          <ExperienceQuizStep
            field={field!}
            topic={topic}
            buildingComplete={buildingComplete}
            setBuildingComplete={setBuildingComplete}
            answer={quizAnswer}
            setAnswer={setQuizAnswer}
            correct={quizCorrect}
            onNext={handleQuizSubmit}
          />
        )}

        {step === 2 && routeView === 'choices' && (
          <RouteStep field={field!} topic={topic} route={route} onRouteSelect={handleRouteSelect} job={job} setJob={setJob} onNext={() => go(3)} />
        )}
        {step === 2 && routeView === 'repeat' && <RepeatExperienceStep onBack={returnToRouteChoices} onStart={startAnotherExperience} />}
        {step === 2 && routeView === 'advanced' && <AdvancedStep field={field!} projectIndex={advancedProject} setProjectIndex={setAdvancedProject} answer={advancedAnswer} setAnswer={setAdvancedAnswer} onBack={returnToRouteChoices} onDone={returnToRouteChoices} />}
        {step === 2 && routeView === 'jobs' && <CareerStep field={field!} job={job} setJob={setJob} onBack={returnToRouteChoices} onNext={() => { setScore((value) => value + 10); go(3) }} />}

        {step === 3 && <SurveyStep answers={answers} setAnswers={setAnswers} onNext={() => setResult(true)} />}
      </section>

      <footer>
        <span>TECH QUEST / TOKUYAMA COLLEGE OF TECHNOLOGY</span>
        <span>あなたの可能性を、技術に。</span>
      </footer>
    </main>
  )
}

function FieldStep({ field, topic, onFieldSelect, onTopicSelect, onRandomSelect, onNext }: any) {
  const selected = field ? fields.find((item) => item.name === field) : null

  return (
    <div className="step-card">
      <div className="step-heading">
        <span className="section-kicker">01 / ENTRY</span>
        <h2>何をつくってみたい？</h2>
        <p>直感で選んでみよう。迷ったら、気になる言葉から。</p>
      </div>

      <div className="field-grid">
        {fields.map((item) => (
          <button
            key={item.name}
            className={`field-tile ${field === item.name ? 'selected' : ''}`}
            onClick={() => onFieldSelect(item.name)}
          >
            <span className="tile-mark">{item.mark}</span>
            <strong>{item.name}</strong>
            <small>{item.note}</small>
            <span className="tile-arrow">→</span>
          </button>
        ))}
      </div>

      {field && (
        <div className="topic-panel">
          <p>具体的に、どちらを試したい？</p>
          <div className="topic-options">
            {selected?.topics.map((t) => (
              <button
                key={t.name}
                className={topic === t.name ? 'chosen' : ''}
                onClick={() => onTopicSelect(t.name)}
              >
                {t.name}
                <span>↗</span>
              </button>
            ))}
          </div>
          <button className="random-btn" onClick={onRandomSelect}>
            迷ったら、おまかせで選ぶ
          </button>
        </div>
      )}

      <button className="primary-action" disabled={!field || !topic} onClick={onNext}>
        体験をはじめる <span>→</span>
      </button>
    </div>
  )
}

function ExperienceQuizStep({
  field,
  topic,
  buildingComplete,
  setBuildingComplete,
  answer,
  setAnswer,
  correct,
  onNext,
}: any) {
  const selected = fields.find((f) => f.name === field)
  const selectedTopic = selected?.topics.find((t) => t.name === topic)
  const quiz = selectedTopic?.quiz

  const handleBuild = () => {
    setBuildingComplete(false)
    setTimeout(() => setBuildingComplete(true), 2000)
  }

  return (
    <div className="step-card">
      <div className="step-heading">
        <span className="section-kicker">02 / EXPERIENCE + QUIZ</span>
        <h2>体験を、学びにつなげる。</h2>
        <p>
          <b>{field}</b>「{topic}」に関連する、社会と学びのクイズです。
        </p>
      </div>

      {!buildingComplete ? (
        <div className="experience-box">
          <div className="build-section">
            <h3>つくってみよう！</h3>
            <div className="build-animation">
              <div className="build-parts">
                <span>01</span>
                <span>02</span>
                <span>03</span>
              </div>
            </div>
            <button className="build-btn" onClick={handleBuild}>
              {topic} をつくる
            </button>
          </div>
        </div>
      ) : (
        <div className="quiz-box">
          <div className="completion-badge">✨ 完成！</div>
          <div className="quiz-number">
            QUESTION <b>01</b>
          </div>
          <h3>{quiz?.q}</h3>
          <div className="quiz-options">
            {quiz?.options.map((o: string, i: number) => (
              <button
                key={o}
                className={`quiz-option ${answer === i ? 'chosen' : ''} ${
                  answer !== null ? (i === quiz.answer ? 'correct' : i === answer ? 'incorrect' : '') : ''
                }`}
                onClick={() => answer === null && setAnswer(i)}
                disabled={answer !== null}
              >
                <span>{String.fromCharCode(65 + i)}</span>
                {o}
                {i === quiz.answer && answer !== null && <span className="check">✓</span>}
                {i === answer && answer !== quiz.answer && <span className="cross">✗</span>}
              </button>
            ))}
          </div>
          {answer !== null && (
            <div className={`quiz-feedback ${correct ? 'correct' : 'incorrect'}`}>
              {correct ? (
                <p>
                  <b>正解！</b> あなたの {field} への理解が深まりました。
                </p>
              ) : (
                <p>
                  <b>次に挑戦！</b> 正解は「{quiz?.options[quiz.answer]}」でした。
                </p>
              )}
            </div>
          )}
          <button
            className="primary-action"
            disabled={answer === null}
            onClick={onNext}
            style={{ marginTop: answer !== null ? '20px' : '32px' }}
          >
            次へ進む <span>→</span>
          </button>
        </div>
      )}
    </div>
  )
}

function RouteStep({ field, topic, route, onRouteSelect, job, setJob, onNext }: any) {
  const selected = fields.find((f) => f.name === field)

  return (
    <div className="step-card">
      <div className="step-heading">
        <span className="section-kicker">03 / GO FURTHER</span>
        <h2>次は、どこへ進む？</h2>
        <p>あなたの「もっと知りたい」を教えてください。</p>
      </div>

      <div className="route-list">
        {[
          ['another', '他の作品もつくってみたい', '別の分野にも触れて、視野を広げる'],
          [
            'advanced',
            'さらに応用したものをつくりたい',
            `${field}のさらに難しい課題に挑戦してみる`,
          ],
          ['job', '技術を使う職業��知りたい', '学んだ先の未来をのぞいてみる'],
        ].map(([value, title, desc]) => (
          <button
            key={value}
            className={`route-row ${route === value ? 'selected' : ''}`}
            onClick={() => onRouteSelect(value)}
          >
            <span className="route-radio" />
            <span>
              <b>{title}</b>
              <small>{desc}</small>
            </span>
            <span className="route-arrow">→</span>
          </button>
        ))}
      </div>

      {route === 'job' && (
        <div className="job-panel">
          <p>気になる職業をひとつ選んでください</p>
          {jobs[field].map((j: string) => (
            <button key={j} className={job === j ? 'chosen' : ''} onClick={() => setJob(j)}>
              {j}
            </button>
          ))}
        </div>
      )}

      <button className="primary-action" disabled={!route || (route === 'job' && !job)} onClick={onNext}>
        適性アンケートへ <span>→</span>
      </button>
    </div>
  )
}

function RepeatExperienceStep({ onBack, onStart }: { onBack: () => void; onStart: () => void }) {
  return <div className="step-card"><div className="step-heading"><span className="section-kicker">03A / TRY AGAIN</span><h2>もう一つ、作品をつくってみよう。</h2><p>すでに1回体験したあなたへ。別の作品にも挑戦して、興味の幅を広げます。</p></div><div className="branch-callout"><b>意欲度 +10</b><span>新しい分野への挑戦を評価します。</span></div><div className="branch-actions"><button className="secondary-action" onClick={onBack}>選択肢に戻る</button><button className="primary-action" onClick={onStart}>別の作品を選ぶ <span>→</span></button></div></div>
}

function AdvancedStep({ field, projectIndex, setProjectIndex, answer, setAnswer, onBack, onDone }: any) {
  const projects = advancedProjects[field]
  const project = projects[projectIndex]
  const submitted = answer !== null
  return <div className="step-card"><div className="step-heading"><span className="section-kicker">03B / ADVANCED WORK</span><h2>{field}の応用工作に挑戦。</h2><p>選んだ分野の発展テーマをつくり、応用クイズに答えます。</p></div><div className="advanced-project"><span className="section-kicker">PROJECT {String(projectIndex + 1).padStart(2, '0')}</span><h3>{project.name}</h3><p>{project.description}</p><div className="build-animation"><div className="build-parts"><span>設計</span><span>試作</span><span>検証</span></div></div><h4>{project.quiz.q}</h4><div className="quiz-options">{project.quiz.options.map((option: string, index: number) => <button key={option} className={`quiz-option ${answer === index ? 'chosen' : ''} ${submitted && index === project.quiz.answer ? 'correct' : ''}`} onClick={() => !submitted && setAnswer(index)} disabled={submitted}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>{submitted && <div className="quiz-feedback"><p>{answer === project.quiz.answer ? <><b>正解！</b> 応用への理解が深まりました。</> : <>正解は「{project.quiz.options[project.quiz.answer]}」です。</>}</p></div>}</div><div className="branch-actions"><button className="secondary-action" onClick={onBack}>選択肢に戻る</button>{!submitted ? <button className="primary-action" disabled={answer === null} onClick={() => setAnswer(answer)} >応用クイズを確認 <span>→</span></button> : projectIndex < projects.length - 1 ? <button className="primary-action" onClick={() => { setProjectIndex(projectIndex + 1); setAnswer(null) }}>次の応用へ <span>→</span></button> : <button className="primary-action" onClick={onDone}>ステップ3へ戻る <span>→</span></button>}</div></div>
}

function CareerStep({ field, job, setJob, onBack, onNext }: any) {
  return <div className="step-card"><div className="step-heading"><span className="section-kicker">03C / CAREERS</span><h2>{field}の技術が社会で活きる仕事。</h2><p>興味を持った職業を選ぶと、ものづくり・社会貢献への関心として記録されます。</p></div><div className="career-grid">{careerDetails[field].map((career) => <button key={career.name} className={`career-card ${job === career.name ? 'chosen' : ''}`} onClick={() => setJob(career.name)}><b>{career.name}</b><span>{career.description}</span></button>)}</div><div className="branch-actions"><button className="secondary-action" onClick={onBack}>選択肢に戻る</button><button className="primary-action" disabled={!job} onClick={onNext}>適性アンケートへ <span>→</span></button></div></div>
}

function SurveyStep({ answers, setAnswers, onNext }: any) {
  const questions = [
    'どの内容が楽しかったですか？',
    'もっと専門的に学びたいですか？',
    'ものづくりに興味が湧きましたか？',
    '実験・プログラミング、工作教室は楽しかったですか？',
    '授業を積極的に受けていますか？',
    '家などで積極的に自習していますか？',
    '数学か理科に苦手意識がありますか？',
  ]

  return (
    <div className="step-card">
      <div className="step-heading">
        <span className="section-kicker">04 / SELF CHECK</span>
        <h2>あなたの今を、教えてください。</h2>
        <p>答えに正解はありません。素直な気持ちで選んでください。</p>
      </div>

      <div className="survey-list">
        {questions.map((q, i) => (
          <div className="survey-row" key={q}>
            <span className="survey-index">{String(i + 1).padStart(2, '0')}</span>
            <b>{q}</b>
            <div className="answer-buttons">
              {(i === 0
                ? ['機械', '情報', '電気回路', '土木', '建築']
                : i === 6
                  ? ['はい', 'いいえ', 'どちらでもない']
                  : ['はい', 'いいえ']
              ).map((a) => (
                <button
                  key={a}
                  className={answers[i] === a ? 'chosen' : ''}
                  onClick={() => setAnswers({ ...answers, [i]: a })}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="primary-action" disabled={Object.keys(answers).length < 7} onClick={onNext}>
        診断結果を見る <span>→</span>
      </button>
    </div>
  )
}

function Result({ field, topic, job, score, onReset }: any) {
  const scores = [
    Math.min(98, 64 + (score / 10) * 5),
    Math.min(95, 58 + (score / 10) * 6),
    Math.min(96, 62 + (score / 10) * 4),
    Math.min(99, 70 + (score / 10) * 4),
  ]
  const labels = ['数学・理科の基礎', 'コミュニケーション', '勉学・課外活動への意欲', 'ものづくり・社会貢献']

  return (
    <main className="app-shell result-page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-symbol">TK</span>
          <span>
            <b>TECH QUEST</b>
            <small>徳山高専 ものづくり適性診断</small>
          </span>
        </div>
        <button className="reset-link" onClick={onReset}>
          もう一度診断する
        </button>
      </header>

      <section className="result-hero">
        <p className="eyebrow">YOUR ENGINEERING PROFILE</p>
        <h1>
          あなたの未来は、<br />
          <em>{field}からはじまる。</em>
        </h1>
        <p>「{topic}」への挑戦から見えてきた、あなたの適性です。</p>
      </section>

      <section className="result-grid">
        <div className="major-card">
          <span className="section-kicker">RECOMMENDED DEPARTMENT</span>
          <div className="major-number">{fields.find((f) => f.name === field)?.mark}</div>
          <h2>
            {field}
            <small>学科</small>
          </h2>
          <p>
            仕組みを考え、手を動かして形にする。あなたの好奇心は、{field}の世界で大きく育ちそうです。
          </p>
          {job && (
            <div className="job-result">
              興味を持った職業 <b>{job}</b>
            </div>
          )}
        </div>

        <div className="ap-card">
          <span className="section-kicker">TOKUYAMA KOSEN / AP SCORE</span>
          <h3>高専に最適です。</h3>
          <p>あなたの選択と回答から算出した適性度</p>
          {scores.map((s, i) => (
            <div className="score-row" key={labels[i]}>
              <span>{labels[i]}</span>
              <div>
                <i style={{ width: `${Math.round(s)}%` }} />
              </div>
              <b>{Math.round(s)}</b>
            </div>
          ))}
        </div>
      </section>

      <button className="primary-action result-button" onClick={onReset}>
        もう一度、未来を探す <span>↗</span>
      </button>

      <footer>
        <span>TECH QUEST / TOKUYAMA COLLEGE OF TECHNOLOGY</span>
        <span>あなたの可能性を、技術に。</span>
      </footer>
    </main>
  )
}
