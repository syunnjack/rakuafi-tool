import { useEffect, useMemo, useState } from 'react'
import './App.css'

const REPORTS_KEY = 'task-dashboard.rakutenReports'
const TASKS_KEY = 'task-dashboard.rakutenTasks'
const CONTENT_KEY = 'task-dashboard.rakutenContent'

const defaultReports = [
  { id: 'sample-1', date: '2026-07-15', clicks: 42, orders: 2, sales: 8600, reward: 172, memo: 'レビュー記事から初成果。商品ボタンを上部にも追加。' },
  { id: 'sample-2', date: '2026-07-16', clicks: 58, orders: 3, sales: 12600, reward: 252, memo: 'SNS投稿後にクリック増。夜の投稿が反応よし。' },
  { id: 'sample-3', date: '2026-07-17', clicks: 64, orders: 2, sales: 9800, reward: 196, memo: '比較表に公式リンクを追記。' },
]

const defaultTasks = [
  { id: 'task-1', title: '成果が出た記事の冒頭に楽天リンクを1つ追加', channel: 'ブログ', impact: '高', done: false },
  { id: 'task-2', title: 'クリックが多い商品を3つ比較表にする', channel: 'ブログ', impact: '高', done: false },
  { id: 'task-3', title: '昨日の売れた商品をSNSで再紹介する', channel: 'SNS', impact: '中', done: true },
  { id: 'task-4', title: '楽天レポートのクリック上位ページを確認', channel: '分析', impact: '中', done: false },
]

const defaultContent = [
  { id: 'content-1', name: '買ってよかった日用品まとめ', channel: 'ブログ', clicks: 38, reward: 118, idea: '季節ワードをタイトルに追加' },
  { id: 'content-2', name: '週末セール告知ポスト', channel: 'SNS', clicks: 21, reward: 64, idea: '投稿時間を21時に固定して検証' },
  { id: 'content-3', name: '家電の比較ページ', channel: 'ブログ', clicks: 12, reward: 0, idea: '価格帯別のおすすめを追記' },
]

const emptyReport = {
  date: new Date().toISOString().slice(0, 10),
  clicks: '',
  orders: '',
  sales: '',
  reward: '',
  memo: '',
}

const emptyTask = {
  title: '',
  channel: 'ブログ',
  impact: '中',
}

