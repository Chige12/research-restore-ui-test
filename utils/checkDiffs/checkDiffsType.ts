import { HistoryAndFileData } from '~/types/history'
import { Diffs } from '../recording/diffTypes'

export type CombinationList = HistoryAndFileData[][]

export type DiffsDiffs = {
  diffsDiffs: Diffs
  diffsWithbreadcrumbsPathsDiffs: Diffs
}
