import { DataHistory } from '../createDiffs/breadcrumbs'
import { Diffs } from '../recording/diffTypes'

export type EventHistory = {
  name: string
  index: number
  history: DataHistory
}

export type EventHistoryWithBitId = EventHistory & {
  bitId: number
}

export type CombinationList = EventHistoryWithBitId[][]

export type DiffsDiffs = {
  diffsDiffs: Diffs
  diffsWithbreadcrumbsPathsDiffs: Diffs
}
