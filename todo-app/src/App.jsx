import { useEffect, useState } from 'react'
import './App.css'
import {
  CONTEXT_LABEL,
  CONTEXT_VIEWS,
  MEETING_LABEL,
  SORTS,
  VIEWS,
} from './constants.js'
import { TaskFields } from './TaskFields.jsx'
import {
  createTask,
  draftFromTask,
  dueTone,
  emptyMessage,
  formatDue,
  sortTasks,
  visibleTasks,
} from './taskLogic.js'
import { loadTasks, saveTasks } from './storage.js'

function App() {
  const [view, setView] = useState('all')
  const [sort, setSort] = useState('created')
  const [tasks, setTasks] = useState(loadTasks)
  const [title, setTitle] = useState('')
  const [meeting, setMeeting] = useState('')
  const [memo, setMemo] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState(null)

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const shown = sortTasks(visibleTasks(tasks, view), sort)

  function changeView(next) {
    if (next !== view) cancelEdit()
    setView(next)
  }

  function patchDraft(field, value) {
    setEditDraft((current) =>
      current ? { ...current, [field]: value } : current,
    )
  }

  function toggleTask(id) {
    if (editingId === id) cancelEdit()
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== id) return task
        if (task.done) {
          return { ...task, done: false, completedAt: null }
        }
        return { ...task, done: true, completedAt: Date.now() }
      }),
    )
  }

  function startEdit(task) {
    setEditingId(task.id)
    setEditDraft(draftFromTask(task))
  }

  function cancelEdit() {
    setEditingId(null)
    setEditDraft(null)
  }

  function saveEdit(event) {
    event.preventDefault()
    if (!editDraft) return
    const trimmed = editDraft.title.trim()
    if (!trimmed) return

    setTasks((current) =>
      current.map((task) =>
        task.id === editingId
          ? {
              ...task,
              title: trimmed,
              context: editDraft.context,
              meeting: editDraft.meeting || null,
              memo: editDraft.memo.trim(),
              dueAt: editDraft.dueAt || null,
            }
          : task,
      ),
    )
    cancelEdit()
  }

  function deleteTask(id) {
    const ok = window.confirm('このタスクを削除しますか？')
    if (!ok) return
    setTasks((current) => current.filter((task) => task.id !== id))
    if (editingId === id) cancelEdit()
  }

  function addTask(event) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || view === 'all') return

    setTasks((current) => [
      ...current,
      createTask({
        title: trimmed,
        context: view,
        meeting,
        memo: memo.trim(),
        dueAt,
      }),
    ])
    setTitle('')
    setMeeting('')
    setMemo('')
    setDueAt('')
  }

  return (
    <div className="app">
      <nav className="tabs" aria-label="表示する状況">
        {VIEWS.map((item) => {
          const selected = item.id === view
          return (
            <button
              key={item.id}
              type="button"
              className={selected ? 'tab is-active' : 'tab'}
              aria-current={selected ? 'page' : undefined}
              onClick={() => changeView(item.id)}
            >
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="sorts" role="group" aria-label="並び順">
        {SORTS.map((item) => {
          const selected = item.id === sort
          return (
            <button
              key={item.id}
              type="button"
              className={selected ? 'sort is-active' : 'sort'}
              aria-pressed={selected}
              onClick={() => setSort(item.id)}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <main className="panel">
        {shown.length === 0 ? (
          <div className="empty-block">
            <p className="empty">{emptyMessage(view)}</p>
            {view === 'all' ? (
              <div className="empty-actions">
                {CONTEXT_VIEWS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="empty-action"
                    onClick={() => changeView(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <ul className="task-list">
            {shown.map((task) => (
              <li
                key={task.id}
                className={task.done ? 'task is-done' : 'task'}
              >
                <input
                  id={`task-${task.id}`}
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                />
                <div className="task-body">
                  {editingId === task.id && editDraft ? (
                    <form className="task-edit" onSubmit={saveEdit}>
                      <TaskFields
                        title={editDraft.title}
                        meeting={editDraft.meeting}
                        memo={editDraft.memo}
                        dueAt={editDraft.dueAt}
                        context={editDraft.context}
                        meetingName={`edit-meeting-${task.id}`}
                        showContext
                        onTitle={(value) => patchDraft('title', value)}
                        onMeeting={(value) => patchDraft('meeting', value)}
                        onMemo={(value) => patchDraft('memo', value)}
                        onDueAt={(value) => patchDraft('dueAt', value)}
                        onContext={(value) => patchDraft('context', value)}
                      />
                      <div className="edit-actions">
                        <button type="submit" className="add-submit">
                          保存
                        </button>
                        <button
                          type="button"
                          className="task-action"
                          onClick={cancelEdit}
                        >
                          やめる
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="task-row">
                        <label htmlFor={`task-${task.id}`} className="task-title">
                          {task.title}
                        </label>
                        {task.dueAt ? (
                          <span className={`due due-${dueTone(task.dueAt)}`}>
                            {formatDue(task.dueAt)}
                          </span>
                        ) : null}
                        {task.meeting ? (
                          <span className="marker">
                            {MEETING_LABEL[task.meeting]}
                          </span>
                        ) : null}
                        {view === 'all' ? (
                          <span className="context">
                            {CONTEXT_LABEL[task.context]}
                          </span>
                        ) : null}
                      </div>
                      {task.memo ? <p className="memo">{task.memo}</p> : null}
                      <div className="task-actions">
                        <button
                          type="button"
                          className="task-action"
                          onClick={() => startEdit(task)}
                        >
                          編集
                        </button>
                        <button
                          type="button"
                          className="task-action"
                          onClick={() => deleteTask(task.id)}
                        >
                          削除
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {view === 'all' && shown.length > 0 ? (
          <p className="add-hint">追加するときは、就活・学業・プライベートを選んでください</p>
        ) : null}

        {view === 'all' ? null : (
          <form className="add" onSubmit={addTask}>
            <TaskFields
              title={title}
              meeting={meeting}
              memo={memo}
              dueAt={dueAt}
              context={view}
              meetingName="add-meeting"
              showContext={false}
              onTitle={setTitle}
              onMeeting={setMeeting}
              onMemo={setMemo}
              onDueAt={setDueAt}
            />
            <button type="submit" className="add-submit">
              追加
            </button>
          </form>
        )}
      </main>
    </div>
  )
}

export default App
