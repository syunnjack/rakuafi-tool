import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const REPORTS_KEY = 'task-dashboard.rakutenReports'
const TASKS_KEY = 'task-dashboard.rakutenTasks'
const CONTENT_KEY = 'task-dashboard.rakutenContent'
const AUTOPILOT_KEY = 'task-dashboard.rakutenAutopilot'
const ROOM_FLOWS_KEY = 'task-dashboard.roomFlows'
const AFFILIATE_SETTINGS_KEY = 'task-dashboard.rakutenAffiliateSettings'
const POST_DRAFT_KEY = 'task-dashboard.roomPostDraft'
const DAILY_REPORT_KEY = 'task-dashboard.dailyEmailReport'
const AUTO_IMPROVE_KEY = 'task-dashboard.autoImprove'
const CLICK_CAMPAIGNS_KEY = 'task-dashboard.clickCampaigns'
const LINE_SYNC_KEY = 'task-dashboard.lineSyncSettings'
const USER_RAKUTEN_AFFILIATE_LINK = 'https://hb.afl.rakuten.co.jp/hsc/55d66bbd.abc43fa6.152c70c7.a660e6e7/?link_type=text&ut=eyJwYWdlIjoic2hvcCIsInR5cGUiOiJ0ZXh0IiwiY29sIjoxLCJjYXQiOjEsImJhbiI6MTkwMTUsImFtcCI6ZmFsc2V9'

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

const roomModes = [
  { value: 'favorite', label: 'いいね候補', hint: '商品や投稿を確認して、よいものだけ手動で反応' },
  { value: 'follow', label: 'フォロー候補', hint: '相性のよいROOMユーザーを探す' },
  { value: 'refollow', label: '再フォロー確認', hint: '反応があった相手を確認する' },
  { value: 'kore', label: 'これ投稿候補', hint: 'キーワードに合う商品を投稿候補にする' },
  { value: 'kore-delete', label: 'これ削除候補', hint: '古い投稿や成果が弱い投稿を整理する' },
]

const defaultRoomFlows = [
  {
    id: 'room-1',
    mode: 'favorite',
    keyword: '日用品 セール',
    maxActions: 20,
    spanMinutes: 8,
    doneCount: 4,
    status: 'running',
    nextAt: '21:00',
    memo: '成果記事と相性がよい商品だけ確認',
  },
  {
    id: 'room-2',
    mode: 'kore',
    keyword: '買ってよかった 家電',
    maxActions: 8,
    spanMinutes: 20,
    doneCount: 1,
    status: 'ready',
    nextAt: '22:10',
    memo: '投稿文は手で確認してから公開',
  },
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

const emptyRoomFlow = {
  mode: 'favorite',
  keyword: '',
  maxActions: 10,
  spanMinutes: 10,
  memo: '',
}

const defaultAffiliateSettings = {
  affiliateLink: USER_RAKUTEN_AFFILIATE_LINK,
  campaignName: '楽天市場テキストリンク',
  targetMemo: '日本最大級ショッピングサイト！お買い物なら楽天市場',
}

const defaultPostDraft = {
  productName: '',
  productLink: '',
  audience: '',
  problem: '',
  benefit: '',
  proof: '',
  priceHook: '',
  hashtags: '#楽天ROOM #買ってよかった',
}

const emptyClickCampaign = {
  productName: '',
  productLink: '',
  price: '',
  category: '',
  audience: '',
  problem: '',
  benefit: '',
  proof: '',
  priceHook: '',
  campaignName: '',
  discountHook: '',
  couponUrl: '',
  channel: 'ROOM',
  status: 'draft',
  postedDate: '',
  startDate: '',
  endDate: '',
  clicksAfter24h: '',
  ordersAfter24h: '',
  rewardAfter24h: '',
  lastCheckedDate: '',
  lastResurfacedDate: '',
  note: '',
}

const defaultClickCampaigns = [
  {
    id: 'campaign-starter-1',
    productName: '商品別リンクを入れてください',
    productLink: '',
    price: '',
    category: '',
    audience: '買う前に失敗したくない人',
    problem: '似た商品が多くて選べない',
    benefit: '比較ポイントを短く見られる',
    proof: 'レビュー数、価格、送料、クーポンを商品ページで確認',
    priceHook: '最新価格は楽天の商品ページで確認',
    campaignName: '楽天キャンペーン確認待ち',
    discountHook: '買いまわり、ポイントアップ、クーポンを確認',
    couponUrl: 'https://event.rakuten.co.jp/',
    channel: 'ROOM',
    status: 'draft',
    postedDate: '',
    startDate: '',
    endDate: '',
    clicksAfter24h: '',
    ordersAfter24h: '',
    rewardAfter24h: '',
    lastCheckedDate: '',
    lastResurfacedDate: '',
    note: 'まずは本当に紹介する商品の個別アフィリエイトリンクへ差し替えます。',
  },
]

const defaultDailyReport = {
  enabled: true,
  recipient: 'syunnda1@yahoo.co.jp',
  sendTime: '09:00',
  lastSentDate: '',
}

const defaultAutoImprove = {
  enabled: true,
  lastRunDate: '',
  lastResult: 'まだ自動改善処理は実行されていません。',
}

const defaultLineSync = {
  enabled: false,
  endpointUrl: '',
  syncToken: '',
  lastSyncedAt: '',
  lastSyncStatus: '',
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

function formatTime(date) {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function formatLocalDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function impactScore(impact) {
  return { 高: 3, 中: 2, 低: 1 }[impact] ?? 1
}

function uniqueTasks(currentTasks, nextTasks) {
  const existingTitles = new Set(currentTasks.map((task) => task.title))
  return nextTasks.filter((task) => !existingTitles.has(task.title))
}

function daysBetween(fromDate, toDate) {
  const oneDay = 24 * 60 * 60 * 1000
  const from = new Date(`${fromDate}T00:00:00`)
  const to = new Date(`${toDate}T00:00:00`)
  return Math.round((to - from) / oneDay)
}

function recentReports(reports, days = 7) {
  const today = new Date().toISOString().slice(0, 10)
  return reports.filter((report) => daysBetween(report.date, today) >= 0 && daysBetween(report.date, today) < days)
}

function reportsInDayRange(reports, fromDaysAgo, toDaysAgo) {
  const today = new Date().toISOString().slice(0, 10)
  return reports.filter((report) => {
    const age = daysBetween(report.date, today)
    return age >= fromDaysAgo && age < toDaysAgo
  })
}

function sumReports(reports) {
  return {
    clicks: reports.reduce((sum, report) => sum + toNumber(report.clicks), 0),
    orders: reports.reduce((sum, report) => sum + toNumber(report.orders), 0),
    sales: reports.reduce((sum, report) => sum + toNumber(report.sales), 0),
    reward: reports.reduce((sum, report) => sum + toNumber(report.reward), 0),
  }
}

function buildMonthlySeries(reports, days = 30) {
  const byDate = new Map(reports.map((report) => [report.date, report]))
  const today = new Date()
  const series = []
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = formatLocalDateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset))
    const report = byDate.get(date)
    series.push({
      date,
      clicks: toNumber(report?.clicks),
      orders: toNumber(report?.orders),
      sales: toNumber(report?.sales),
      reward: toNumber(report?.reward),
    })
  }
  return series
}

function deltaValue(current, previous) {
  if (previous === 0 && current === 0) return { amount: 0, percent: 0, direction: 'flat' }
  if (previous === 0) return { amount: current, percent: 100, direction: 'up' }
  const amount = current - previous
  return {
    amount,
    percent: (amount / previous) * 100,
    direction: amount > 0 ? 'up' : amount < 0 ? 'down' : 'flat',
  }
}

function isLowIntentAffiliateLink(link) {
  const value = link.toLowerCase()
  return (
    isGenericRakutenLink(value) ||
    (value.includes('hb.afl.rakuten.co.jp/hsc/') && value.includes('link_type=text')) ||
    value.includes('pageijoic2hvc')
  )
}

function createZeroRewardTasks({ totals, affiliateSettings, postScore, roomStats }) {
  const tasks = []

  if (totals.clicks < 10) {
    tasks.push({
      title: '24時間以内に商品別リンク付きROOM投稿を3本作る',
      channel: 'ROOM',
      impact: '高',
    })
    tasks.push({
      title: '投稿ごとに「誰向け・悩み・使う理由」を必ず1行目に入れる',
      channel: 'ROOM',
      impact: '高',
    })
  }

  if (isLowIntentAffiliateLink(affiliateSettings.affiliateLink)) {
    tasks.push({
      title: '楽天市場トップリンクではなく、紹介商品の個別アフィリエイトリンクへ差し替える',
      channel: '商品選定',
      impact: '高',
    })
  }

  if (postScore < 5) {
    tasks.push({
      title: 'クリック投稿ビルダーの6項目を埋めて投稿文を作り直す',
      channel: 'ROOM',
      impact: '高',
    })
  }

  if (roomStats.doneTotal < 15) {
    tasks.push({
      title: 'ROOMキューで今日15件だけ候補確認して反応のある商品テーマを探す',
      channel: 'ROOM',
      impact: '中',
    })
  }

  tasks.push({
    title: '明日同じ時刻にクリック数だけ確認し、0なら商品テーマを変える',
    channel: '分析',
    impact: '中',
  })

  return tasks.map((task) => ({
    id: crypto.randomUUID(),
    ...task,
    done: false,
    source: 'rescue',
  }))
}

function createAutoTasks({ totals, bestContent, weakestContent, latestReport }) {
  const tasks = []

  if (!latestReport) {
    tasks.push({
      title: '楽天レポートから今日のクリック・注文・報酬を入力する',
      channel: '分析',
      impact: '高',
    })
  }

  if (totals.clicks > 0 && totals.conversionRate < 3) {
    tasks.push({
      title: 'クリックがあるページの楽天リンク位置を冒頭・比較表・購入直前に増やす',
      channel: 'ブログ',
      impact: '高',
    })
  }

  if (totals.rewardPerClick < 5) {
    tasks.push({
      title: '低単価商品だけでなく買い替え需要のある商品を1つ追加する',
      channel: '商品選定',
      impact: '中',
    })
  }

  if (bestContent) {
    tasks.push({
      title: `${bestContent.name} の成功パターンを別記事にも横展開する`,
      channel: bestContent.channel,
      impact: '高',
    })
  }

  if (weakestContent && toNumber(weakestContent.clicks) >= 10 && toNumber(weakestContent.reward) === 0) {
    tasks.push({
      title: `${weakestContent.name} の商品選定と購入ボタン文言を見直す`,
      channel: weakestContent.channel,
      impact: '高',
    })
  }

  if (latestReport && toNumber(latestReport.clicks) > 0) {
    tasks.push({
      title: '昨日反応があった商品をSNSで再投稿する',
      channel: 'SNS',
      impact: '中',
    })
  }

  return tasks.map((task) => ({
    id: crypto.randomUUID(),
    ...task,
    done: false,
    source: 'auto',
  }))
}

function roomModeLabel(mode) {
  return roomModes.find((item) => item.value === mode)?.label ?? mode
}

function readReports() {
  return readStorage(REPORTS_KEY, defaultReports).filter((report) => !String(report.id).startsWith('sample-'))
}

// 楽天アフィリエイトのレポートCSVはShift-JISで出力される。ブラウザのTextDecoderで
// 直接デコードし、文字化けを避ける(UTF-8で読むと日本語ヘッダーが壊れるため)。
async function decodeCsvFile(file) {
  const buffer = await file.arrayBuffer()
  try {
    const decoded = new TextDecoder('shift-jis').decode(buffer)
    if (!decoded.includes('�')) return decoded
  } catch {
    // Shift-JISデコーダが使えない環境ではUTF-8にフォールバック
  }
  return new TextDecoder('utf-8').decode(buffer)
}

function splitCsvLine(line) {
  const cells = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      cells.push(current)
      current = ''
    } else {
      current += char
    }
  }
  cells.push(current)
  return cells.map((cell) => cell.trim())
}

function toIsoDate(value) {
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/)
  if (!match) return null
  const [, year, month, day] = match
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function toPlainNumber(value) {
  const cleaned = String(value ?? '').replace(/[¥,\s]/g, '')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

const CSV_COLUMN_ALIASES = {
  date: ['発生日', '対象期間', 'date'],
  reward: ['確定報酬', '報酬', 'rewards', 'reward'],
  clicks: ['クリック数', 'クリック', 'clicks'],
  orders: ['売上件数', '成果件数', 'sales'],
  sales: ['売上金額', '金額', 'amount'],
}

function findColumnIndex(headerCells, aliases) {
  return headerCells.findIndex((cell) => aliases.some((alias) => cell.includes(alias)))
}

/**
 * 楽天アフィリエイトの成果レポートCSVをパースする。
 * タイトル行・空行・列名が特定できない行は無視し、日付を持つ行だけをレポートとして返す。
 */
function parseRakutenReportCsv(text) {
  const lines = text.split(/\r\n|\n|\r/).filter((line) => line.trim() !== '')
  let headerIndex = -1
  let columns = null

  for (let i = 0; i < lines.length; i += 1) {
    const cells = splitCsvLine(lines[i])
    const dateIndex = findColumnIndex(cells, CSV_COLUMN_ALIASES.date)
    if (dateIndex === -1) continue
    columns = {
      date: dateIndex,
      reward: findColumnIndex(cells, CSV_COLUMN_ALIASES.reward),
      clicks: findColumnIndex(cells, CSV_COLUMN_ALIASES.clicks),
      orders: findColumnIndex(cells, CSV_COLUMN_ALIASES.orders),
      sales: findColumnIndex(cells, CSV_COLUMN_ALIASES.sales),
    }
    headerIndex = i
    break
  }

  if (headerIndex === -1 || !columns) {
    return { rows: [], skipped: 0, headerFound: false }
  }

  const rows = []
  let skipped = 0
  for (let i = headerIndex + 1; i < lines.length; i += 1) {
    const cells = splitCsvLine(lines[i])
    const isoDate = toIsoDate(cells[columns.date] ?? '')
    if (!isoDate) {
      skipped += 1
      continue
    }
    rows.push({
      date: isoDate,
      clicks: columns.clicks >= 0 ? toPlainNumber(cells[columns.clicks]) : 0,
      orders: columns.orders >= 0 ? toPlainNumber(cells[columns.orders]) : 0,
      sales: columns.sales >= 0 ? toPlainNumber(cells[columns.sales]) : 0,
      reward: columns.reward >= 0 ? toPlainNumber(cells[columns.reward]) : 0,
    })
  }

  return { rows, skipped, headerFound: true }
}

/** CSVで取り込んだ行を既存レポートへマージする。同じ日付があれば上書き、無ければ追加。 */
function mergeReportsFromCsv(currentReports, csvRows) {
  const byDate = new Map(currentReports.map((report) => [report.date, report]))
  for (const row of csvRows) {
    const existing = byDate.get(row.date)
    byDate.set(row.date, {
      id: existing?.id ?? crypto.randomUUID(),
      date: row.date,
      clicks: row.clicks,
      orders: row.orders,
      sales: row.sales,
      reward: row.reward,
      memo: existing?.memo ?? '',
    })
  }
  return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date))
}

