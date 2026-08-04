import test from 'node:test'
import assert from 'node:assert/strict'
import { parseRakutenReportCsv } from '../src/lib/rakutenReportCsv.js'

test('楽天レポートCSVの日本語列を数値化する', () => {
  const rows = parseRakutenReportCsv('日付,クリック数,売上件数,売上金額,成果報酬\n2026/08/01,9,0,"0円",0')
  assert.deepEqual(rows[0], {
    id: 'csv-0-2026/08/01', date: '2026-08-01', period: 'CSV記載日', clicks: 9,
    orders: 0, sales: 0, reward: 0, source: '楽天レポートCSV', memo: '',
  })
})

test('必須列がなければ取り込まない', () => {
  assert.throws(() => parseRakutenReportCsv('日付,クリック数\n2026/08/01,9'), /必須列/)
})

test('引用符内のカンマを処理する', () => {
  const rows = parseRakutenReportCsv('date,clicks,orders,sales,reward\n2026-08-01,"1,234",2,"10,000",200')
  assert.equal(rows[0].clicks, 1234)
  assert.equal(rows[0].sales, 10000)
})
