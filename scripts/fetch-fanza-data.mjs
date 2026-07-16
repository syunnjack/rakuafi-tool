import { readFile, writeFile } from 'node:fs/promises'

const DATA_PATH = new URL('../src/data/actresses.json', import.meta.url)
const API_URL = 'https://api.dmm.com/affiliate/v3/ItemList'

const apiId = process.env.FANZA_API_ID || process.env.DMM_API_ID
const affiliateId = process.env.FANZA_AFFILIATE_ID || process.env.DMM_AFFILIATE_ID
const keywords = (process.env.FANZA_KEYWORDS || '三上悠亜,明日花キララ,深田えいみ,高橋しょう子')
  .split(',')
  .map((keyword) => keyword.trim())
  .filter(Boolean)

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function normalizeItem(item, fallbackKeyword) {
  const actors = item.iteminfo?.actress || item.iteminfo?.actor || []
  const makers = item.iteminfo?.maker || []
  const genres = item.iteminfo?.genre || []
  const actorName = actors[0]?.name || fallbackKeyword

  return {
    name: actorName,
    work: item.title || 'FANZA掲載作品',
    code: item.content_id || item.product_id || item.dmm_id || actorName,
    maker: makers[0]?.name || item.service_name || 'FANZA',
    tags: unique([
      actorName,
      item.content_id,
      makers[0]?.name,
      ...genres.slice(0, 4).map((genre) => genre.name),
    ]),
    source: 'FANZA API',
    sourceUrl: item.affiliateURL || item.URL || 'https://www.dmm.co.jp/',
  }
}

async function fetchKeyword(keyword) {
  const params = new URLSearchParams({
    api_id: apiId,
    affiliate_id: affiliateId,
    site: process.env.FANZA_API_SITE || 'FANZA',
    service: process.env.FANZA_API_SERVICE || 'digital',
    floor: process.env.FANZA_API_FLOOR || 'videoa',
    hits: process.env.FANZA_API_HITS || '10',
    sort: process.env.FANZA_API_SORT || 'rank',
    keyword,
    output: 'json',
  })

  const response = await fetch(`${API_URL}?${params}`)
  if (!response.ok) {
    throw new Error(`FANZA API request failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.result?.items || []
}

async function main() {
  if (!apiId || !affiliateId) {
    const existing = JSON.parse(await readFile(DATA_PATH, 'utf8'))
    console.log(`FANZA_API_ID/FANZA_AFFILIATE_ID are not set. Keeping ${existing.length} existing records.`)
    return
  }

  const records = []
  for (const keyword of keywords) {
    const items = await fetchKeyword(keyword)
    records.push(...items.map((item) => normalizeItem(item, keyword)))
  }

  const deduped = []
  const seen = new Set()
  for (const record of records) {
    const key = `${record.name}:${record.code}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(record)
  }

  if (deduped.length === 0) {
    throw new Error('FANZA API returned no records.')
  }

  await writeFile(DATA_PATH, `${JSON.stringify(deduped, null, 2)}\n`)
  console.log(`Wrote ${deduped.length} FANZA records to src/data/actresses.json.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
