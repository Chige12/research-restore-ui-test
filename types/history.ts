import { HastNode } from 'hast-util-from-dom/lib'
import { DiffWithBreadcrumbsPath } from '~/utils/createDiffs/breadcrumbs'
import { newRootElement } from '~/utils/getNewRootPathElements'
import { Diffs } from '~/utils/recording/diffTypes'
import { EventInfo } from '~/utils/recording/eventTypes'

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
