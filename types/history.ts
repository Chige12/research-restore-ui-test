import { HastNode } from 'hast-util-from-dom/lib'
import { DiffAndInfos, Diffs } from '~/types/diffs'
import { EventInfo, EVENT_TYPES } from '~/types/event'
import { DiffWithBreadcrumbsPath } from '~/utils/createDiffs/breadcrumbs'
import { newRootElement } from '~/utils/getNewRootPathElements'

export type HastHistory = {
  type: EVENT_TYPES
  hast: HastNode
  eventInfo?: EventInfo | undefined
}

export type FromAndToHastHistory = {
  from: HastHistory
  to: HastHistory
  diffs?: Diffs
  diffAndInfos?: DiffAndInfos
}

export type EventHistory = {
  oldFormat: { to: HastNode }
  eventInfo: EventInfo
  to: newRootElement
  from: newRootElement
  diffs: Diffs
  diffsWithbreadcrumbsPaths: DiffWithBreadcrumbsPath
}

export type HistoryAndFileData = {
  fileName: string
  index: number
  history: EventHistory
  bitId?: number
}

export type HistoriesAndFileData = {
  fileName: string
  index: number
  histories: EventHistory[]
}

export type HistoriesByFile = HistoriesAndFileData[]
