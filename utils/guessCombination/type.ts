import { HistoryAndFileData } from '~/types/history'
import { Diffs } from '../recording/diffTypes'

export type DiffsDiffs = {
  diffsDiffs: Diffs
  diffsWithbreadcrumbsPathsDiffs: Diffs
}

export type combinationWithDiffsDiff = {
  combination: HistoryAndFileData[]
  diffsDiffs: DiffsDiffs
}

export type combinationWithDiffsDiffs = combinationWithDiffsDiff[]

export type MatchingsByFile = {
  fileNameX: string
  fileNameY: string
  matching: combinationWithDiffsDiffs
}[]
