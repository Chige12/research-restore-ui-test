import { HistoryAndFileData } from '~/types/history'
import { Indicator } from '~/types/indicator'

export type CombinationWithIndicator = {
  combination: HistoryAndFileData[]
  indicator: Indicator
  judge?: boolean
  ableToJudge?: boolean
}

export type MatchingsWithFileName = {
  fileNameX: string
  fileNameY: string
  matchings: CombinationWithIndicator[]
  allCount: number
  correctCount: number
  correctRate: number
}

export type MatchingPareData = {
  matchings: CombinationWithIndicator[]
  allCount: number
  correctCount: number
}

export type MatchingsByFilesAndIndicator = {
  matchingsByFiles: MatchingsWithFileName[]
  indicator: string
}

export type Group = 'signin' | 'table'
