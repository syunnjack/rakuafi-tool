import test from 'node:test'
import assert from 'node:assert/strict'
import { createStorageScheduler, flushScheduledStorage, readDashboardStorage, scheduleStorageWrite } from '../src/lib/storage.js'

function memoryStorage() {
  const data = new Map()
  let writes = 0
  return {
    get writes() { return writes },
    getItem: (key) => data.get(key) ?? null,
    setItem(key, value) { writes += 1; data.set(key, value) },
    removeItem: (key) => data.delete(key),
  }
}

test('連続更新を1回の同期書き込みにまとめる', () => {
  const storage = memoryStorage()
  const scheduler = createStorageScheduler({ storage, delay: 10_000 })
  scheduler.schedule('dashboard', { reports: [1] })
  scheduler.schedule('dashboard', { reports: [1, 2] })
  const metric = scheduler.flush()
  assert.equal(storage.writes, 1)
  assert.ok(metric.durationMs >= 0)
  assert.ok(metric.bytes > 0)
})

test('同じキーの連続した画面更新を最後の1回だけ保存する', () => {
  const storage = memoryStorage()
  scheduleStorageWrite('reports', [1], storage, 10_000)
  scheduleStorageWrite('reports', [1, 2], storage, 10_000)
  const metric = flushScheduledStorage()
  assert.equal(storage.writes, 1)
  assert.equal(metric.writes, 1)
  assert.equal(storage.getItem('reports'), '[1,2]')
})

test('架空の旧サンプル値を復元しない', () => {
  const storage = memoryStorage()
  storage.setItem('dashboard', JSON.stringify({
    reports: [{ id: 'sample-1' }, { id: 'real-1' }], tasks: [{ id: 'task-1' }],
    contents: [{ id: 'content-1' }], affiliateSettings: {},
  }))
  const result = readDashboardStorage('dashboard', {}, storage)
  assert.deepEqual(result.reports, [{ id: 'real-1' }])
  assert.deepEqual(result.tasks, [])
  assert.deepEqual(result.contents, [])
})
