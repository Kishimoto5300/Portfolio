import { CONTEXT_VIEWS, MEETING_OPTIONS } from './constants.js'

export function TaskFields({
  title,
  meeting,
  memo,
  dueAt,
  context,
  meetingName,
  showContext,
  onTitle,
  onMeeting,
  onMemo,
  onDueAt,
  onContext,
}) {
  return (
    <>
      <input
        className="add-title"
        value={title}
        onChange={(event) => onTitle(event.target.value)}
        placeholder="タスクを追加"
        aria-label="タスクのタイトル"
        required
      />
      <div className="add-options">
        {showContext ? (
          <label className="add-field">
            状況
            <select
              value={context}
              onChange={(event) => onContext(event.target.value)}
              aria-label="状況"
            >
              {CONTEXT_VIEWS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="add-field">
          期限
          <input
            type="date"
            value={dueAt}
            onChange={(event) => onDueAt(event.target.value)}
          />
        </label>
        <div className="add-meeting" role="radiogroup" aria-label="形式">
          <span>形式</span>
          {MEETING_OPTIONS.map((option) => (
            <label key={option.id || 'none'}>
              <input
                type="radio"
                name={meetingName}
                value={option.id}
                checked={meeting === option.id}
                onChange={(event) => onMeeting(event.target.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
      <input
        className="add-memo"
        value={memo}
        onChange={(event) => onMemo(event.target.value)}
        placeholder="メモ（移動手段など、任意）"
        aria-label="メモ"
      />
    </>
  )
}
