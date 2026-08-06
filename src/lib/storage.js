const LEGACY_KEYS = [
  'task-dashboard.rakutenReports',
  'task-dashboard.rakutenTasks',
  'task-dashboard.rakutenContent',
  'task-dashboard.rakutenAutopilot',
  'task-dashboard.roomFlows',
  'task-dashboard.rakutenAffiliateSettings',
]

const pendingWrites = new Map()
let pendingTimer = null

export function scheduleStorageWrite(key, value, storage = window.localStorage, delay = 150) {
  pendingWrites.set(key, { serialized: JSON.stringify(value), storage })
  if (pendingTimer) clearTimeout(pendingTimer)
  pendingTimer = setTimeout(flushScheduledStorage, delay)
}

export function flushScheduledStorage() {
  if (pendingTimer) clearTimeout(pendingTimer)
  const startedAt = performance.now()
  for (const [key, pending] of pendingWrites) pending.storage.setItem(key, pending.serialized)
  const metric = { durationMs: performance.now() - startedAt, writes: pendingWrites.size }
  pendingWrites.clear()
  pendingTimer = null
  if (typeof window !== 'undefined') window.dispatchEvent?.(new CustomEvent('rakuafi:storage-write', { detail: metric }))
  return metric
}

export function readDashboardStorage(key, fallback, storage = window.localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(key))
    if (!parsed || !Array.isArray(parsed.reports)) return fallback
    return {
      reports: parsed.reports.filter((report) => !String(report.id).startsWith('sample-')),
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks.filter((task) => !/^task-[1-4]$/.test(task.id)) : [],
      contents: Array.isArray(parsed.contents) ? parsed.contents.filter((item) => !String(item.id).startsWith('content-')) : [],
      affiliateSettings: parsed.affiliateSettings || fallback.affiliateSettings,
    }
  } catch {
    return fallback
  }
}

export function createStorageScheduler({ storage, delay = 150, onWrite = () => {} }) {
  let timer = null
  let pending = null
  let legacyRemoved = false
  const flush = () => {
    if (!pending) return null
    const { key, value } = pending
    pending = null
    if (timer) clearTimeout(timer)
    timer = null
    const serialized = JSON.stringify(value)
    const bytes = new TextEncoder().encode(serialized).byteLength
    const startedAt = performance.now()
    storage.setItem(key, serialized)
    if (!legacyRemoved) {
      for (const legacyKey of LEGACY_KEYS) storage.removeItem(legacyKey)
      legacyRemoved = true
    }
    const metric = { durationMs: performance.now() - startedAt, bytes }
    onWrite(metric)
    return metric
  }
  return {
    schedule(key, value) {
      pending = { key, value }
      if (timer) clearTimeout(timer)
      timer = setTimeout(flush, delay)
    },
    flush,
    cancel() {
      if (timer) clearTimeout(timer)
      timer = null
    },
  }
}
