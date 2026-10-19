export const STORAGE_KEY = 'my-app_exam.tasks'

/** 全体はカテゴリではなく、表示用の視点。データ上の所属は job / study / private のみ。 */
export const VIEWS = [
  { id: 'all', label: '全体' },
  { id: 'job', label: '就活' },
  { id: 'study', label: '学業' },
  { id: 'private', label: 'プライベート' },
]

export const CONTEXT_VIEWS = VIEWS.filter((item) => item.id !== 'all')
export const CONTEXT_IDS = new Set(CONTEXT_VIEWS.map((item) => item.id))

export const SORTS = [
  { id: 'created', label: '追加した順' },
  { id: 'due', label: '期限が近い順' },
]

export const CONTEXT_LABEL = {
  job: '就活',
  study: '学業',
  private: 'プライベート',
}

export const MEETING_LABEL = {
  online: 'オンライン',
  'in-person': '対面',
}

export const MEETING_OPTIONS = [
  { id: '', label: '指定なし' },
  { id: 'online', label: 'オンライン' },
  { id: 'in-person', label: '対面' },
]

export const MEETING_IDS = new Set(['online', 'in-person'])

/** 「迫っている」とみなす日数。期限切れはこれより前、日付なしは期限順の一番下。 */
export const SOON_DAYS = 3
