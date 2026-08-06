const aliases = {
  date: ['日付', '年月日', 'date'],
  clicks: ['クリック数', 'クリック', 'clicks'],
  orders: ['売上件数', '注文件数', '注文数', 'orders'],
  sales: ['売上金額', '売上', 'sales'],
  reward: ['成果報酬', '報酬', '確定報酬', 'reward'],
}

function parseRows(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index]
    if (character === '"' && quoted && normalized[index + 1] === '"') {
      field += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(field.trim())
      field = ''
    } else if (character === '\n' && !quoted) {
      row.push(field.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }
  row.push(field.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows
}

function normalizeHeader(value) {
  return value.toLowerCase().replace(/[\s　()（）_-]/g, '')
}

function numberValue(value, label, rowNumber) {
  const normalized = String(value ?? '').replace(/[¥￥,円件\s]/g, '')
  const result = Number(normalized)
  if (!Number.isFinite(result) || result < 0) throw new Error(`${rowNumber}行目の${label}が数値ではありません`)
  return result
}

export function parseRakutenReportCsv(text) {
  const rows = parseRows(text)
  if (rows.length < 2) throw new Error('見出しとデータ行が必要です')
  const headers = rows[0].map(normalizeHeader)
  const positions = Object.fromEntries(Object.entries(aliases).map(([key, names]) => {
    const index = headers.findIndex((header) => names.map(normalizeHeader).includes(header))
    if (index < 0) throw new Error(`必須列「${names[0]}」がありません`)
    return [key, index]
  }))
  return rows.slice(1).map((row, index) => {
    const date = row[positions.date]
    if (!/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(date)) throw new Error(`${index + 2}行目の日付形式を確認してください`)
    return {
      id: `csv-${index}-${date}`,
      date: date.replaceAll('/', '-'),
      period: 'CSV記載日',
      clicks: numberValue(row[positions.clicks], 'クリック数', index + 2),
      orders: numberValue(row[positions.orders], '売上件数', index + 2),
      sales: numberValue(row[positions.sales], '売上金額', index + 2),
      reward: numberValue(row[positions.reward], '成果報酬', index + 2),
      source: '楽天レポートCSV',
      memo: '',
    }
  })
}
