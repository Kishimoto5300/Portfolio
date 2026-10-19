import { CONTEXT_IDS, MEETING_IDS, SOON_DAYS } from './constants.js'

export function parseDay(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function daysUntil(iso) {
  const due = parseDay(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86400000)
}

export function dueTone(iso) {
  const remaining = daysUntil(iso)
  if (remaining < 0) return 'overdue'
  if (remaining <= SOON_DAYS) return 'soon'
  return 'later'
}

export function formatDue(iso) {
  const remaining = daysUntil(iso)
  if (remaining < 0) return '期限切れ'
  if (remaining === 0) return '今日'
  if (remaining === 1) return '明日'
  const date = parseDay(iso)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function emptyMessage(view) {
  if (view === 'all') {
    return 'どの状況のタスクを追加しますか'
  }
  return 'まだタスクはありません'
}

export function normalizeTask(task) {
  if (!task || typeof task !== 'object') return null
  if (typeof task.id !== 'string' || typeof task.title !== 'string') return null
  if (!CONTEXT_IDS.has(task.context)) return null

  return {
    id: task.id,
    title: task.title,
    context: task.context,
    done: Boolean(task.done),
    completedAt: typeof task.completedAt === 'number' ? task.completedAt : null,
    meeting: MEETING_IDS.has(task.meeting) ? task.meeting : null,
    memo: typeof task.memo === 'string' ? task.memo : '',
    dueAt: typeof task.dueAt === 'string' && task.dueAt ? task.dueAt : null,
    createdAt: typeof task.createdAt === 'number' ? task.createdAt : 0,
  }
}

export function visibleTasks(tasks, view) {
  if (view === 'all') return tasks
  return tasks.filter((task) => task.context === view)
}

export function sortOpenTasks(tasks, sort) {
  const copy = [...tasks]
  if (sort === 'created') {
    copy.sort((a, b) => a.createdAt - b.createdAt)
    return copy
  }

  const dated = copy
    .filter((task) => task.dueAt)
    .sort((a, b) => {
      const byDue = a.dueAt.localeCompare(b.dueAt)
      if (byDue !== 0) return byDue
      return a.createdAt - b.createdAt
    })
  const undated = copy
    .filter((task) => !task.dueAt)
    .sort((a, b) => a.createdAt - b.createdAt)
  return [...dated, ...undated]
}

export function sortTasks(tasks, sort) {
  const open = sortOpenTasks(
    tasks.filter((task) => !task.done),
    sort,
  )
  const done = [...tasks.filter((task) => task.done)].sort(
    (a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0),
  )
  return [...open, ...done]
}

export function draftFromTask(task) {
  return {
    title: task.title,
    meeting: task.meeting ?? '',
    memo: task.memo,
    dueAt: task.dueAt ?? '',
    context: task.context,
  }
}

export function createTask({ title, context, meeting, memo, dueAt }) {
  return {
    id: crypto.randomUUID(),
    title,
    context,
    done: false,
    completedAt: null,
    meeting: meeting || null,
    memo,
    dueAt: dueAt || null,
    createdAt: Date.now(),
  }
}