function isGenericRakutenLink(link) {
  const value = link.toLowerCase()
  return value.includes('page%22%3a%22shop') || value.includes('"page":"shop"')
}

function buildRoomPost(draft) {
  const opening = draft.audience && draft.problem
    ? `${draft.problem}で困っている${draft.audience}へ。`
    : draft.problem || `${draft.productName}を探している方へ。`
  const details = [draft.benefit, draft.proof, draft.priceHook].filter(Boolean)
  return [
    `【${draft.productName || '商品名を入力'}】`,
    opening,
    ...details,
    '気になる方は、商品ページで詳細と最新価格をチェックしてみてください。',
    draft.hashtags,
  ].filter(Boolean).join('\n\n')
}

function buildClickPost(campaign) {
  const campaignHook = campaign.campaignName
    ? `開催中/注目キャンペーン: ${campaign.campaignName}${campaign.discountHook ? ` (${campaign.discountHook})` : ''}`
    : ''
  const couponHook = campaign.couponUrl ? `クーポン確認: ${campaign.couponUrl}` : ''
  const lines = [
    `【${campaign.productName || '商品名を入力'}】`,
    campaign.problem && campaign.audience
      ? `${campaign.problem}と感じている${campaign.audience}向け。`
      : campaign.problem || campaign.audience,
    campaign.benefit,
    campaign.proof ? `選んだ理由: ${campaign.proof}` : '',
    campaign.priceHook,
    campaignHook,
    couponHook,
    campaign.productLink ? `商品リンク: ${campaign.productLink}` : '',
    '価格、在庫、ポイント、クーポン条件は楽天の商品ページで必ず確認してください。',
  ]
  return lines.filter(Boolean).join('\n\n')
}

function buildClickPostVariations(campaign) {
  const productLine = `【${campaign.productName || '商品名を入力'}】`
  const problemLine = campaign.problem && campaign.audience
    ? `${campaign.problem}と感じている${campaign.audience}向け。`
    : campaign.problem || campaign.audience
  const campaignHook = campaign.campaignName
    ? `開催中/注目キャンペーン: ${campaign.campaignName}${campaign.discountHook ? ` (${campaign.discountHook})` : ''}`
    : ''
  const couponHook = campaign.couponUrl ? `クーポン確認: ${campaign.couponUrl}` : ''
  const linkLine = campaign.productLink ? `商品リンク: ${campaign.productLink}` : ''
  const disclaimer = '価格、在庫、ポイント、クーポン条件は楽天の商品ページで必ず確認してください。'

  return [
    {
      key: 'problem',
      label: '悩み解決訴求',
      text: buildClickPost(campaign),
    },
    {
      key: 'price',
      label: '価格・キャンペーン訴求',
      text: [
        productLine,
        campaignHook || campaign.priceHook || '今の価格・キャンペーンをチェック。',
        couponHook,
        campaign.priceHook,
        problemLine,
        campaign.benefit,
        linkLine,
        disclaimer,
      ].filter(Boolean).join('\n\n'),
    },
    {
      key: 'proof',
      label: 'レビュー・根拠訴求',
      text: [
        productLine,
        campaign.proof ? `選んだ理由: ${campaign.proof}` : '根拠・レビューを入力してください。',
        campaign.benefit,
        problemLine,
        campaignHook,
        couponHook,
        linkLine,
        disclaimer,
      ].filter(Boolean).join('\n\n'),
    },
  ]
}

function clickCampaignScore(campaign) {
  return [
    campaign.productName,
    campaign.productLink?.startsWith('http') && !isGenericRakutenLink(campaign.productLink),
    campaign.audience,
    campaign.problem,
    campaign.benefit,
    campaign.proof,
    campaign.campaignName || campaign.discountHook || campaign.couponUrl,
  ].filter(Boolean).length
}

function clickCampaignVerdict(campaign) {
  const clicks = toNumber(campaign.clicksAfter24h)
  const orders = toNumber(campaign.ordersAfter24h)
  const reward = toNumber(campaign.rewardAfter24h)
  if (campaign.status !== 'posted' && campaign.status !== 'winner' && campaign.status !== 'failed') {
    return ['未投稿: まず投稿して24時間後に数字を入れます', 'draft']
  }
  if (reward > 0 || orders > 0) return ['勝ち商品: 同じ切り口で別商品へ横展開', 'winner']
  if (clicks > 0) return ['クリックあり: 商品条件、価格、クーポン訴求を改善', 'warm']
  return ['クリック0: 1行目、商品、キャンペーン訴求を変えて再投稿', 'failed']
}

function normalizeCampaign(campaign) {
  return {
    ...emptyClickCampaign,
    ...campaign,
    productName: campaign.productName?.trim() ?? '',
    productLink: campaign.productLink?.trim() ?? '',
    category: campaign.category?.trim() ?? '',
    audience: campaign.audience?.trim() ?? '',
    problem: campaign.problem?.trim() ?? '',
    benefit: campaign.benefit?.trim() ?? '',
    proof: campaign.proof?.trim() ?? '',
    priceHook: campaign.priceHook?.trim() ?? '',
    campaignName: campaign.campaignName?.trim() ?? '',
    discountHook: campaign.discountHook?.trim() ?? '',
    couponUrl: campaign.couponUrl?.trim() ?? '',
    startDate: campaign.startDate?.trim() ?? '',
    endDate: campaign.endDate?.trim() ?? '',
    note: campaign.note?.trim() ?? '',
  }
}

function campaignScheduleStatus(campaign, today) {
  if (!campaign.startDate && !campaign.endDate) return 'no-date'
  if (campaign.startDate && daysBetween(campaign.startDate, today) < 0) return 'upcoming'
  if (campaign.endDate && daysBetween(campaign.endDate, today) > 0) return 'ended'
  return 'active'
}

function campaignScheduleLabel(scheduleStatus) {
  return {
    'no-date': ['日付未設定', 'no-date'],
    upcoming: ['開始前', 'upcoming'],
    active: ['開催中', 'active'],
    ended: ['終了', 'ended'],
  }[scheduleStatus]
}

function buildCampaignCalendar(clickCampaigns) {
  const today = todayKey()
  return clickCampaigns
    .filter((campaign) => campaign.startDate || campaign.endDate)
    .map((campaign) => ({
      ...campaign,
      scheduleStatus: campaignScheduleStatus(campaign, today),
    }))
    .sort((a, b) => (a.startDate || a.endDate).localeCompare(b.startDate || b.endDate))
}

function buildCategoryPerformance(clickCampaigns) {
  const totals = new Map()
  clickCampaigns.forEach((campaign) => {
    if (!campaign.category) return
    const clicks = toNumber(campaign.clicksAfter24h)
    const reward = toNumber(campaign.rewardAfter24h)
    if (clicks === 0 && reward === 0) return
    const current = totals.get(campaign.category) ?? { category: campaign.category, clicks: 0, reward: 0 }
    current.clicks += clicks
    current.reward += reward
    totals.set(campaign.category, current)
  })
  return [...totals.values()].map((item) => ({
    ...item,
    rewardPerClick: item.clicks ? item.reward / item.clicks : 0,
  }))
}

function priceTierScore(price) {
  const value = toNumber(price)
  if (value >= 10000) return 3
  if (value >= 3000) return 2
  if (value > 0) return 1
  return 0
}

function categoryTierScore(campaign, categoryPerformance) {
  if (!campaign.category) return 1
  const match = categoryPerformance.find((item) => item.category === campaign.category)
  if (!match) return 1
  const overallAvg = categoryPerformance.reduce((sum, item) => sum + item.rewardPerClick, 0) / categoryPerformance.length
  if (overallAvg === 0) return 1
  return match.rewardPerClick >= overallAvg ? 2 : 0
}

function buildPriorityReasons(campaign, categoryPerformance) {
  const price = toNumber(campaign.price)
  const priceLabel = price > 0 ? `単価${formatCurrency(price)}` : '単価未入力'
  const match = categoryPerformance.find((item) => item.category === campaign.category)
  const categoryLabel = campaign.category
    ? match
      ? `${campaign.category}実績: 1クリック${formatCurrency(match.rewardPerClick)}`
      : `${campaign.category}: 実績データなし`
    : 'カテゴリ未入力'
  return [priceLabel, categoryLabel, `投稿準備${clickCampaignScore(campaign)}/7`]
}

function buildPriorityRanking(clickCampaigns, categoryPerformance) {
  return clickCampaigns
    .filter((campaign) => campaign.status === 'draft')
    .map((campaign) => ({
      ...campaign,
      priorityScore: priceTierScore(campaign.price) * 2 + categoryTierScore(campaign, categoryPerformance) * 2 + clickCampaignScore(campaign),
      priorityReasons: buildPriorityReasons(campaign, categoryPerformance),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
}

const LINK_RECHECK_DAYS = 14

function buildLinkCheckReminders(clickCampaigns) {
  const today = todayKey()
  return clickCampaigns
    .filter((campaign) => campaign.status !== 'draft' && campaign.productLink)
    .map((campaign) => {
      const baseline = campaign.lastCheckedDate || campaign.postedDate || campaign.startDate
      const daysSinceCheck = baseline ? daysBetween(baseline, today) : Infinity
      return { ...campaign, daysSinceCheck }
    })
    .filter((campaign) => campaign.daysSinceCheck >= LINK_RECHECK_DAYS)
    .sort((a, b) => b.daysSinceCheck - a.daysSinceCheck)
}

function recurringPointUpLabels(date) {
  const day = date.getDate()
  const labels = []
  if (day === 1) labels.push('ワンダフルデー(毎月1日)')
  if (day % 5 === 0) labels.push('5と0のつく日')
  return labels
}

function buildUpcomingPointUpDays(days = 7) {
  const today = new Date()
  const result = []
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset)
    const labels = recurringPointUpLabels(date)
    if (labels.length > 0) {
      result.push({
        date: formatLocalDateKey(date),
        labels,
        isToday: offset === 0,
      })
    }
  }
  return result
}

const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土']

function buildWeekdayPerformance(reports) {
  const totals = weekdayLabels.map((label, index) => ({ index, label, clicks: 0, orders: 0, reward: 0 }))
  reports.forEach((report) => {
    const day = new Date(`${report.date}T00:00:00`).getDay()
    totals[day].clicks += toNumber(report.clicks)
    totals[day].orders += toNumber(report.orders)
    totals[day].reward += toNumber(report.reward)
  })
  return totals.map((item) => ({
    ...item,
    rewardPerClick: item.clicks ? item.reward / item.clicks : 0,
  }))
}

const RESURFACE_DAYS = 14

function buildResurfaceCandidates(clickCampaigns) {
  const today = todayKey()
  return clickCampaigns
    .filter((campaign) => clickCampaignVerdict(campaign)[1] === 'winner')
    .map((campaign) => {
      const baseline = campaign.lastResurfacedDate || campaign.postedDate
      const daysSincePost = baseline ? daysBetween(baseline, today) : Infinity
      return { ...campaign, daysSincePost }
    })
    .filter((campaign) => campaign.daysSincePost >= RESURFACE_DAYS)
    .sort((a, b) => b.daysSincePost - a.daysSincePost)
}

async function syncReportsToLine(lineSync, reports) {
  if (!lineSync.enabled || !lineSync.endpointUrl.trim()) return null
  const payload = {
    reports: reports.slice(0, 90).map((report) => ({
      date: report.date,
      clicks: toNumber(report.clicks),
      orders: toNumber(report.orders),
      sales: toNumber(report.sales),
      reward: toNumber(report.reward),
    })),
  }
  try {
    const response = await fetch(lineSync.endpointUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sync-Token': lineSync.syncToken,
      },
      body: JSON.stringify(payload),
    })
    return response.ok ? 'success' : 'error'
  } catch {
    return 'error'
  }
}

function buildDailyReportBody({ totals, last7Clicks, last7Orders, last7Reward, zeroRewardReasons, todayTasks, postScore, roomStats, affiliateSettings }) {
  const reasonLines = zeroRewardReasons.length > 0
    ? zeroRewardReasons.map((reason, index) => `${index + 1}. ${reason.title}: ${reason.body}`).join('\n')
    : '大きな異常はありません。クリックと報酬の推移を継続確認してください。'
  const taskLines = todayTasks.length > 0
    ? todayTasks.map((task, index) => `${index + 1}. ${task.title}（${task.channel} / 効果 ${task.impact}）`).join('\n')
    : '未完了タスクはありません。対策タスクを自動追加してください。'

  return [
    '楽天アフィリエイト日報',
    `日付: ${todayKey()}`,
    '',
    '【累計サマリー】',
    `クリック: ${formatNumber(totals.clicks)}`,
    `注文: ${formatNumber(totals.orders)}`,
    `売上: ${formatCurrency(totals.sales)}`,
    `報酬: ${formatCurrency(totals.reward)}`,
    `成約率: ${totals.conversionRate.toFixed(1)}%`,
    `1クリック報酬: ${formatCurrency(totals.rewardPerClick)}`,
    '',
    '【直近7日】',
    `クリック: ${formatNumber(last7Clicks)}`,
    `売上件数: ${formatNumber(last7Orders)}`,
    `報酬: ${formatCurrency(last7Reward)}`,
    '',
    '【原因分析】',
    reasonLines,
    '',
    '【今日やること】',
    taskLines,
    '',
    '【投稿準備】',
    `クリック投稿ビルダー: ${postScore}/6`,
    `ROOM確認済み: ${formatNumber(roomStats.doneTotal)} / 実行上限 ${formatNumber(roomStats.totalLimit)}`,
    '',
    '【リンク設定】',
    `導線名: ${affiliateSettings.campaignName}`,
    `メモ: ${affiliateSettings.targetMemo}`,
    '',
    'この日報は rakuafi-tool で生成されました。',
  ].join('\n')
}

