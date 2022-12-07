import { HistoryAndFileData } from '~/types/history'
import { Indicator } from '~/types/indicator'

export type CombinationWithIndicator = {
  combination: HistoryAndFileData[]
  indicator: Indicator
}

export type MatchingsWithFileName = {
  fileNameX: string
  fileNameY: string
  matchings: CombinationWithIndicator[]
}
