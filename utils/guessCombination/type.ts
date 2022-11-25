import { DiffsDiffs } from '~/types/diffsDiffs'
import { HistoryAndFileData } from '~/types/history'

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
