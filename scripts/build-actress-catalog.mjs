import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const endpoint = 'https://api.dmm.com/affiliate/v3/ActressSearch'
const apiId = process.env.DMM_API_ID || process.env.FANZA_API_ID
const affiliateId = process.env.DMM_AFFILIATE_ID || process.env.FANZA_AFFILIATE_ID
const outputDir = new URL('../output/actress-catalog/', import.meta.url)
const jsonPath = new URL('actresses.json', outputDir)
const csvPath = new URL('actresses.csv', outputDir)
const metaPath = new URL('metadata.json', outputDir)
const checkpointPath = new URL('.checkpoint.json', outputDir)
const hits = Math.min(100, Math.max(1, Number(process.env.DMM_ACTRESS_HITS || 100)))
const maxPages = Math.max(1, Number(process.env.DMM_ACTRESS_MAX_PAGES || 10000))
const delayMs = Math.max(250, Number(process.env.DMM_REQUEST_DELAY_MS || 750))
const startOffset = Math.max(1, Number(process.env.DMM_START_OFFSET || 1))
const resume = process.env.DMM_RESUME !== 'false'

if (!apiId || !affiliateId) {
  console.error('DMM_API_ID and DMM_AFFILIATE_ID are required. Copy .env.example to .env.local and keep it private.')
  process.exit(1)
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const text = (value) => value == null ? '' : String(value).trim()
const csvCell = (value) => `"${text(value).replaceAll('"', '""')}"`

async function readJson(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')) } catch { return fallback }
}

async function atomicJson(path, value) {
  const temp = new URL(`${path.pathname}.tmp`, path)
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temp, path)
}

function normalize(item) {
  const id = text(item.id)
  return {
    id,
    name: text(item.name),
    ruby: text(item.ruby),
    birthday: text(item.birthday),
    age: Number(item.age) || null,
    height: Number(item.height) || null,
    bust: Number(item.bust) || null,
    cup: text(item.cup),
    waist: Number(item.waist) || null,
    hip: Number(item.hip) || null,
    prefecture: text(item.prefectures),
    officialUrl: text(item.listURL || item.URL),
    source: 'DMM Affiliate API v3 ActressSearch',
    observedAt: new Date().toISOString(),
  }
}

async function fetchPage(offset, attempt = 0) {
  const params = new URLSearchParams({ api_id: apiId, affiliate_id: affiliateId, hits: String(hits), offset: String(offset), output: 'json' })
  try {
    const response = await fetch(`${endpoint}?${params}`, { headers: { accept: 'application/json' } })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const body = await response.json()
    if (body.result?.status && body.result.status !== 200) throw new Error(`API ${body.result.status}: ${body.result.message || 'unknown error'}`)
    return body
  } catch (error) {
    if (attempt >= 4) throw error
    const backoff = delayMs * (2 ** attempt)
    console.warn(`offset ${offset} failed; retrying in ${backoff}ms (${error.message})`)
    await wait(backoff)
    return fetchPage(offset, attempt + 1)
  }
}

await mkdir(outputDir, { recursive: true })
const existing = resume ? await readJson(jsonPath, []) : []
const byId = new Map(existing.filter((row) => row.id).map((row) => [String(row.id), row]))
const checkpoint = resume ? await readJson(checkpointPath, null) : null
let offset = Math.max(startOffset, Number(checkpoint?.nextOffset) || startOffset)
let pages = 0
let totalCount = null

while (pages < maxPages) {
  const body = await fetchPage(offset)
  const rows = body.result?.actress || []
  totalCount = Number(body.result?.total_count) || totalCount
  for (const item of rows) {
    const record = normalize(item)
    if (record.id && record.name) byId.set(record.id, { ...byId.get(record.id), ...record })
  }
  pages += 1
  offset += rows.length
  const records = [...byId.values()].sort((a, b) => a.ruby.localeCompare(b.ruby, 'ja') || a.name.localeCompare(b.name, 'ja'))
  await atomicJson(jsonPath, records)
  await atomicJson(checkpointPath, { nextOffset: offset, pagesFetched: pages, records: records.length, totalCount, updatedAt: new Date().toISOString() })
  console.log(`page=${pages} offset=${offset} records=${records.length} total=${totalCount ?? '?'}`)
  if (rows.length < hits || (totalCount && offset > totalCount)) break
  await wait(delayMs)
}

const records = [...byId.values()].sort((a, b) => a.ruby.localeCompare(b.ruby, 'ja') || a.name.localeCompare(b.name, 'ja'))
const columns = ['id','name','ruby','birthday','age','height','bust','cup','waist','hip','prefecture','officialUrl','source','observedAt']
const csv = [`\uFEFF${columns.map(csvCell).join(',')}`, ...records.map((row) => columns.map((key) => csvCell(row[key])).join(','))].join('\r\n')
await writeFile(csvPath, `${csv}\r\n`, 'utf8')
const digest = createHash('sha256').update(JSON.stringify(records)).digest('hex')
await atomicJson(metaPath, { schemaVersion: 2, generatedAt: new Date().toISOString(), source: endpoint, officialApiOnly: true, records: records.length, totalCount, pagesFetched: pages, startOffset, nextOffset: offset, sha256: digest, fields: columns })
console.log(`Completed: ${records.length} actresses -> ${jsonPath.pathname} and ${csvPath.pathname}`)
