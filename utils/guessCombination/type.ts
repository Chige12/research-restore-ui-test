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
}