function reportStatus({ last7Clicks, last7Reward, postScore }) {
  if (last7Clicks < 10) return ['クリック不足', 'critical']
  if (last7Reward === 0) return ['購入導線を改善', 'warning']
  if (postScore < 5) return ['投稿材料を補強', 'warning']
  return ['改善継続', 'good']
}

function reportAgeDays(latestReport) {
  if (!latestReport?.date) return Infinity
  return daysBetween(latestReport.date, todayKey())
}

function buildToolHealthChecks({ autopilot, affiliateReady, lowIntentLink, postScore, roomStats, latestReport }) {
  return [
    {
      title: '診断エンジン',
      ok: autopilot,
      detail: autopilot ? '数値入力時に改善タスクを自動生成します。' : '半自動モードがオフです。',
    },
    {
      title: 'アフィリエイトリンク',
      ok: affiliateReady && !lowIntentLink,
      detail: affiliateReady
        ? lowIntentLink
          ? '楽天市場トップ系リンクです。商品別リンクに変えると改善余地があります。'
          : '商品別リンクとして使える状態です。'
        : 'リンクが未設定です。',
    },
    {
      title: '投稿ビルダー',
      ok: postScore >= 5,
      detail: `投稿材料は${postScore}/6項目です。`,
    },
    {
      title: 'ROOMキュー',
      ok: roomStats.totalLimit > 0,
      detail: roomStats.totalLimit > 0
        ? `今日の確認上限は${formatNumber(roomStats.totalLimit)}件です。`
        : '確認キューがありません。',
    },
    {
      title: 'レポート更新',
      ok: reportAgeDays(latestReport) <= 2,
      detail: reportAgeDays(latestReport) <= 2
        ? `最新記録は${latestReport.date}です。`
        : '直近の記録がありません。今日の数値を入力してください。',
    },
  ]
}

function buildRevenueActions({ last7Clicks, last7Orders, last7Reward, lowIntentLink, postScore, roomStats }) {
  const actions = []

  if (lowIntentLink) {
    actions.push({
      title: '汎用リンクを商品別リンクへ差し替え',
      detail: '楽天市場トップではなく、紹介する商品の個別ページからアフィリエイトリンクを作ります。',
      channel: '商品選定',
      impact: '高',
    })
  }

  if (postScore < 5) {
    actions.push({
      title: 'クリック投稿ビルダーを5項目以上にする',
      detail: '誰向け、悩み、メリット、根拠を入れて、押す理由を作ります。',
      channel: 'ROOM',
      impact: '高',
    })
  }

  if (last7Clicks < 10) {
    actions.push({
      title: '商品別投稿を3本作ってクリック数を検証',
      detail: '報酬改善の前にクリック母数を作ります。24時間後にクリックだけ確認します。',
      channel: 'ROOM',
      impact: '高',
    })
  }

  if (last7Clicks >= 10 && last7Orders === 0) {
    actions.push({
      title: 'レビュー数・価格・送料・クーポンを比較して商品を入れ替え',
      detail: 'クリックはあるのに購入がないため、商品側の買いやすさを見直します。',
      channel: '商品選定',
      impact: '高',
    })
  }

  if (roomStats.doneTotal < 15) {
    actions.push({
      title: 'ROOM候補を15件確認して反応テーマを探す',
      detail: '少量でよいので毎日テーマ検証を進めます。',
      channel: 'ROOM',
      impact: '中',
    })
  }

  if (last7Reward > 0) {
    actions.push({
      title: '報酬が出た導線を別投稿と関連記事へ横展開',
      detail: '成果が出た商品カテゴリ、言い回し、投稿時間を再利用します。',
      channel: 'ブログ',
      impact: '高',
    })
  }

  return actions
}

function buildProductRoi(clickCampaigns) {
  return clickCampaigns
    .filter((campaign) => toNumber(campaign.clicksAfter24h) > 0 || toNumber(campaign.ordersAfter24h) > 0 || toNumber(campaign.rewardAfter24h) > 0)
    .map((campaign) => {
      const clicks = toNumber(campaign.clicksAfter24h)
      const orders = toNumber(campaign.ordersAfter24h)
      const reward = toNumber(campaign.rewardAfter24h)
      return {
        id: campaign.id,
        productName: campaign.productName || '商品名未入力',
        channel: campaign.channel || '未設定',
        clicks,
        orders,
        reward,
        rewardPerClick: clicks ? reward / clicks : 0,
        conversionRate: clicks ? (orders / clicks) * 100 : 0,
      }
    })
    .sort((a, b) => b.reward - a.reward || b.rewardPerClick - a.rewardPerClick)
}

function buildChannelRoi(clickCampaigns, contents) {
  const totals = new Map()
  const addTo = (channelKey, clicks, orders, reward, kind) => {
    const channel = channelKey || '未設定'
    const current = totals.get(channel) ?? { channel, clicks: 0, orders: 0, reward: 0, productCount: 0, contentCount: 0 }
    current.clicks += clicks
    current.orders += orders
    current.reward += reward
    if (kind === 'product') current.productCount += 1
    if (kind === 'content') current.contentCount += 1
    totals.set(channel, current)
  }

  clickCampaigns.forEach((campaign) => {
    const clicks = toNumber(campaign.clicksAfter24h)
    const orders = toNumber(campaign.ordersAfter24h)
    const reward = toNumber(campaign.rewardAfter24h)
    if (clicks === 0 && orders === 0 && reward === 0) return
    addTo(campaign.channel, clicks, orders, reward, 'product')
  })

  contents.forEach((content) => {
    const clicks = toNumber(content.clicks)
    const reward = toNumber(content.reward)
    if (clicks === 0 && reward === 0) return
    addTo(content.channel, clicks, 0, reward, 'content')
  })

  return [...totals.values()]
    .map((item) => ({
      ...item,
      rewardPerClick: item.clicks ? item.reward / item.clicks : 0,
      conversionRate: item.clicks ? (item.orders / item.clicks) * 100 : 0,
    }))
    .sort((a, b) => b.reward - a.reward || b.rewardPerClick - a.rewardPerClick)
}

function buildRoiInsight(productRoi, channelRoi) {
  if (productRoi.length === 0 && channelRoi.length === 0) {
    return 'まだ実績データがありません。クリック獲得ツールで投稿し、24時間後の数字を入力すると商品別・チャネル別のROIが表示されます。'
  }
  const topProduct = productRoi[0]
  const topChannel = channelRoi[0]
  const lines = []
  if (topProduct && topProduct.reward > 0) {
    lines.push(`最も報酬効率が良い商品は「${topProduct.productName}」(1クリック${formatCurrency(topProduct.rewardPerClick)})。同じ切り口で別商品へ横展開してください。`)
  }
  if (topChannel && topChannel.reward > 0) {
    lines.push(`最も報酬が出ているチャネルは${topChannel.channel}(合計${formatCurrency(topChannel.reward)})。次の投稿量もここへ厚めに配分してください。`)
  }
  if (lines.length === 0) {
    lines.push('クリックは記録されていますが、まだ報酬発生はありません。商品単価やクーポン訴求を見直してください。')
  }
  return lines.join(' ')
}

function defaultImprovementDraft() {
  return {
    productName: '楽天で買える実用品',
    productLink: '',
    audience: '忙しくて買い物の失敗を減らしたい方',
    problem: 'どれを選べばよいか迷う',
    benefit: 'レビューや価格を見ながら、自分に合う商品を比較できます',
    proof: '楽天の商品ページでレビュー、送料、クーポン、在庫を確認できます',
    priceHook: '最新価格とクーポンは商品ページで確認してください',
    hashtags: '#楽天ROOM #楽天市場 #買ってよかった',
  }
}

function MonthlyLineChart({ title, data, valueKey, color, formatValue }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const width = 320
  const height = 140
  const paddingX = 10
  const paddingY = 18
  const maxValue = Math.max(1, ...data.map((point) => point[valueKey]))
  const stepX = (width - paddingX * 2) / (data.length - 1)
  const points = data.map((point, index) => ({
    x: paddingX + index * stepX,
    y: height - paddingY - (point[valueKey] / maxValue) * (height - paddingY * 2),
    value: point[valueKey],
    date: point.date,
  }))
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')
  const baseline = (height - paddingY).toFixed(1)
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${baseline} L${points[0].x.toFixed(1)},${baseline} Z`
  const latest = points[points.length - 1]
  const hovered = hoverIndex !== null ? points[hoverIndex] : null

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const relativeX = ((event.clientX - rect.left) / rect.width) * width
    const index = Math.round((relativeX - paddingX) / stepX)
    setHoverIndex(Math.min(points.length - 1, Math.max(0, index)))
  }

  return (
    <article className="monthly-chart">
      <div className="monthly-chart-head">
        <h4>{title}</h4>
        <strong>{formatValue(latest.value)}</strong>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${title}の過去${data.length}日推移`}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <line x1={paddingX} y1={baseline} x2={width - paddingX} y2={baseline} className="monthly-chart-axis" />
        <path d={areaPath} fill={color} opacity="0.14" stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={latest.x} cy={latest.y} r="4" fill={color} />
        {hovered && (
          <>
            <line x1={hovered.x} y1={paddingY / 2} x2={hovered.x} y2={baseline} className="monthly-chart-crosshair" />
            <circle cx={hovered.x} cy={hovered.y} r="4" fill={color} stroke="#fff" strokeWidth="1.5" />
          </>
        )}
      </svg>
      <div className="monthly-chart-foot">
        <span>{data[0].date.slice(5).replace('-', '/')}</span>
        <span className="monthly-chart-tooltip">{hovered ? `${hovered.date.slice(5).replace('-', '/')} ・ ${formatValue(hovered.value)}` : ''}</span>
        <span>{data[data.length - 1].date.slice(5).replace('-', '/')}</span>
      </div>
    </article>
  )
}

