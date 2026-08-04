import { performance } from 'node:perf_hooks'
import { flushScheduledStorage, scheduleStorageWrite } from '../src/lib/storage.js'

const reports = Array.from({ length: 200 }, (_, index) => ({
  id: `report-${index}`, date: '2026-08-01', clicks: index, orders: 0, sales: 0, reward: 0,
}))
const tasks = Array.from({ length: 200 }, (_, index) => ({ id: `task-${index}`, title: `task ${index}`, done: false }))
const state = { reports, tasks, contents: reports, affiliateSettings: { affiliateLink: '', campaignName: '', targetMemo: '' } }

function storageMock() {
  let writes = 0
  return { setItem() { writes += 1 }, removeItem() {}, get writes() { return writes } }
}

function median(values) {
  const ordered = [...values].sort((a, b) => a - b)
  return ordered[Math.floor(ordered.length / 2)]
}

const runs = 1000
const updatesPerBurst = 10
const legacyDurations = []
const batchedDurations = []
for (let index = 0; index < runs; index += 1) {
  const legacyStorage = storageMock()
  let startedAt = performance.now()
  for (let update = 0; update < updatesPerBurst; update += 1) {
    legacyStorage.setItem('reports', JSON.stringify(state.reports))
    legacyStorage.setItem('tasks', JSON.stringify(state.tasks))
    legacyStorage.setItem('contents', JSON.stringify(state.contents))
    legacyStorage.setItem('settings', JSON.stringify(state.affiliateSettings))
    legacyStorage.setItem('room', JSON.stringify([]))
    legacyStorage.setItem('autopilot', JSON.stringify(true))
  }
  legacyDurations.push(performance.now() - startedAt)

  const batchedStorage = storageMock()
  for (let update = 0; update < updatesPerBurst; update += 1) {
    scheduleStorageWrite('reports', state.reports, batchedStorage, 10_000)
    scheduleStorageWrite('tasks', state.tasks, batchedStorage, 10_000)
    scheduleStorageWrite('contents', state.contents, batchedStorage, 10_000)
    scheduleStorageWrite('settings', state.affiliateSettings, batchedStorage, 10_000)
    scheduleStorageWrite('room', [], batchedStorage, 10_000)
    scheduleStorageWrite('autopilot', true, batchedStorage, 10_000)
  }
  startedAt = performance.now()
  flushScheduledStorage()
  batchedDurations.push(performance.now() - startedAt)
  if (legacyStorage.writes !== 60 || batchedStorage.writes !== 6) throw new Error('write count mismatch')
}

console.log(JSON.stringify({
  runs,
  updatesPerBurst,
  recordsPerCollection: 200,
  before: { writesPerBurst: 60, medianMs: Number(median(legacyDurations).toFixed(4)) },
  after: { writesPerBurst: 6, medianMs: Number(median(batchedDurations).toFixed(4)) },
}, null, 2))