const emptyContent = {
  name: '',
  channel: 'ブログ',
  clicks: '',
  reward: '',
  idea: '',
}

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value) {
  return new Intl.NumberFormat('ja-JP').format(value)
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function App() {
  const [reports, setReports] = useState(() => readStorage(REPORTS_KEY, defaultReports))
  const [tasks, setTasks] = useState(() => readStorage(TASKS_KEY, defaultTasks))
  const [contents, setContents] = useState(() => readStorage(CONTENT_KEY, defaultContent))
  const [reportForm, setReportForm] = useState(emptyReport)
  const [taskForm, setTaskForm] = useState(emptyTask)
  const [contentForm, setContentForm] = useState(emptyContent)

  useEffect(() => {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
  }, [reports])

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(contents))
  }, [contents])

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => b.date.localeCompare(a.date)),
    [reports],
  )

  const totals = useMemo(() => {
    const totalClicks = reports.reduce((sum, report) => sum + toNumber(report.clicks), 0)
    const totalOrders = reports.reduce((sum, report) => sum + toNumber(report.orders), 0)
    const totalSales = reports.reduce((sum, report) => sum + toNumber(report.sales), 0)
    const totalReward = reports.reduce((sum, report) => sum + toNumber(report.reward), 0)

    return {
      clicks: totalClicks,
      orders: totalOrders,
      sales: totalSales,
      reward: totalReward,
      conversionRate: totalClicks ? (totalOrders / totalClicks) * 100 : 0,
      rewardPerClick: totalClicks ? totalReward / totalClicks : 0,
    }
  }, [reports])

  const activeTasks = tasks.filter((task) => !task.done)
  const completedTasks = tasks.filter((task) => task.done)
  const bestContent = [...contents].sort((a, b) => toNumber(b.reward) - toNumber(a.reward))[0]
  const weakestContent = [...contents].sort((a, b) => toNumber(b.clicks) - toNumber(a.clicks) || toNumber(a.reward) - toNumber(b.reward))[0]

  const suggestions = [
    totals.conversionRate < 3
      ? 'クリックはあるので、記事冒頭・比較表・購入直前の3か所に楽天リンクを置く'
      : '成約率は悪くないので、成果記事への導線をSNSと関連記事から増やす',
    totals.rewardPerClick < 5
      ? '単価が低めの商品だけでなく、買い替え需要のある商品を1つ混ぜる'
      : '報酬効率が良い商品を、別キーワードの記事にも横展開する',
    weakestContent?.reward === 0
      ? `${weakestContent.name} はクリック後の購入が弱いので、商品選定か訴求文を見直す`
      : '週1回、クリック上位3ページだけ改善して小さく積み上げる',
  ]

  const addReport = (event) => {
    event.preventDefault()
    const nextReport = {
      id: crypto.randomUUID(),
      date: reportForm.date,
      clicks: toNumber(reportForm.clicks),
      orders: toNumber(reportForm.orders),
      sales: toNumber(reportForm.sales),
      reward: toNumber(reportForm.reward),
      memo: reportForm.memo.trim(),
    }
    setReports((current) => [nextReport, ...current])
    setReportForm(emptyReport)
  }

  const addTask = (event) => {
    event.preventDefault()
    if (!taskForm.title.trim()) return
    setTasks((current) => [
      { id: crypto.randomUUID(), ...taskForm, title: taskForm.title.trim(), done: false },
      ...current,
    ])
    setTaskForm(emptyTask)
  }

  const addContent = (event) => {
    event.preventDefault()
    if (!contentForm.name.trim()) return
    setContents((current) => [
      {
        id: crypto.randomUUID(),
        name: contentForm.name.trim(),
        channel: contentForm.channel,
        clicks: toNumber(contentForm.clicks),
        reward: toNumber(contentForm.reward),
        idea: contentForm.idea.trim(),
      },
      ...current,
    ])
    setContentForm(emptyContent)
  }

  const toggleTask = (taskId) => {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task)),
    )
  }

  const deleteReport = (reportId) => {
    setReports((current) => current.filter((report) => report.id !== reportId))
  }

  const deleteTask = (taskId) => {
    setTasks((current) => current.filter((task) => task.id !== taskId))
  }

  const deleteContent = (contentId) => {
    setContents((current) => current.filter((content) => content.id !== contentId))
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Rakuten affiliate growth</p>
          <h1>楽天報酬を、毎日少しずつ増やす作業場</h1>
          <p className="lead">
            楽天アフィリエイトのレポート数値を入れて、クリック、成約、報酬、改善タスクを同じ画面で管理します。
            大きな一発狙いではなく、昨日より1つ良くするためのダッシュボードです。
          </p>
          <div className="hero-actions">
            <a href="https://affiliate.rakuten.co.jp/report/summary?l-id=af_header_mypage_02" target="_blank" rel="noreferrer">
              楽天レポートを開く
            </a>
            <a href="#today-work">今日の改善へ</a>
          </div>
        </div>
        <aside className="focus-panel" aria-label="今日の注目ポイント">
          <p className="panel-label">Next action</p>
          <h2>{suggestions[0]}</h2>
          <p>クリック数、成約率、1クリックあたり報酬を見ながら、改善の優先順位を決めます。</p>
        </aside>
      </section>

      <section className="metric-grid" aria-label="報酬サマリー">
        <article>
          <span>クリック</span>
          <strong>{formatNumber(totals.clicks)}</strong>
          <small>集客量の合計</small>
        </article>
        <article>
          <span>注文</span>
          <strong>{formatNumber(totals.orders)}</strong>
          <small>成約率 {totals.conversionRate.toFixed(1)}%</small>
        </article>
        <article>
          <span>売上</span>
          <strong>{formatCurrency(totals.sales)}</strong>
          <small>成果金額の合計</small>
        </article>
        <article>
          <span>報酬</span>
          <strong>{formatCurrency(totals.reward)}</strong>
          <small>1クリック {formatCurrency(totals.rewardPerClick)}</small>
        </article>
      </section>

      <section className="workspace-grid" id="today-work">
        <article className="tool-panel">
          <div className="panel-heading">
            <p className="eyebrow">Daily report</p>
            <h2>日次レポートを記録</h2>
          </div>
          <form className="report-form" onSubmit={addReport}>
            <label>
              日付
              <input type="date" value={reportForm.date} onChange={(event) => setReportForm({ ...reportForm, date: event.target.value })} required />
            </label>
            <label>
              クリック
              <input type="number" min="0" value={reportForm.clicks} onChange={(event) => setReportForm({ ...reportForm, clicks: event.target.value })} required />
            </label>
            <label>
              注文
              <input type="number" min="0" value={reportForm.orders} onChange={(event) => setReportForm({ ...reportForm, orders: event.target.value })} required />
            </label>
            <label>
              売上
              <input type="number" min="0" value={reportForm.sales} onChange={(event) => setReportForm({ ...reportForm, sales: event.target.value })} required />
            </label>
            <label>
              報酬
              <input type="number" min="0" value={reportForm.reward} onChange={(event) => setReportForm({ ...reportForm, reward: event.target.value })} required />
            </label>
            <label className="wide-field">
              メモ
              <textarea value={reportForm.memo} onChange={(event) => setReportForm({ ...reportForm, memo: event.target.value })} placeholder="伸びた記事、投稿時間、変更したリンクなど" />
            </label>
            <button type="submit">記録する</button>
          </form>
        </article>

        <article className="tool-panel">
          <div className="panel-heading">
            <p className="eyebrow">Improvement queue</p>
            <h2>改善タスク</h2>
          </div>
          <form className="task-form" onSubmit={addTask}>
            <input value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} placeholder="例: 成果記事に比較表を追加" />
            <select value={taskForm.channel} onChange={(event) => setTaskForm({ ...taskForm, channel: event.target.value })}>
              <option>ブログ</option>
              <option>SNS</option>
              <option>分析</option>
              <option>商品選定</option>
            </select>
            <select value={taskForm.impact} onChange={(event) => setTaskForm({ ...taskForm, impact: event.target.value })}>
              <option>高</option>
              <option>中</option>
              <option>低</option>
            </select>
            <button type="submit">追加</button>
          </form>
          <div className="task-list">
            {tasks.map((task) => (
              <div className={`task-row ${task.done ? 'done' : ''}`} key={task.id}>
                <button type="button" className="check-button" onClick={() => toggleTask(task.id)} aria-label={`${task.title}を完了にする`}>
                  {task.done ? '✓' : ''}
                </button>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.channel} / 効果 {task.impact}</span>
                </div>
                <button type="button" className="delete-button" onClick={() => deleteTask(task.id)}>削除</button>
              </div>
            ))}
          </div>
          <p className="panel-note">未完了 {activeTasks.length}件 / 完了 {completedTasks.length}件</p>
        </article>
      </section>

      <section className="insight-grid">
        <article className="tool-panel">
          <div className="panel-heading">
            <p className="eyebrow">What to improve</p>
            <h2>次に伸ばすポイント</h2>
          </div>
          <ul className="suggestion-list">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
        </article>

        <article className="tool-panel">
          <div className="panel-heading">
            <p className="eyebrow">Top content</p>
            <h2>成果が出ている導線</h2>
          </div>
          {bestContent ? (
            <div className="best-content">
              <span>{bestContent.channel}</span>
              <strong>{bestContent.name}</strong>
              <p>{formatNumber(bestContent.clicks)}クリック / {formatCurrency(toNumber(bestContent.reward))}</p>
              <small>{bestContent.idea}</small>
            </div>
          ) : (
            <p className="empty-text">媒体メモを追加すると表示されます。</p>
          )}
        </article>
      </section>

      <section className="content-section">
        <div className="panel-heading">
          <p className="eyebrow">Content tracker</p>
          <h2>媒体・記事別メモ</h2>
        </div>
        <form className="content-form" onSubmit={addContent}>
          <input value={contentForm.name} onChange={(event) => setContentForm({ ...contentForm, name: event.target.value })} placeholder="記事名、投稿名、ページ名" />
          <select value={contentForm.channel} onChange={(event) => setContentForm({ ...contentForm, channel: event.target.value })}>
            <option>ブログ</option>
            <option>SNS</option>
            <option>メール</option>
            <option>その他</option>
          </select>
          <input type="number" min="0" value={contentForm.clicks} onChange={(event) => setContentForm({ ...contentForm, clicks: event.target.value })} placeholder="クリック" />
          <input type="number" min="0" value={contentForm.reward} onChange={(event) => setContentForm({ ...contentForm, reward: event.target.value })} placeholder="報酬" />
          <input value={contentForm.idea} onChange={(event) => setContentForm({ ...contentForm, idea: event.target.value })} placeholder="次の改善案" />
          <button type="submit">追加</button>
        </form>
        <div className="content-table" role="table" aria-label="媒体別成果">
          <div className="table-head" role="row">
            <span>媒体</span>
            <span>名前</span>
            <span>クリック</span>
            <span>報酬</span>
            <span>改善案</span>
            <span></span>
          </div>
          {contents.map((content) => (
            <div className="table-row" role="row" key={content.id}>
              <span>{content.channel}</span>
              <strong>{content.name}</strong>
              <span>{formatNumber(toNumber(content.clicks))}</span>
              <span>{formatCurrency(toNumber(content.reward))}</span>
              <span>{content.idea || '次回入力'}</span>
              <button type="button" onClick={() => deleteContent(content.id)}>削除</button>
            </div>
          ))}
        </div>
      </section>

      <section className="history-section">
        <div className="panel-heading">
          <p className="eyebrow">Report history</p>
          <h2>記録履歴</h2>
        </div>
        <div className="history-list">
          {sortedReports.map((report) => (
            <article key={report.id}>
              <div>
                <time>{report.date}</time>
                <strong>{formatCurrency(toNumber(report.reward))}</strong>
                <span>{formatNumber(toNumber(report.clicks))}クリック / {formatNumber(toNumber(report.orders))}注文 / 売上 {formatCurrency(toNumber(report.sales))}</span>
                {report.memo && <p>{report.memo}</p>}
              </div>
              <button type="button" onClick={() => deleteReport(report.id)}>削除</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
