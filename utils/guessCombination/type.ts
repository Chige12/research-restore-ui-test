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

export type DiffsDiffs = {
  diffsDiffs: Diffs
  diffsWithbreadcrumbsPathsDiffs: Diffs
}

export type combinationWithDiffsDiff = {
  combination: EventHistoryWithBitId[]
  diffsDiffs: DiffsDiffs
}

export type combinationWithDiffsDiffs = combinationWithDiffsDiff[]

export type MatchingsByFile = {
  fileNameX: string
  fileNameY: string
  matching: combinationWithDiffsDiffs
}[]