function App() {
  const [reports, setReports] = useState(readReports)
  const [tasks, setTasks] = useState(() => readStorage(TASKS_KEY, defaultTasks))
  const [contents, setContents] = useState(() => readStorage(CONTENT_KEY, defaultContent))
  const [roomFlows, setRoomFlows] = useState(() => readStorage(ROOM_FLOWS_KEY, defaultRoomFlows))
  const [affiliateSettings, setAffiliateSettings] = useState(() =>
    readStorage(AFFILIATE_SETTINGS_KEY, defaultAffiliateSettings),
  )
  const [autopilot, setAutopilot] = useState(() => readStorage(AUTOPILOT_KEY, true))
  const [reportForm, setReportForm] = useState(emptyReport)
  const [taskForm, setTaskForm] = useState(emptyTask)
  const [contentForm, setContentForm] = useState(emptyContent)
  const [roomForm, setRoomForm] = useState(emptyRoomFlow)
  const [affiliateForm, setAffiliateForm] = useState(affiliateSettings)
  const [postDraft, setPostDraft] = useState(() => readStorage(POST_DRAFT_KEY, defaultPostDraft))
  const [campaignForm, setCampaignForm] = useState(emptyClickCampaign)
  const [clickCampaigns, setClickCampaigns] = useState(() => readStorage(CLICK_CAMPAIGNS_KEY, defaultClickCampaigns))
  const [dailyReport, setDailyReport] = useState(() => readStorage(DAILY_REPORT_KEY, defaultDailyReport))
  const [autoImprove, setAutoImprove] = useState(() => readStorage(AUTO_IMPROVE_KEY, defaultAutoImprove))
  const [lineSync, setLineSync] = useState(() => readStorage(LINE_SYNC_KEY, defaultLineSync))
  const [copyMessage, setCopyMessage] = useState('')
  const [campaignMessage, setCampaignMessage] = useState('')
  const [rescueMessage, setRescueMessage] = useState('')
  const [csvImportMessage, setCsvImportMessage] = useState('')
  const [automationMessage, setAutomationMessage] = useState('半自動モードはオンです。数字を入れると改善タスクを自動で作ります。')

  useEffect(() => {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
  }, [reports])

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(contents))
  }, [contents])

  useEffect(() => {
    localStorage.setItem(ROOM_FLOWS_KEY, JSON.stringify(roomFlows))
  }, [roomFlows])

  useEffect(() => {
    localStorage.setItem(AFFILIATE_SETTINGS_KEY, JSON.stringify(affiliateSettings))
  }, [affiliateSettings])

  useEffect(() => {
    if (affiliateSettings.affiliateLink.trim()) return
    setAffiliateSettings(defaultAffiliateSettings)
    setAffiliateForm(defaultAffiliateSettings)
  }, [affiliateSettings.affiliateLink])

  useEffect(() => {
    localStorage.setItem(AUTOPILOT_KEY, JSON.stringify(autopilot))
  }, [autopilot])

  useEffect(() => {
    localStorage.setItem(POST_DRAFT_KEY, JSON.stringify(postDraft))
  }, [postDraft])

  useEffect(() => {
    localStorage.setItem(CLICK_CAMPAIGNS_KEY, JSON.stringify(clickCampaigns))
  }, [clickCampaigns])

  useEffect(() => {
    localStorage.setItem(DAILY_REPORT_KEY, JSON.stringify(dailyReport))
  }, [dailyReport])

  useEffect(() => {
    localStorage.setItem(AUTO_IMPROVE_KEY, JSON.stringify(autoImprove))
  }, [autoImprove])

  useEffect(() => {
    localStorage.setItem(LINE_SYNC_KEY, JSON.stringify(lineSync))
  }, [lineSync])

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
  const latestReport = sortedReports[0]

  const suggestions = [
    totals.clicks === 0
      ? '商品別リンクと悩み訴求を揃えた投稿を1本作り、24時間後のクリックを確認する'
      : totals.conversionRate < 3
      ? 'クリックはあるので、記事冒頭・比較表・購入直前の3か所に楽天リンクを置く'
      : '成約率は悪くないので、成果記事への導線をSNSと関連記事から増やす',
    totals.rewardPerClick < 5
      ? '単価が低めの商品だけでなく、買い替え需要のある商品を1つ混ぜる'
      : '報酬効率が良い商品を、別キーワードの記事にも横展開する',
    weakestContent?.reward === 0
      ? `${weakestContent.name} はクリック後の購入が弱いので、商品選定か訴求文を見直す`
      : '週1回、クリック上位3ページだけ改善して小さく積み上げる',
  ]

  const autoTaskCandidates = useMemo(
    () => createAutoTasks({ totals, bestContent, weakestContent, latestReport }),
    [bestContent, latestReport, totals, weakestContent],
  )

  const todayTasks = [...activeTasks]
    .sort((a, b) => impactScore(b.impact) - impactScore(a.impact))
    .slice(0, 3)

  const roomStats = useMemo(() => {
    const totalLimit = roomFlows.reduce((sum, flow) => sum + toNumber(flow.maxActions), 0)
    const doneTotal = roomFlows.reduce((sum, flow) => sum + toNumber(flow.doneCount), 0)
    const running = roomFlows.filter((flow) => flow.status === 'running').length
    return { totalLimit, doneTotal, running }
  }, [roomFlows])

  const affiliateReady = affiliateSettings.affiliateLink.trim().startsWith('http')
  const generatedPost = buildRoomPost(postDraft)
  const postLinkReady = postDraft.productLink.trim().startsWith('http')
  const postScoreItems = [
    [Boolean(postDraft.productName.trim()), '商品名'],
    [postLinkReady && !isGenericRakutenLink(postDraft.productLink), '商品別リンク'],
    [Boolean(postDraft.audience.trim()), '対象ユーザー'],
    [Boolean(postDraft.problem.trim()), '悩み'],
    [Boolean(postDraft.benefit.trim()), '使うメリット'],
    [Boolean(postDraft.proof.trim()), '実感・根拠'],
  ]
  const postScore = postScoreItems.filter(([done]) => done).length
  const campaignPreview = buildClickPost(campaignForm)
  const campaignVariations = buildClickPostVariations(campaignForm)
  const campaignScore = clickCampaignScore(campaignForm)
  const campaignStats = useMemo(() => {
    const posted = clickCampaigns.filter((campaign) => campaign.status === 'posted' || campaign.status === 'winner' || campaign.status === 'failed')
    const winners = clickCampaigns.filter((campaign) => clickCampaignVerdict(campaign)[1] === 'winner')
    const zeroClick = clickCampaigns.filter((campaign) => clickCampaignVerdict(campaign)[1] === 'failed')
    const totalClicks = clickCampaigns.reduce((sum, campaign) => sum + toNumber(campaign.clicksAfter24h), 0)
    return {
      drafts: clickCampaigns.length - posted.length,
      posted: posted.length,
      winners: winners.length,
      zeroClick: zeroClick.length,
      totalClicks,
    }
  }, [clickCampaigns])
  const todayCampaigns = clickCampaigns
    .filter((campaign) => campaign.status === 'draft')
    .sort((a, b) => clickCampaignScore(b) - clickCampaignScore(a))
    .slice(0, 3)
  const last7Reports = recentReports(reports, 7)
  const previous7Reports = reportsInDayRange(reports, 7, 14)
  const last7Summary = sumReports(last7Reports)
  const previous7Summary = sumReports(previous7Reports)
  const last7Clicks = last7Reports.reduce((sum, report) => sum + toNumber(report.clicks), 0)
  const last7Orders = last7Reports.reduce((sum, report) => sum + toNumber(report.orders), 0)
  const last7Reward = last7Reports.reduce((sum, report) => sum + toNumber(report.reward), 0)
  const weeklyDeltas = [
    {
      label: 'クリック',
      current: last7Summary.clicks,
      previous: previous7Summary.clicks,
      delta: deltaValue(last7Summary.clicks, previous7Summary.clicks),
      format: formatNumber,
    },
    {
      label: '売上件数',
      current: last7Summary.orders,
      previous: previous7Summary.orders,
      delta: deltaValue(last7Summary.orders, previous7Summary.orders),
      format: formatNumber,
    },
    {
      label: '売上金額',
      current: last7Summary.sales,
      previous: previous7Summary.sales,
      delta: deltaValue(last7Summary.sales, previous7Summary.sales),
      format: formatCurrency,
    },
    {
      label: '成果報酬',
      current: last7Summary.reward,
      previous: previous7Summary.reward,
      delta: deltaValue(last7Summary.reward, previous7Summary.reward),
      format: formatCurrency,
    },
  ]
  const lowIntentLink = isLowIntentAffiliateLink(affiliateSettings.affiliateLink)
  const zeroRewardReasons = [
    last7Clicks < 10 && {
      title: '露出・クリック不足',
      body: `直近7日クリックが${last7Clicks}件です。報酬以前に、購入ページへ人がほぼ移動していません。`,
      level: 'critical',
    },
    lowIntentLink && {
      title: 'リンクの購買意図が弱い',
      body: '現在の既定リンクは楽天市場トップ系のテキストリンクです。商品紹介では個別商品リンクの方がクリック後の購入行動につながりやすいです。',
      level: 'critical',
    },
    postScore < 5 && {
      title: '投稿の訴求材料が不足',
      body: `クリック投稿ビルダーは${postScore}/6項目です。誰向けか、悩み、使う理由、根拠がないと押す理由が弱くなります。`,
      level: 'warning',
    },
    roomStats.doneTotal < 15 && {
      title: '検証量が少ない',
      body: `ROOMキューの確認済みが${roomStats.doneTotal}件です。まずは少量でも毎日15件、反応テーマを探す必要があります。`,
      level: 'warning',
    },
    last7Orders === 0 && last7Clicks >= 10 && {
      title: 'クリック後の購入理由が弱い',
      body: 'クリックはあるのに売上がない状態です。商品単価、レビュー数、送料、クーポン、比較軸を見直してください。',
      level: 'warning',
    },
  ].filter(Boolean)
  const zeroRewardSeverity = last7Reward === 0 ? '要対策' : '改善継続'
  const dailyReportBody = buildDailyReportBody({
    totals,
    last7Clicks,
    last7Orders,
    last7Reward,
    zeroRewardReasons,
    todayTasks,
    postScore,
    roomStats,
    affiliateSettings,
  })
  const dailyReportSubject = `楽天アフィリエイト日報 ${todayKey()}`
  const dailyReportDue = dailyReport.enabled && dailyReport.lastSentDate !== todayKey()
  const dailyReportMailto = `mailto:${encodeURIComponent(dailyReport.recipient)}?subject=${encodeURIComponent(dailyReportSubject)}&body=${encodeURIComponent(dailyReportBody)}`
  const reportRows = [...sortedReports].reverse().slice(-14)
  const reportMaxClicks = Math.max(1, ...reportRows.map((report) => toNumber(report.clicks)))
  const reportMaxReward = Math.max(1, ...reportRows.map((report) => toNumber(report.reward)))
  const monthlySeries = useMemo(() => buildMonthlySeries(reports), [reports])
  const [currentReportStatus, currentReportTone] = reportStatus({ last7Clicks, last7Reward, postScore })
  const toolHealthChecks = buildToolHealthChecks({
    autopilot,
    affiliateReady,
    lowIntentLink,
    postScore,
    roomStats,
    latestReport,
  })
  const healthyChecks = toolHealthChecks.filter((check) => check.ok).length
  const toolHealthTone = healthyChecks === toolHealthChecks.length ? 'good' : healthyChecks >= 3 ? 'warning' : 'critical'
  const toolHealthLabel = healthyChecks === toolHealthChecks.length ? '正常稼働' : healthyChecks >= 3 ? '一部要確認' : '要修正'
  const revenueActions = useMemo(
    () => buildRevenueActions({
      last7Clicks,
      last7Orders,
      last7Reward,
      lowIntentLink,
      postScore,
      roomStats,
    }),
    [last7Clicks, last7Orders, last7Reward, lowIntentLink, postScore, roomStats],
  )
  const productRoi = useMemo(() => buildProductRoi(clickCampaigns), [clickCampaigns])
  const channelRoi = useMemo(() => buildChannelRoi(clickCampaigns, contents), [clickCampaigns, contents])
  const roiInsight = useMemo(() => buildRoiInsight(productRoi, channelRoi), [productRoi, channelRoi])
  const campaignCalendar = useMemo(() => buildCampaignCalendar(clickCampaigns), [clickCampaigns])
  const activeCampaignsToPost = campaignCalendar.filter(
    (campaign) => campaign.scheduleStatus === 'active' && campaign.status === 'draft',
  )
  const categoryPerformance = useMemo(() => buildCategoryPerformance(clickCampaigns), [clickCampaigns])
  const priorityRanking = useMemo(
    () => buildPriorityRanking(clickCampaigns, categoryPerformance).slice(0, 5),
    [clickCampaigns, categoryPerformance],
  )
  const linkCheckReminders = useMemo(() => buildLinkCheckReminders(clickCampaigns), [clickCampaigns])
  const upcomingPointUpDays = useMemo(() => buildUpcomingPointUpDays(7), [])
  const weekdayPerformance = useMemo(() => buildWeekdayPerformance(reports), [reports])
  const weekdayMaxClicks = Math.max(1, ...weekdayPerformance.map((day) => day.clicks))
  const weekdayMaxReward = Math.max(1, ...weekdayPerformance.map((day) => day.reward))
  const weekdayInsight = useMemo(() => {
    const withData = weekdayPerformance.filter((day) => day.clicks > 0 || day.reward > 0)
    if (withData.length === 0) return '曜日別の傾向を見るには、まず日次レポートを数日分記録してください。'
    const best = [...withData].sort((a, b) => b.reward - a.reward || b.rewardPerClick - a.rewardPerClick)[0]
    return `${best.label}曜日の報酬合計が最も高い傾向です(${formatCurrency(best.reward)})。投稿量をこの曜日に厚めに配分してみてください。`
  }, [weekdayPerformance])
  const resurfaceCandidates = useMemo(() => buildResurfaceCandidates(clickCampaigns), [clickCampaigns])

  const runImprovementProcessing = useCallback((mode = 'manual') => {
    const boostTasks = revenueActions.map((action) => ({
      id: crypto.randomUUID(),
      title: action.title,
      channel: action.channel,
      impact: action.impact,
      done: false,
      source: mode === 'auto' ? 'auto-improve' : 'boost',
    }))

    const shouldAddRoomFlow = last7Clicks < 10 || roomStats.doneTotal < 15
    const boostFlow = shouldAddRoomFlow ? {
      id: crypto.randomUUID(),
      mode: 'kore',
      keyword: postDraft.productName || '買ってよかった 楽天',
      maxActions: 15,
      spanMinutes: 10,
      doneCount: 0,
      status: 'ready',
      nextAt: formatTime(new Date()),
      memo: mode === 'auto'
        ? '自動改善処理が追加。商品別リンクと投稿文を確認してから実行。'
        : '報酬改善エンジンが追加。商品別リンクと投稿文を確認してから実行。',
    } : null

    const draftPatch = defaultImprovementDraft()
    setPostDraft((current) => ({
      ...current,
      productName: current.productName || draftPatch.productName,
      audience: current.audience || draftPatch.audience,
      problem: current.problem || draftPatch.problem,
      benefit: current.benefit || draftPatch.benefit,
      proof: current.proof || draftPatch.proof,
      priceHook: current.priceHook || draftPatch.priceHook,
      hashtags: current.hashtags || draftPatch.hashtags,
    }))

    let addedTasks = 0
    setTasks((current) => {
      const nextTasks = uniqueTasks(current, boostTasks)
      addedTasks = nextTasks.length
      return [...nextTasks, ...current]
    })

    if (boostFlow) {
      setRoomFlows((current) => {
        const hasAutoFlow = current.some((flow) => flow.memo.includes('自動改善処理') && flow.status !== 'done')
        return hasAutoFlow ? current : [boostFlow, ...current]
      })
    }

    const result = `${mode === 'auto' ? '自動改善' : '改善'}処理を実行しました。タスク${addedTasks}件、ROOMキュー${boostFlow ? '1件候補' : '追加なし'}、投稿ドラフトを補完。`
    setAutoImprove((current) => ({
      ...current,
      lastRunDate: todayKey(),
      lastResult: result,
    }))
    setAutomationMessage(result)
    setRescueMessage(result)
  }, [last7Clicks, postDraft.productName, revenueActions, roomStats.doneTotal])

  useEffect(() => {
    if (!autoImprove.enabled) return
    if (autoImprove.lastRunDate === todayKey()) return
    runImprovementProcessing('auto')
  }, [autoImprove.enabled, autoImprove.lastRunDate, runImprovementProcessing])

  const updatePostDraft = (field, value) => {
    setPostDraft((current) => ({ ...current, [field]: value }))
    setCopyMessage('')
    setRescueMessage('')
  }

  const copyPost = async () => {
    try {
      await navigator.clipboard.writeText(generatedPost)
      setCopyMessage('投稿文をコピーしました。')
    } catch {
      setCopyMessage('コピーできませんでした。投稿文を選択してコピーしてください。')
    }
  }

  const updateCampaignForm = (field, value) => {
    setCampaignForm((current) => ({ ...current, [field]: value }))
    setCampaignMessage('')
  }

  const saveClickCampaign = (event) => {
    event.preventDefault()
    const nextCampaign = normalizeCampaign(campaignForm)
    if (!nextCampaign.productName || !nextCampaign.productLink) {
      setCampaignMessage('商品名と商品別アフィリエイトURLを入れてください。')
      return
    }
    setClickCampaigns((current) => [{ id: crypto.randomUUID(), ...nextCampaign }, ...current])
    setCampaignForm(emptyClickCampaign)
    setCampaignMessage('クリック獲得キャンペーンを保存しました。今日の投稿候補に入ります。')
  }

  const loadDraftToCampaign = () => {
    setCampaignForm((current) => ({
      ...current,
      productName: postDraft.productName,
      productLink: postDraft.productLink,
      audience: postDraft.audience,
      problem: postDraft.problem,
      benefit: postDraft.benefit,
      proof: postDraft.proof,
      priceHook: postDraft.priceHook,
      channel: 'ROOM',
    }))
    setCampaignMessage('下の投稿ビルダーの内容をキャンペーン作成欄へ読み込みました。')
  }

  const applyRakutenCampaignPreset = () => {
    setCampaignForm((current) => ({
      ...current,
      campaignName: current.campaignName || '楽天お買い物マラソン / ポイントアップ確認',
      discountHook: current.discountHook || 'エントリー、買いまわり、クーポン、ポイント倍率を商品ページで確認',
      couponUrl: current.couponUrl || 'https://event.rakuten.co.jp/campaign/point-up/marathon/',
      priceHook: current.priceHook || 'クーポンやポイント倍率は開催期間で変わるため、最新条件を商品ページで確認してください。',
    }))
    setCampaignMessage('楽天キャンペーン訴求を投稿案へ反映しました。開催中かどうかは公式ページで確認してください。')
  }

  const copyCampaignPost = async () => {
    try {
      await navigator.clipboard.writeText(campaignPreview)
      setCampaignMessage('キャンペーン反映済みの投稿文をコピーしました。')
    } catch {
      setCampaignMessage('コピーできませんでした。投稿文を選択してコピーしてください。')
    }
  }

  const copyCampaignVariation = async (label, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCampaignMessage(`${label}の投稿文をコピーしました。`)
    } catch {
      setCampaignMessage('コピーできませんでした。投稿文を選択してコピーしてください。')
    }
  }

  const markCampaignPosted = (campaignId) => {
    setClickCampaigns((current) =>
      current.map((campaign) =>
        campaign.id === campaignId
          ? { ...campaign, status: 'posted', postedDate: todayKey() }
          : campaign,
      ),
    )
  }

  const markLinkChecked = (campaignId) => {
    setClickCampaigns((current) =>
      current.map((campaign) =>
        campaign.id === campaignId ? { ...campaign, lastCheckedDate: todayKey() } : campaign,
      ),
    )
  }

  const markResurfaced = (campaignId) => {
    setClickCampaigns((current) =>
      current.map((campaign) =>
        campaign.id === campaignId ? { ...campaign, lastResurfacedDate: todayKey() } : campaign,
      ),
    )
  }

  const updateCampaignMetric = (campaignId, field, value) => {
    setClickCampaigns((current) =>
      current.map((campaign) => {
        if (campaign.id !== campaignId) return campaign
        const nextCampaign = { ...campaign, [field]: value }
        const [, tone] = clickCampaignVerdict(nextCampaign)
        return {
          ...nextCampaign,
          status: tone === 'winner' ? 'winner' : tone === 'failed' ? 'failed' : nextCampaign.status,
        }
      }),
    )
  }

  const duplicateCampaign = (campaign) => {
    setClickCampaigns((current) => [
      {
        ...campaign,
        id: crypto.randomUUID(),
        status: 'draft',
        postedDate: '',
        clicksAfter24h: '',
        ordersAfter24h: '',
        rewardAfter24h: '',
        productName: `${campaign.productName} 改善案`,
        note: '前回結果を見て、1行目・商品条件・キャンペーン訴求を変えて再投稿します。',
      },
      ...current,
    ])
  }

  const deleteCampaign = (campaignId) => {
    setClickCampaigns((current) => current.filter((campaign) => campaign.id !== campaignId))
  }

  const addClickImprovementTasks = () => {
    const targetCampaigns = clickCampaigns.filter((campaign) => clickCampaignVerdict(campaign)[1] === 'failed')
    const nextTasks = targetCampaigns.length > 0
      ? targetCampaigns.map((campaign) => ({
          id: crypto.randomUUID(),
          title: `${campaign.productName} の1行目、商品条件、クーポン訴求を変えて再投稿する`,
          channel: campaign.channel,
          impact: '高',
          done: false,
          source: 'click-campaign',
        }))
      : [{
          id: crypto.randomUUID(),
          title: '商品別リンク、キャンペーン名、クーポンURL入りの投稿案を3本作る',
          channel: 'ROOM',
          impact: '高',
          done: false,
          source: 'click-campaign',
        }]
    setTasks((current) => [...uniqueTasks(current, nextTasks), ...current])
    setCampaignMessage(`${nextTasks.length}件のクリック改善タスクを追加しました。`)
  }

  const runAutomation = () => {
    setTasks((current) => {
      const nextTasks = uniqueTasks(current, autoTaskCandidates)
      setAutomationMessage(
        nextTasks.length > 0
          ? `${nextTasks.length}件の改善タスクを自動追加しました。`
          : '追加できる新しい自動タスクはありません。既存タスクを進めましょう。',
      )
      return [...nextTasks, ...current]
    })
  }

  const runZeroRewardRescue = () => {
    const rescueTasks = createZeroRewardTasks({
      totals,
      affiliateSettings,
      postScore,
      roomStats,
    })
    setTasks((current) => {
      const nextTasks = uniqueTasks(current, rescueTasks)
      const message = nextTasks.length > 0
        ? `${nextTasks.length}件の対策タスクを追加しました。下の改善タスクに反映されています。`
        : '追加できる新しい対策タスクはありません。既存の改善タスクを進めてください。'
      setRescueMessage(message)
      setAutomationMessage(message)
      return [...nextTasks, ...current]
    })
    window.setTimeout(() => {
      document.querySelector('#today-work')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }

  const runRevenueBoost = () => {
    runImprovementProcessing('manual')
    window.setTimeout(() => {
      document.querySelector('#today-work')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }

  const saveDailyReport = (event) => {
    event.preventDefault()
    setDailyReport((current) => ({
      ...current,
      recipient: dailyReport.recipient.trim() || defaultDailyReport.recipient,
      sendTime: dailyReport.sendTime || defaultDailyReport.sendTime,
    }))
  }

  const markDailyReportSent = () => {
    setDailyReport((current) => ({
      ...current,
      lastSentDate: todayKey(),
    }))
  }

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
    const nextReports = [nextReport, ...reports]
    setReports(nextReports)
    if (autopilot) {
      const nextAutoTasks = createAutoTasks({
        totals,
        bestContent,
        weakestContent,
        latestReport: nextReport,
      })
      setTasks((current) => [...uniqueTasks(current, nextAutoTasks), ...current])
      setAutomationMessage('レポート入力に合わせて改善タスクを自動更新しました。')
    }
    setReportForm(emptyReport)
    syncReportsToLine(lineSync, nextReports).then((status) => {
      if (!status) return
      setLineSync((current) => ({ ...current, lastSyncedAt: formatLocalDateKey(new Date()), lastSyncStatus: status }))
    })
  }

  const importReportsCsv = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setCsvImportMessage('読み込み中…')
    try {
      const text = await decodeCsvFile(file)
      const { rows, skipped, headerFound } = parseRakutenReportCsv(text)

      if (!headerFound) {
        setCsvImportMessage('列名(発生日など)が見つかりませんでした。楽天アフィリエイトの成果レポートCSVか確認してください。')
        return
      }
      if (rows.length === 0) {
        setCsvImportMessage('取り込める行がありませんでした(対象期間にデータがない可能性があります)。')
        return
      }

      const nextReports = mergeReportsFromCsv(reports, rows)
      setReports(nextReports)
      setCsvImportMessage(
        `${rows.length}件を取り込みました${skipped > 0 ? `(${skipped}行はスキップ)` : ''}。`
      )

      if (autopilot) {
        const latestImported = [...rows].sort((a, b) => b.date.localeCompare(a.date))[0]
        const nextAutoTasks = createAutoTasks({
          totals,
          bestContent,
          weakestContent,
          latestReport: latestImported,
        })
        setTasks((current) => [...uniqueTasks(current, nextAutoTasks), ...current])
      }

      syncReportsToLine(lineSync, nextReports).then((status) => {
        if (!status) return
        setLineSync((current) => ({ ...current, lastSyncedAt: formatLocalDateKey(new Date()), lastSyncStatus: status }))
      })
    } catch {
      setCsvImportMessage('CSVの読み込みに失敗しました。ファイル形式を確認してください。')
    }
  }

  const saveLineSync = (event) => {
    event.preventDefault()
    setLineSync((current) => ({
      ...current,
      endpointUrl: current.endpointUrl.trim(),
      syncToken: current.syncToken.trim(),
    }))
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

  const addRoomFlow = (event) => {
    event.preventDefault()
    if (!roomForm.keyword.trim()) return
    setRoomFlows((current) => [
      {
        id: crypto.randomUUID(),
        ...roomForm,
        keyword: roomForm.keyword.trim(),
        maxActions: toNumber(roomForm.maxActions),
        spanMinutes: toNumber(roomForm.spanMinutes),
        doneCount: 0,
        status: 'ready',
        nextAt: formatTime(new Date()),
        memo: roomForm.memo.trim(),
      },
      ...current,
    ])
    setRoomForm(emptyRoomFlow)
  }

  const startRoomFlow = (flowId) => {
    setRoomFlows((current) =>
      current.map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              status: 'running',
              nextAt: formatTime(new Date(Date.now() + toNumber(flow.spanMinutes) * 60 * 1000)),
            }
          : flow,
      ),
    )
  }

  const pauseRoomFlow = (flowId) => {
    setRoomFlows((current) =>
      current.map((flow) => (flow.id === flowId ? { ...flow, status: 'paused' } : flow)),
    )
  }

  const completeRoomStep = (flowId) => {
    setRoomFlows((current) =>
      current.map((flow) => {
        if (flow.id !== flowId) return flow
        const nextDoneCount = Math.min(toNumber(flow.doneCount) + 1, toNumber(flow.maxActions))
        return {
          ...flow,
          doneCount: nextDoneCount,
          status: nextDoneCount >= toNumber(flow.maxActions) ? 'done' : flow.status,
          nextAt: formatTime(new Date(Date.now() + toNumber(flow.spanMinutes) * 60 * 1000)),
        }
      }),
    )
  }

  const deleteRoomFlow = (flowId) => {
    setRoomFlows((current) => current.filter((flow) => flow.id !== flowId))
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

  const saveAffiliateSettings = (event) => {
    event.preventDefault()
    setAffiliateSettings({
      affiliateLink: affiliateForm.affiliateLink.trim(),
      campaignName: affiliateForm.campaignName.trim() || '楽天ROOM導線',
      targetMemo: affiliateForm.targetMemo.trim(),
    })
  }

  const topActiveCampaign = activeCampaignsToPost[0]
  const topPriorityCampaign = priorityRanking[0]
  const topDailyTask = todayTasks[0]
  const topLinkCheck = linkCheckReminders[0]
  const topResurface = resurfaceCandidates[0]
  const briefingItems = [
    {
      key: 'daily-report',
      label: '今日の数値を記録する',
      detail: latestReport?.date === todayKey()
        ? '本日分は記録済みです。'
        : 'クリック・注文・売上・報酬を記録すると、診断とグラフが今日の分に更新されます。',
      done: latestReport?.date === todayKey(),
      href: '#today-work',
    },
    {
      key: 'active-campaign',
      label: '開催中キャンペーンを投稿する',
      detail: topActiveCampaign
        ? `${topActiveCampaign.campaignName || 'キャンペーン'} / ${topActiveCampaign.productName} が開催中でまだ未投稿です。`
        : '開催中で未投稿のキャンペーンはありません。',
      done: !topActiveCampaign,
      href: '#click-acquisition',
      quickAction: topActiveCampaign
        ? { label: '投稿済みにする', onClick: () => markCampaignPosted(topActiveCampaign.id) }
        : null,
    },
    {
      key: 'priority-product',
      label: '優先度が高い商品を投稿する',
      detail: topPriorityCampaign
        ? `「${topPriorityCampaign.productName}」が${topPriorityCampaign.priorityScore}ptで最優先です。`
        : '下書き中の商品別キャンペーンがありません。',
      done: !topPriorityCampaign,
      href: '#click-acquisition',
      quickAction: topPriorityCampaign
        ? { label: '投稿済みにする', onClick: () => markCampaignPosted(topPriorityCampaign.id) }
        : null,
    },
    {
      key: 'top-task',
      label: '今日の重要タスクを1つ実行する',
      detail: topDailyTask ? topDailyTask.title : '未完了の重要タスクはありません。',
      done: !topDailyTask,
      href: '#today-work',
      quickAction: topDailyTask
        ? { label: '完了にする', onClick: () => toggleTask(topDailyTask.id) }
        : null,
    },
    {
      key: 'daily-email',
      label: '日報メールを送る',
      detail: dailyReportDue ? '本日分の日報がまだ送信されていません。' : '本日分の日報は送信済みです。',
      done: !dailyReportDue,
      href: dailyReportMailto,
      isMailLink: true,
    },
    {
      key: 'link-check',
      label: 'リンク・在庫を再確認する',
      detail: topLinkCheck
        ? `「${topLinkCheck.productName}」が${LINK_RECHECK_DAYS}日以上未確認です。`
        : '再確認が必要なリンクはありません。',
      done: !topLinkCheck,
      href: '#click-acquisition',
      quickAction: topLinkCheck
        ? { label: '確認済みにする', onClick: () => markLinkChecked(topLinkCheck.id) }
        : null,
    },
    {
      key: 'resurface',
      label: '成果記事を再投稿する',
      detail: topResurface
        ? `「${topResurface.productName}」を${formatNumber(topResurface.daysSincePost)}日間再投稿していません。`
        : '再掘り起こし対象の勝ち商品はありません。',
      done: !topResurface,
      href: '#click-acquisition',
      quickAction: topResurface
        ? { label: '再投稿づみにする', onClick: () => markResurfaced(topResurface.id) }
        : null,
    },
  ]
  const briefingDoneCount = briefingItems.filter((item) => item.done).length

  return (
    <main className="app-shell">
      <section className="briefing-section" aria-label="今日のブリーフィング">
        <div className="briefing-heading">
          <div>
            <p className="eyebrow">Today's briefing</p>
            <h2>今日のブリーフィング</h2>
            <p>毎日ここだけ確認すれば、やることを見落としません。</p>
          </div>
          <div className="briefing-progress">
            <strong>{briefingDoneCount}/{briefingItems.length}</strong>
            <span>完了</span>
          </div>
        </div>
        <div className="briefing-list">
          {briefingItems.map((item) => (
            <article className={`briefing-item ${item.done ? 'done' : ''}`} key={item.key}>
              <span className="briefing-status">{item.done ? '完了' : '未完了'}</span>
              <strong>{item.label}</strong>
              <p>{item.detail}</p>
              <div className="briefing-actions">
                {item.quickAction && (
                  <button type="button" onClick={item.quickAction.onClick}>{item.quickAction.label}</button>
                )}
                <a href={item.href} onClick={item.isMailLink ? markDailyReportSent : undefined}>
                  {item.isMailLink ? '日報を作成' : '詳細を見る'}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="hero">
        <div>
          <p className="eyebrow">Rakuten affiliate growth</p>
          <h1>楽天報酬を、毎日少しずつ増やす作業場</h1>
          <p className="lead">
            楽天アフィリエイトのレポート数値を入れて、クリック、成約、報酬、改善タスクを同じ画面で管理します。
            大きな一発狙いではなく、昨日より1つ良くするためのダッシュボードです。
          </p>
          <div className="hero-actions">
            <a href="#click-acquisition">クリック獲得ツールへ</a>
            <a href="#report-page">レポートを見る</a>
            <a href="#click-studio">クリック投稿を作る</a>
            <a href="https://affiliate.rakuten.co.jp/report/summary?l-id=af_header_mypage_02" target="_blank" rel="noreferrer">
              楽天レポートを開く
            </a>
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

      <section className="click-acquisition" id="click-acquisition" aria-label="クリック獲得ツール">
        <div className="click-acquisition-heading">
          <div>
            <p className="eyebrow">Click acquisition</p>
            <h2>商品別リンクと楽天キャンペーンでクリックを作る</h2>
            <p>
              報酬はまずクリックが発生しないと始まりません。商品ごとに「誰のどんな悩みに効くか」
              「今のキャンペーン/クーポンで何が得か」を入れて、投稿、24時間後のクリック確認、改善まで回します。
            </p>
          </div>
          <div className="campaign-score">
            <strong>{campaignScore}<span>/7</span></strong>
            <small>{campaignScore >= 6 ? '投稿準備OK' : '不足項目あり'}</small>
          </div>
        </div>

        <div className="campaign-kpi-grid">
          <article><span>保存投稿案</span><strong>{formatNumber(clickCampaigns.length)}</strong><small>商品別キャンペーン</small></article>
          <article><span>投稿済み</span><strong>{formatNumber(campaignStats.posted)}</strong><small>24時間後に数字確認</small></article>
          <article><span>24hクリック</span><strong>{formatNumber(campaignStats.totalClicks)}</strong><small>商品別入力の合計</small></article>
          <article><span>勝ち商品</span><strong>{formatNumber(campaignStats.winners)}</strong><small>注文/報酬あり</small></article>
        </div>

        <div className="campaign-tools">
          <form className="campaign-form" onSubmit={saveClickCampaign}>
            <label>商品名<input value={campaignForm.productName} onChange={(event) => updateCampaignForm('productName', event.target.value)} placeholder="例: 軽量コードレス掃除機" /></label>
            <label>商品別アフィリエイトURL<input type="url" value={campaignForm.productLink} onChange={(event) => updateCampaignForm('productLink', event.target.value)} placeholder="楽天の商品ページで作った商品別リンク" /></label>
            <label>単価(円)<input type="number" min="0" value={campaignForm.price} onChange={(event) => updateCampaignForm('price', event.target.value)} placeholder="例: 5980" /></label>
            <label>カテゴリ<input value={campaignForm.category} onChange={(event) => updateCampaignForm('category', event.target.value)} placeholder="例: 家電、日用品、美容" /></label>
            <label>誰向け<input value={campaignForm.audience} onChange={(event) => updateCampaignForm('audience', event.target.value)} placeholder="例: 忙しい一人暮らしの人" /></label>
            <label>悩み<input value={campaignForm.problem} onChange={(event) => updateCampaignForm('problem', event.target.value)} placeholder="例: 掃除機を出すのが面倒" /></label>
            <label>使うメリット<textarea value={campaignForm.benefit} onChange={(event) => updateCampaignForm('benefit', event.target.value)} placeholder="例: 軽くてすぐ使えるので床のホコリをためにくい" /></label>
            <label>選んだ根拠<textarea value={campaignForm.proof} onChange={(event) => updateCampaignForm('proof', event.target.value)} placeholder="レビュー、仕様、送料、クーポンなど確認できる根拠" /></label>
            <label>楽天キャンペーン名<input value={campaignForm.campaignName} onChange={(event) => updateCampaignForm('campaignName', event.target.value)} placeholder="例: お買い物マラソン / 5と0のつく日" /></label>
            <label>割引・ポイント訴求<input value={campaignForm.discountHook} onChange={(event) => updateCampaignForm('discountHook', event.target.value)} placeholder="例: エントリー、買いまわり、ポイントアップ対象" /></label>
            <label>クーポン/キャンペーンURL<input type="url" value={campaignForm.couponUrl} onChange={(event) => updateCampaignForm('couponUrl', event.target.value)} placeholder="公式キャンペーンやクーポンページURL" /></label>
            <label>キャンペーン開始日<input type="date" value={campaignForm.startDate} onChange={(event) => updateCampaignForm('startDate', event.target.value)} /></label>
            <label>キャンペーン終了日<input type="date" value={campaignForm.endDate} onChange={(event) => updateCampaignForm('endDate', event.target.value)} /></label>
            <label>価格・注意点<input value={campaignForm.priceHook} onChange={(event) => updateCampaignForm('priceHook', event.target.value)} placeholder="価格、在庫、条件は商品ページで確認" /></label>
            <label>投稿先<select value={campaignForm.channel} onChange={(event) => updateCampaignForm('channel', event.target.value)}><option>ROOM</option><option>SNS</option><option>ブログ</option></select></label>
            <label>メモ<input value={campaignForm.note} onChange={(event) => updateCampaignForm('note', event.target.value)} placeholder="投稿時間、狙い、変更点" /></label>
            <div className="campaign-form-actions">
              <button type="submit">投稿案を保存</button>
              <button type="button" onClick={loadDraftToCampaign}>下の投稿案を読み込む</button>
              <button type="button" onClick={applyRakutenCampaignPreset}>楽天キャンペーン反映</button>
            </div>
          </form>

          <aside className="campaign-preview">
            <div className="preview-topline"><span>キャンペーン反映済み投稿文</span><strong>{campaignPreview.length}文字</strong></div>
            <textarea readOnly value={campaignPreview} aria-label="キャンペーン反映済み投稿文" />
            <div className="preview-actions">
              <button type="button" onClick={copyCampaignPost}>投稿文をコピー</button>
              <a href="https://event.rakuten.co.jp/" target="_blank" rel="noreferrer">楽天キャンペーン確認</a>
            </div>
            <p className="disclosure-note">
              楽天のキャンペーン、割引、クーポンは頻繁に変わります。公式ページと商品ページで開催期間、エントリー条件、上限、対象商品を確認してから投稿します。
            </p>
          </aside>
        </div>

        <div className="variation-section">
          <div className="report-card-title">
            <div>
              <h3>訴求文バリエーション</h3>
              <span>同じ商品を別の切り口でA/Bテストする</span>
            </div>
          </div>
          <div className="variation-list">
            {campaignVariations.map((variation) => (
              <article className="variation-card" key={variation.key}>
                <span className="variation-label">{variation.label}</span>
                <p>{variation.text}</p>
                <button type="button" onClick={() => copyCampaignVariation(variation.label, variation.text)}>この案をコピー</button>
              </article>
            ))}
          </div>
        </div>

        <div className="campaign-message-row">
          <button type="button" onClick={addClickImprovementTasks}>クリック改善タスクを自動追加</button>
          {campaignMessage && <p role="status">{campaignMessage}</p>}
        </div>

        <div className="today-campaigns">
          <div className="report-card-title">
            <div>
              <h3>今日投稿する3本</h3>
              <span>スコアが高い未投稿案から順番に実行</span>
            </div>
          </div>
          <div className="today-campaign-grid">
            {todayCampaigns.map((campaign) => (
              <article key={campaign.id}>
                <span>{campaign.channel} / {clickCampaignScore(campaign)}/7</span>
                <strong>{campaign.productName}</strong>
                <p>{campaign.campaignName || campaign.discountHook || 'キャンペーン訴求未設定'}</p>
                <button type="button" onClick={() => markCampaignPosted(campaign.id)}>投稿済みにする</button>
              </article>
            ))}
            {todayCampaigns.length === 0 && <article><span>未投稿なし</span><strong>新しい商品別リンクを追加してください</strong><p>クリックがゼロなら、商品を変えるかキャンペーン訴求を変えて再テストします。</p></article>}
          </div>
        </div>

        <div className="campaign-calendar">
          <div className="report-card-title">
            <div>
              <h3>投稿カレンダー</h3>
              <span>{campaignCalendar.length}件の日程登録</span>
            </div>
          </div>
          {activeCampaignsToPost.length > 0 && (
            <p className="calendar-alert">
              今日開催中で未投稿のキャンペーンが{activeCampaignsToPost.length}件あります。優先して投稿してください。
            </p>
          )}
          <div className="calendar-list">
            {campaignCalendar.map((campaign) => {
              const [scheduleLabel, scheduleTone] = campaignScheduleLabel(campaign.scheduleStatus)
              return (
                <article className={`calendar-card ${scheduleTone}`} key={campaign.id}>
                  <span className="calendar-status">{scheduleLabel}</span>
                  <strong>{campaign.campaignName || 'キャンペーン名未設定'}</strong>
                  <p>{campaign.productName}</p>
                  <small>{campaign.startDate || '開始日未設定'} 〜 {campaign.endDate || '終了日未設定'}</small>
                </article>
              )
            })}
            {campaignCalendar.length === 0 && (
              <p className="empty-text">キャンペーンの開始日・終了日を入力すると、投稿カレンダーに表示されます。</p>
            )}
          </div>
          <div className="point-up-row">
            <span className="point-up-label">楽天ポイントアップ日(目安)</span>
            {upcomingPointUpDays.length > 0 ? upcomingPointUpDays.map((day) => (
              <span className={`point-up-chip ${day.isToday ? 'today' : ''}`} key={day.date}>
                {day.date.slice(5).replace('-', '/')} {day.labels.join(' / ')}
              </span>
            )) : <span className="point-up-chip">今後7日に対象日はありません</span>}
            <a href="https://event.rakuten.co.jp/" target="_blank" rel="noreferrer">公式で条件を確認</a>
          </div>
          <p className="disclosure-note">
            対象条件、倍率、上限は時期により変わります。投稿・購入前に必ず公式ページで最新条件を確認してください。
          </p>
        </div>

        <div className="resurface-section">
          <div className="report-card-title">
            <div>
              <h3>成果記事の再掘り起こし</h3>
              <span>勝ち商品を{RESURFACE_DAYS}日以上再投稿していない案件</span>
            </div>
          </div>
          <div className="resurface-list">
            {resurfaceCandidates.map((campaign) => (
              <article className="resurface-card" key={campaign.id}>
                <span className="resurface-days">{formatNumber(campaign.daysSincePost)}日経過</span>
                <strong>{campaign.productName}</strong>
                <p>{campaign.campaignName || 'キャンペーン未設定'} / {campaign.channel}</p>
                <button type="button" onClick={() => markResurfaced(campaign.id)}>再投稿づみにする</button>
              </article>
            ))}
            {resurfaceCandidates.length === 0 && (
              <p className="empty-text">再掘り起こし対象の勝ち商品はありません。</p>
            )}
          </div>
        </div>

        <div className="link-check-section">
          <div className="report-card-title">
            <div>
              <h3>リンク・在庫の再確認</h3>
              <span>投稿から{LINK_RECHECK_DAYS}日以上リンク未確認の案件</span>
            </div>
          </div>
          <div className="link-check-list">
            {linkCheckReminders.map((campaign) => (
              <article className="link-check-card" key={campaign.id}>
                <span className="link-check-days">
                  {campaign.daysSinceCheck === Infinity ? '未確認' : `${formatNumber(campaign.daysSinceCheck)}日未確認`}
                </span>
                <strong>{campaign.productName}</strong>
                <a href={campaign.productLink || undefined} target="_blank" rel="noreferrer sponsored">商品ページを開く</a>
                <button type="button" onClick={() => markLinkChecked(campaign.id)}>確認済みにする</button>
              </article>
            ))}
            {linkCheckReminders.length === 0 && (
              <p className="empty-text">再確認が必要なリンクはありません。</p>
            )}
          </div>
        </div>

        <div className="priority-ranking">
          <div className="report-card-title">
            <div>
              <h3>商品優先度スコア</h3>
              <span>単価・カテゴリ実績・投稿準備から算出した、下書きの投稿優先度</span>
            </div>
          </div>
          <div className="priority-list">
            {priorityRanking.map((campaign, index) => (
              <article className="priority-card" key={campaign.id}>
                <span className="priority-rank">{index + 1}位 / {campaign.priorityScore}pt</span>
                <strong>{campaign.productName}</strong>
                <ul>
                  {campaign.priorityReasons.map((reason) => <li key={reason}>{reason}</li>)}
                </ul>
              </article>
            ))}
            {priorityRanking.length === 0 && (
              <p className="empty-text">下書き中の商品別キャンペーンがありません。商品を追加すると優先度が表示されます。</p>
            )}
          </div>
        </div>

        <div className="campaign-list">
          {clickCampaigns.map((campaign) => {
            const [verdict, tone] = clickCampaignVerdict(campaign)
            return (
              <article className={`campaign-card ${tone}`} key={campaign.id}>
                <div>
                  <span>{campaign.channel} / {campaign.status}</span>
                  <h3>{campaign.productName}</h3>
                  <p>{campaign.problem || campaign.benefit || campaign.note}</p>
                  <small>{campaign.campaignName || 'キャンペーン未設定'} {campaign.discountHook ? `/ ${campaign.discountHook}` : ''}</small>
                </div>
                <div className="campaign-metrics">
                  <label>24hクリック<input type="number" min="0" value={campaign.clicksAfter24h} onChange={(event) => updateCampaignMetric(campaign.id, 'clicksAfter24h', event.target.value)} /></label>
                  <label>注文<input type="number" min="0" value={campaign.ordersAfter24h} onChange={(event) => updateCampaignMetric(campaign.id, 'ordersAfter24h', event.target.value)} /></label>
                  <label>報酬<input type="number" min="0" value={campaign.rewardAfter24h} onChange={(event) => updateCampaignMetric(campaign.id, 'rewardAfter24h', event.target.value)} /></label>
                </div>
                <div className="campaign-card-actions">
                  <strong>{verdict}</strong>
                  <button type="button" onClick={() => markCampaignPosted(campaign.id)}>投稿済み</button>
                  <button type="button" onClick={() => duplicateCampaign(campaign)}>改善案を複製</button>
                  <button type="button" onClick={() => deleteCampaign(campaign.id)}>削除</button>
                  <a className={!campaign.productLink ? 'disabled-link' : ''} href={campaign.productLink || undefined} target="_blank" rel="noreferrer sponsored">商品確認</a>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="diagnosis-section" aria-label="ゼロ報酬の原因分析">
        <article className="diagnosis-main">
          <div>
            <p className="eyebrow">Cause analysis</p>
            <h2>報酬ゼロの原因は、まずクリック不足です</h2>
            <p>
              スクリーンショットでは売上金額・成果報酬が0円で、クリックも一部の日に1件程度です。
              この状態では、成約率改善より先に「商品別リンクへ移動する人」を増やす必要があります。
            </p>
          </div>
          <div className={`diagnosis-status ${last7Reward === 0 ? 'critical' : ''}`}>
            <span>{zeroRewardSeverity}</span>
            <strong>{formatCurrency(last7Reward)}</strong>
            <small>直近7日報酬 / クリック {formatNumber(last7Clicks)} / 売上件数 {formatNumber(last7Orders)}</small>
          </div>
        </article>

        <div className="reason-grid">
          {zeroRewardReasons.map((reason) => (
            <article className={`reason-card ${reason.level}`} key={reason.title}>
              <h3>{reason.title}</h3>
              <p>{reason.body}</p>
            </article>
          ))}
        </div>

        <div className="rescue-actions">
          <button type="button" onClick={runZeroRewardRescue}>対策タスクを自動追加</button>
          <a href="#today-work">改善タスクを見る</a>
          <a href="#click-acquisition">キャンペーン連動投稿を作る</a>
          <a href="#click-studio">商品別投稿を作る</a>
          <a href="https://affiliate.rakuten.co.jp/report/summary?l-id=af_header_mypage_02" target="_blank" rel="noreferrer">楽天レポートで確認</a>
        </div>
        {rescueMessage && <p className="rescue-message" role="status">{rescueMessage}</p>}
      </section>

      <section className="daily-report-section" aria-label="日報メール">
        <article className="daily-report-panel">
          <div>
            <p className="eyebrow">Daily email</p>
            <h2>1日1回、日報メールを作成</h2>
            <p>
              宛先は syunnda1@yahoo.co.jp です。ブラウザから無人送信はできないため、
              日報本文を自動生成してメールアプリを開き、送信済み日付を管理します。
            </p>
            <span className={`daily-status ${dailyReportDue ? 'due' : ''}`}>
              {dailyReportDue ? '本日の日報は未送信' : '本日の日報は送信済み'}
            </span>
          </div>
          <form className="daily-report-form" onSubmit={saveDailyReport}>
            <label>
              宛先
              <input
                type="email"
                value={dailyReport.recipient}
                onChange={(event) => setDailyReport({ ...dailyReport, recipient: event.target.value })}
              />
            </label>
            <label>
              送信目安
              <input
                type="time"
                value={dailyReport.sendTime}
                onChange={(event) => setDailyReport({ ...dailyReport, sendTime: event.target.value })}
              />
            </label>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={dailyReport.enabled}
                onChange={(event) => setDailyReport({ ...dailyReport, enabled: event.target.checked })}
              />
              日報を有効にする
            </label>
            <button type="submit">設定保存</button>
            <a href={dailyReportMailto} onClick={markDailyReportSent}>日報メールを作成</a>
          </form>
        </article>
        <textarea className="daily-report-preview" readOnly value={dailyReportBody} aria-label="日報プレビュー" />
      </section>

      <section className="line-sync-section" aria-label="LINE自動レポート設定">
        <p className="eyebrow">LINE auto report</p>
        <h2>毎朝LINEへ自動レポート</h2>
        <p>
          レポートを保存するたびに、レンタルサーバーに設置した受信エンドポイントへ数値を送信します。
          実際の毎朝の送信自体はサーバー側のcronが行うため、設置手順は
          <code>server/line-report/README.md</code> を参照してください。
        </p>
        <form className="daily-report-form" onSubmit={saveLineSync}>
          <label className="wide-field">
            同期先URL
            <input
              type="url"
              value={lineSync.endpointUrl}
              onChange={(event) => setLineSync({ ...lineSync, endpointUrl: event.target.value })}
              placeholder="https://your-domain/rakuafi-report/api.php"
            />
          </label>
          <label className="wide-field">
            共有シークレット
            <input
              type="password"
              value={lineSync.syncToken}
              onChange={(event) => setLineSync({ ...lineSync, syncToken: event.target.value })}
              placeholder="config.phpのsync_shared_secretと同じ値"
            />
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={lineSync.enabled}
              onChange={(event) => setLineSync({ ...lineSync, enabled: event.target.checked })}
            />
            LINE同期を有効にする
          </label>
          <button type="submit">設定保存</button>
        </form>
        <p className="line-sync-status">
          {lineSync.lastSyncedAt
            ? `最終同期: ${lineSync.lastSyncedAt} (${lineSync.lastSyncStatus === 'success' ? '成功' : '失敗'})`
            : 'まだ同期されていません。レポートを保存すると同期を試みます。'}
        </p>
      </section>

      <section className="report-page" id="report-page" aria-label="アフィリエイトレポートページ">
        <div className="report-page-heading">
          <div>
            <p className="eyebrow">Report page</p>
            <h2>いつでも見られる報酬レポート</h2>
            <p>
              メール送信を待たずに、このページを開くだけでクリック、売上、報酬、原因、今日やることを確認できます。
            </p>
          </div>
          <div className={`report-health ${currentReportTone}`}>
            <span>現在の状態</span>
            <strong>{currentReportStatus}</strong>
            <small>更新日 {todayKey()}</small>
          </div>
        </div>

        <div className={`tool-health-summary ${toolHealthTone}`}>
          <div>
            <p className="eyebrow">Tool status</p>
            <h3>ツール稼働状態: {toolHealthLabel}</h3>
            <p>
              {healthyChecks}/{toolHealthChecks.length}項目が正常です。自動診断、リンク、投稿準備、ROOMキュー、レポート更新を確認しています。
            </p>
          </div>
          <div className="tool-health-grid">
            {toolHealthChecks.map((check) => (
              <article className={check.ok ? 'ok' : 'ng'} key={check.title}>
                <span>{check.ok ? '正常' : '確認'}</span>
                <strong>{check.title}</strong>
                <small>{check.detail}</small>
              </article>
            ))}
          </div>
        </div>

        <div className={`auto-improve-panel ${autoImprove.enabled ? 'running' : 'paused'}`}>
          <div>
            <p className="eyebrow">Auto improvement</p>
            <h3>{autoImprove.enabled ? '自動改善処理は有効です' : '自動改善処理は停止中です'}</h3>
            <p>
              ページを開いた日に1回、報酬改善タスク、ROOM検証キュー、投稿ドラフト補完を自動実行します。
              楽天ROOMへの最終投稿やいいね操作は手動確認です。
            </p>
            <span>{autoImprove.lastRunDate ? `最終実行: ${autoImprove.lastRunDate}` : 'まだ実行されていません'}</span>
            <small>{autoImprove.lastResult}</small>
          </div>
          <div className="auto-improve-actions">
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={autoImprove.enabled}
                onChange={(event) => setAutoImprove({ ...autoImprove, enabled: event.target.checked })}
              />
              毎日自動で改善処理する
            </label>
            <button type="button" onClick={() => runImprovementProcessing('manual')}>今すぐ改善処理</button>
          </div>
        </div>

        <div className="report-kpi-grid">
          <article>
            <span>直近7日クリック</span>
            <strong>{formatNumber(last7Clicks)}</strong>
            <small>{last7Clicks < 10 ? 'まずクリック数を増やす段階' : 'クリック導線あり'}</small>
          </article>
          <article>
            <span>直近7日売上件数</span>
            <strong>{formatNumber(last7Orders)}</strong>
            <small>{last7Orders === 0 ? '商品選定と訴求を確認' : '購入発生あり'}</small>
          </article>
          <article>
            <span>直近7日報酬</span>
            <strong>{formatCurrency(last7Reward)}</strong>
            <small>{last7Reward === 0 ? '対策タスクを実行' : '伸びた導線を横展開'}</small>
          </article>
          <article>
            <span>投稿準備</span>
            <strong>{postScore}/6</strong>
            <small>{postScore < 5 ? '投稿ビルダーを埋める' : '投稿可能'}</small>
          </article>
          <article>
            <span>クリック獲得運用</span>
            <strong>{formatNumber(campaignStats.posted)}/{formatNumber(clickCampaigns.length)}</strong>
            <small>投稿済み / 商品別キャンペーン。ゼロクリックは改善案へ複製します。</small>
          </article>
        </div>

        <div className="weekly-performance">
          <div className="report-card-title">
            <div>
              <h3>一週間前からのパフォーマンス改善</h3>
              <span>直近7日と、その前の7日を比較</span>
            </div>
          </div>
          <div className="weekly-grid">
            {weeklyDeltas.map((item) => (
              <article className={item.delta.direction} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.format(item.current)}</strong>
                <small>
                  前週 {item.format(item.previous)} / {item.delta.direction === 'up' ? '+' : ''}{item.format(item.delta.amount)}
                  {' '}({item.delta.direction === 'up' ? '+' : ''}{item.delta.percent.toFixed(0)}%)
                </small>
              </article>
            ))}
          </div>
          {previous7Reports.length === 0 && (
            <p className="weekly-note">前週データがまだありません。今日から記録すると、7日後に改善幅がより正確に見えます。</p>
          )}
        </div>

        <div className="revenue-engine">
          <div className="report-card-title">
            <div>
              <h3>報酬改善エンジン</h3>
              <span>いま報酬に近づくための処理</span>
            </div>
            <button type="button" onClick={runRevenueBoost}>改善キューを作成</button>
          </div>
          <div className="revenue-action-grid">
            {revenueActions.map((action) => (
              <article key={action.title}>
                <span>効果 {action.impact} / {action.channel}</span>
                <strong>{action.title}</strong>
                <p>{action.detail}</p>
              </article>
            ))}
            {revenueActions.length === 0 && (
              <article>
                <span>改善継続</span>
                <strong>大きな詰まりはありません</strong>
                <p>記録を続け、成果が出た導線を別投稿と関連記事へ横展開してください。</p>
              </article>
            )}
          </div>
        </div>

        <div className="report-board">
          <article className="report-chart-card">
            <div className="report-card-title">
              <h3>日別クリックと報酬</h3>
              <span>最大14件</span>
            </div>
            <div className="report-bars" aria-label="日別クリックと報酬グラフ">
              {reportRows.length > 0 ? reportRows.map((report) => {
                const clickHeight = Math.max(4, (toNumber(report.clicks) / reportMaxClicks) * 100)
                const rewardHeight = Math.max(4, (toNumber(report.reward) / reportMaxReward) * 100)
                return (
                  <div className="report-day" key={report.id}>
                    <div className="bar-pair">
                      <i className="click-bar" style={{ height: `${clickHeight}%` }} />
                      <i className="reward-bar" style={{ height: `${rewardHeight}%` }} />
                    </div>
                    <span>{report.date.slice(5).replace('-', '/')}</span>
                  </div>
                )
              }) : <p className="empty-text">日次レポートを入力するとグラフが表示されます。</p>}
            </div>
            <div className="chart-legend">
              <span><i className="click-bar" />クリック</span>
              <span><i className="reward-bar" />報酬</span>
            </div>
          </article>

          <article className="report-action-card">
            <div className="report-card-title">
              <h3>今日見るポイント</h3>
              <span>{zeroRewardReasons.length}件</span>
            </div>
            <ul>
              {zeroRewardReasons.map((reason) => (
                <li key={reason.title}>
                  <strong>{reason.title}</strong>
                  <span>{reason.body}</span>
                </li>
              ))}
              {zeroRewardReasons.length === 0 && <li><strong>異常なし</strong><span>記録を継続して、成果が出た導線を横展開してください。</span></li>}
            </ul>
          </article>
        </div>

        <div className="monthly-report">
          <div className="report-card-title">
            <h3>過去30日の推移</h3>
            <span>クリック・注文・売上・報酬</span>
          </div>
          <div className="monthly-chart-grid">
            <MonthlyLineChart title="クリック" data={monthlySeries} valueKey="clicks" color="#2a78d6" formatValue={formatNumber} />
            <MonthlyLineChart title="注文" data={monthlySeries} valueKey="orders" color="#1baf7a" formatValue={formatNumber} />
            <MonthlyLineChart title="売上" data={monthlySeries} valueKey="sales" color="#eda100" formatValue={formatCurrency} />
            <MonthlyLineChart title="報酬" data={monthlySeries} valueKey="reward" color="#a02b36" formatValue={formatCurrency} />
          </div>
        </div>

        <div className="weekday-report">
          <div className="report-card-title">
            <h3>曜日別パフォーマンス</h3>
            <span>全期間のレポート集計</span>
          </div>
          <p className="weekday-insight">{weekdayInsight}</p>
          <div className="report-bars" aria-label="曜日別クリックと報酬グラフ">
            {weekdayPerformance.map((day) => {
              const clickHeight = Math.max(4, (day.clicks / weekdayMaxClicks) * 100)
              const rewardHeight = Math.max(4, (day.reward / weekdayMaxReward) * 100)
              return (
                <div className="report-day" key={day.index}>
                  <div className="bar-pair">
                    <i className="weekday-click-bar" style={{ height: `${clickHeight}%` }} />
                    <i className="weekday-reward-bar" style={{ height: `${rewardHeight}%` }} />
                  </div>
                  <span>{day.label}</span>
                </div>
              )
            })}
          </div>
          <div className="chart-legend">
            <span><i className="weekday-click-bar" />クリック</span>
            <span><i className="weekday-reward-bar" />報酬</span>
          </div>
        </div>

        <div className="report-table-card">
          <div className="report-card-title">
            <h3>日別レポート履歴</h3>
            <a href="https://affiliate.rakuten.co.jp/report/summary?l-id=af_header_mypage_02" target="_blank" rel="noreferrer">楽天公式レポート</a>
          </div>
          <div className="report-table">
            <div className="report-table-head">
              <span>日付</span>
              <span>クリック</span>
              <span>注文</span>
              <span>売上</span>
              <span>報酬</span>
              <span>メモ</span>
            </div>
            {sortedReports.map((report) => (
              <div className="report-table-row" key={report.id}>
                <time>{report.date}</time>
                <span>{formatNumber(toNumber(report.clicks))}</span>
                <span>{formatNumber(toNumber(report.orders))}</span>
                <span>{formatCurrency(toNumber(report.sales))}</span>
                <strong>{formatCurrency(toNumber(report.reward))}</strong>
                <span>{report.memo || '未入力'}</span>
              </div>
            ))}
            {sortedReports.length === 0 && <p className="empty-text">まだレポート記録がありません。下の日次レポートから入力してください。</p>}
          </div>
        </div>
      </section>

      <section className="roi-section" id="roi-analysis" aria-label="商品別・チャネル別ROI分析">
        <div className="report-card-title">
          <div>
            <p className="eyebrow">ROI analysis</p>
            <h2>商品別・チャネル別ROI</h2>
            <p>{roiInsight}</p>
          </div>
        </div>

        <div className="roi-table-card">
          <div className="report-card-title">
            <h3>商品別ROI</h3>
            <span>{productRoi.length}件</span>
          </div>
          <div className="roi-table product-roi-table">
            <div className="roi-table-head">
              <span>商品</span>
              <span>チャネル</span>
              <span>クリック</span>
              <span>注文</span>
              <span>報酬</span>
              <span>1クリック報酬</span>
              <span>成約率</span>
            </div>
            {productRoi.map((item) => (
              <div className="roi-table-row" key={item.id}>
                <strong>{item.productName}</strong>
                <span>{item.channel}</span>
                <span>{formatNumber(item.clicks)}</span>
                <span>{formatNumber(item.orders)}</span>
                <span>{formatCurrency(item.reward)}</span>
                <span>{formatCurrency(item.rewardPerClick)}</span>
                <span>{item.conversionRate.toFixed(1)}%</span>
              </div>
            ))}
            {productRoi.length === 0 && (
              <p className="empty-text">クリック獲得ツールで投稿結果(クリック/注文/報酬)を入力すると、商品別ROIが表示されます。</p>
            )}
          </div>
        </div>

        <div className="roi-table-card">
          <div className="report-card-title">
            <h3>チャネル別ROI</h3>
            <span>{channelRoi.length}件</span>
          </div>
          <div className="roi-table channel-roi-table">
            <div className="roi-table-head">
              <span>チャネル</span>
              <span>クリック</span>
              <span>注文</span>
              <span>報酬</span>
              <span>1クリック報酬</span>
              <span>成約率</span>
              <span>件数</span>
            </div>
            {channelRoi.map((item) => (
              <div className="roi-table-row" key={item.channel}>
                <strong>{item.channel}</strong>
                <span>{formatNumber(item.clicks)}</span>
                <span>{formatNumber(item.orders)}</span>
                <span>{formatCurrency(item.reward)}</span>
                <span>{formatCurrency(item.rewardPerClick)}</span>
                <span>{item.conversionRate.toFixed(1)}%</span>
                <span>{formatNumber(item.productCount + item.contentCount)}</span>
              </div>
            ))}
            {channelRoi.length === 0 && (
              <p className="empty-text">まだチャネル別の実績データがありません。</p>
            )}
          </div>
        </div>
      </section>

      <section className="click-studio" id="click-studio">
        <div className="studio-heading">
          <div>
            <p className="eyebrow">Zero click rescue</p>
            <h2>クリックされるROOM投稿を作る</h2>
            <p>商品別リンクと「誰の、どんな悩みを解決するか」を揃え、読む人が次の行動を判断できる投稿にします。</p>
          </div>
          <div className="post-score" aria-label={`投稿準備 ${postScore}項目完了`}>
            <strong>{postScore}<span>/6</span></strong>
            <small>{postScore >= 5 ? '投稿準備OK' : '不足項目を入力'}</small>
          </div>
        </div>

        <div className="studio-grid">
          <form className="post-builder" onSubmit={(event) => event.preventDefault()}>
            <label>商品名<input value={postDraft.productName} onChange={(event) => updatePostDraft('productName', event.target.value)} placeholder="例: 軽量コードレス掃除機" /></label>
            <label>商品別アフィリエイトURL<input type="url" value={postDraft.productLink} onChange={(event) => updatePostDraft('productLink', event.target.value)} placeholder="楽天の商品ページから作成したリンク" /></label>
            {postLinkReady && isGenericRakutenLink(postDraft.productLink) && <p className="link-warning">楽天市場トップへの汎用リンクです。紹介する商品の個別ページからリンクを作り直してください。</p>}
            <label>誰向け<input value={postDraft.audience} onChange={(event) => updatePostDraft('audience', event.target.value)} placeholder="例: 忙しい一人暮らしの方" /></label>
            <label>悩み<input value={postDraft.problem} onChange={(event) => updatePostDraft('problem', event.target.value)} placeholder="例: 毎日の床掃除が面倒" /></label>
            <label>使うメリット<textarea value={postDraft.benefit} onChange={(event) => updatePostDraft('benefit', event.target.value)} placeholder="例: 軽くて片手で扱え、気づいた時にすぐ掃除できます" /></label>
            <label>実感・選んだ根拠<textarea value={postDraft.proof} onChange={(event) => updatePostDraft('proof', event.target.value)} placeholder="実際に確認できた仕様や、自分の正直な感想" /></label>
            <label>価格・季節の一押し<input value={postDraft.priceHook} onChange={(event) => updatePostDraft('priceHook', event.target.value)} placeholder="例: クーポン対象。最新価格は商品ページで確認" /></label>
            <label>ハッシュタグ<input value={postDraft.hashtags} onChange={(event) => updatePostDraft('hashtags', event.target.value)} /></label>
          </form>

          <aside className="post-preview">
            <div className="preview-topline"><span>ROOM投稿プレビュー</span><strong>{generatedPost.length}文字</strong></div>
            <textarea readOnly value={generatedPost} aria-label="生成されたROOM投稿文" />
            <div className="preview-actions">
              <button type="button" onClick={copyPost}>投稿文をコピー</button>
              <a className={!postLinkReady ? 'disabled-link' : ''} href={postLinkReady ? postDraft.productLink : undefined} target="_blank" rel="noreferrer sponsored">商品リンクを確認</a>
            </div>
            {copyMessage && <p className="copy-message" role="status">{copyMessage}</p>}
            <div className="post-checklist">
              {postScoreItems.map(([done, label]) => <span className={done ? 'done' : ''} key={label}>{done ? '✓' : '○'} {label}</span>)}
            </div>
            <p className="disclosure-note">価格や在庫は変動します。未確認の効果を断定せず、実際に確認できた情報だけを使ってください。</p>
          </aside>
        </div>
      </section>

      <section className="automation-section" aria-label="半自動運用">
        <article className="automation-panel">
          <div>
            <p className="eyebrow">Semi autopilot</p>
            <h2>自動で診断し、実行は手動確認する</h2>
            <p>
              成約率、1クリックあたり報酬、成果が出ている記事、クリックだけ多い記事を見て、
              今日やるべき改善を未完了タスクへ追加します。楽天ROOMへの投稿、いいね、フォローは自動実行せず、あなたが確認して進めます。
            </p>
            <span className="automation-message">{automationMessage}</span>
          </div>
          <div className="automation-actions">
            <label className="toggle-row">
              <input type="checkbox" checked={autopilot} onChange={(event) => setAutopilot(event.target.checked)} />
              半自動モードをオンにする
            </label>
            <button type="button" onClick={runAutomation}>今すぐ自動生成</button>
          </div>
        </article>

        <article className="today-panel">
          <div className="panel-heading">
            <p className="eyebrow">Today</p>
            <h2>今日やる3つ</h2>
          </div>
          <ol className="today-list">
            {todayTasks.map((task) => (
              <li key={task.id}>
                <strong>{task.title}</strong>
                <span>{task.channel} / 効果 {task.impact}</span>
              </li>
            ))}
            {todayTasks.length === 0 && <li>未完了タスクはありません。自動生成を押すと候補を作れます。</li>}
          </ol>
        </article>
      </section>

      <section className="automation-truth">
        <article>
          <span>自動で動く</span>
          <strong>原因診断・タスク生成・投稿文作成・進捗管理</strong>
          <p>入力されたレポート、投稿ビルダー、ROOMキューをもとに改善案を作ります。</p>
        </article>
        <article>
          <span>手動確認が必要</span>
          <strong>投稿公開・いいね・フォロー・商品購入ページ確認</strong>
          <p>楽天側の操作を勝手に連打するRPAではありません。規約違反やアカウント制限を避けるため、最終操作は人が確認します。</p>
        </article>
      </section>

      <section className="affiliate-section">
        <article className="affiliate-panel">
          <div>
            <p className="eyebrow">Affiliate link</p>
            <h2>あなたの楽天リンクを使う</h2>
            <p>
              楽天アフィリエイトで作ったリンクを保存して、ROOM運用・記事改善・SNS再投稿の共通導線として使います。
            </p>
            <span className={`link-status ${affiliateReady ? 'ready' : ''}`}>
              {affiliateReady ? 'リンク設定済み' : 'リンク未設定'}
            </span>
          </div>
          <form className="affiliate-form" onSubmit={saveAffiliateSettings}>
            <input
              type="url"
              value={affiliateForm.affiliateLink}
              onChange={(event) => setAffiliateForm({ ...affiliateForm, affiliateLink: event.target.value })}
              placeholder="楽天アフィリエイトで作成したURL"
            />
            <input
              value={affiliateForm.campaignName}
              onChange={(event) => setAffiliateForm({ ...affiliateForm, campaignName: event.target.value })}
              placeholder="導線名"
            />
            <input
              value={affiliateForm.targetMemo}
              onChange={(event) => setAffiliateForm({ ...affiliateForm, targetMemo: event.target.value })}
              placeholder="使う場所のメモ"
            />
            <button type="submit">保存</button>
            <a
              className={!affiliateReady ? 'disabled-link' : ''}
              href={affiliateReady ? affiliateSettings.affiliateLink : undefined}
              target="_blank"
              rel="noreferrer sponsored"
            >
              リンクを開く
            </a>
          </form>
        </article>
      </section>

      <section className="workspace-grid" id="today-work">
        <article className="tool-panel">
          <div className="panel-heading">
            <p className="eyebrow">Daily report</p>
            <h2>日次レポートを記録</h2>
          </div>
          <label className="csv-import">
            楽天アフィリエイトのCSVを取り込む
            <input type="file" accept=".csv,text/csv" onChange={importReportsCsv} />
          </label>
          {csvImportMessage && <p className="form-status" role="status">{csvImportMessage}</p>}
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
                  <span>{task.channel} / 効果 {task.impact}{task.source ? ` / ${task.source === 'auto' ? '自動' : task.source === 'rescue' ? '対策' : task.source === 'boost' ? '改善' : task.source === 'auto-improve' ? '自動改善' : task.source === 'click-campaign' ? 'クリック獲得' : task.source}` : ''}</span>
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

      <section className="room-section">
        <div className="panel-heading">
          <p className="eyebrow">ROOM safe pilot</p>
          <h2>ROOM REPEAT改良版</h2>
        </div>
        <div className="room-summary">
          <article>
            <span>稼働中</span>
            <strong>{roomStats.running}</strong>
          </article>
          <article>
            <span>今日の実行上限</span>
            <strong>{formatNumber(roomStats.totalLimit)}</strong>
          </article>
          <article>
            <span>確認済み</span>
            <strong>{formatNumber(roomStats.doneTotal)}</strong>
          </article>
        </div>
        <form className="room-form" onSubmit={addRoomFlow}>
          <select value={roomForm.mode} onChange={(event) => setRoomForm({ ...roomForm, mode: event.target.value })}>
            {roomModes.map((mode) => (
              <option value={mode.value} key={mode.value}>{mode.label}</option>
            ))}
          </select>
          <input value={roomForm.keyword} onChange={(event) => setRoomForm({ ...roomForm, keyword: event.target.value })} placeholder="キーワード、ジャンル、商品テーマ" />
          <input type="number" min="1" max="100" value={roomForm.maxActions} onChange={(event) => setRoomForm({ ...roomForm, maxActions: event.target.value })} aria-label="最大確認数" />
          <input type="number" min="3" max="120" value={roomForm.spanMinutes} onChange={(event) => setRoomForm({ ...roomForm, spanMinutes: event.target.value })} aria-label="間隔分" />
          <input value={roomForm.memo} onChange={(event) => setRoomForm({ ...roomForm, memo: event.target.value })} placeholder="運用メモ" />
          <button type="submit">キュー追加</button>
        </form>
        <div className="mode-help">
          {roomModes.map((mode) => (
            <span key={mode.value}>{mode.label}: {mode.hint}</span>
          ))}
        </div>
        <div className="room-flow-list">
          {roomFlows.map((flow) => {
            const progress = toNumber(flow.maxActions) ? Math.round((toNumber(flow.doneCount) / toNumber(flow.maxActions)) * 100) : 0
            return (
              <article className="room-flow" key={flow.id}>
                <div>
                  <span className={`status-pill ${flow.status}`}>{flow.status}</span>
                  <h3>{roomModeLabel(flow.mode)} / {flow.keyword}</h3>
                  <p>{flow.memo || affiliateSettings.targetMemo || 'メモなし'}</p>
                </div>
                <div className="room-progress">
                  <div>
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <strong>{formatNumber(flow.doneCount)} / {formatNumber(flow.maxActions)}</strong>
                  <small>{flow.spanMinutes}分間隔 / 次回 {flow.nextAt}</small>
                </div>
                <div className="room-actions">
                  <button type="button" onClick={() => startRoomFlow(flow.id)}>開始</button>
                  <button type="button" onClick={() => completeRoomStep(flow.id)}>1件確認</button>
                  <a
                    className={!affiliateReady ? 'disabled-link' : ''}
                    href={affiliateReady ? affiliateSettings.affiliateLink : undefined}
                    target="_blank"
                    rel="noreferrer sponsored"
                  >
                    リンク
                  </a>
                  <button type="button" onClick={() => pauseRoomFlow(flow.id)}>停止</button>
                  <button type="button" onClick={() => deleteRoomFlow(flow.id)}>削除</button>
                </div>
              </article>
            )
          })}
        </div>
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
