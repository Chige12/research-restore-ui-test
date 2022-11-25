import { toDom } from 'hast-util-to-dom'
import { HastNode } from 'hast-util-to-dom/lib'
import { diff as justDiff } from 'just-diff'
import { DataHistory, HistoriesByFile } from '../createDiffs/breadcrumbs'
import { getEventFiringElement } from '../getNewRootPathElements'
import {
  CombinationList,
  EventHistory,
  EventHistoryWithBitId,
} from './checkDiffsType'

export const getAllEventHistories = (file: HistoriesByFile): EventHistory[] => {
  let allEventHistories = [] as EventHistory[]
  for (let i = 0; i < file.length; i++) {
    for (let h = 0; h < file[i].histories.length; h++) {
      const history = file[i].histories[h]
      const oneEventHistory: EventHistory = {
        name: file[i].name,
        index: h,
        history,
      }
      allEventHistories.push(oneEventHistory)
    }
  }
  return allEventHistories
}

export const getCombinationList = (
  list: EventHistoryWithBitId[]
): CombinationList => {
  let combinationList = [] as CombinationList
  for (let i = 0; i < list.length; i++) {
    for (let j = 0; j < i; j++) {
      if (list[i].name === list[j].name) continue
      combinationList.push([list[i], list[j]])
    }
  }
  return combinationList
}

export const getCombinationListByFile = (
  listX: EventHistoryWithBitId[],
  listY: EventHistoryWithBitId[]
): CombinationList => {
  let combinationList = [] as CombinationList
  for (let a = 0; a < listX.length; a++) {
    for (let b = 0; b < listY.length; b++) {
      combinationList.push([listX[a], listY[b]])
    }
  }
  return combinationList
}

export const calculateEditDistance = (
  A: EventHistoryWithBitId,
  B: EventHistoryWithBitId
) => {
  const diffsDiffs = justDiff(A.history.diffs, B.history.diffs)
  const diffsWithbreadcrumbsPathsDiffs = justDiff(
    A.history.diffsWithbreadcrumbsPaths,
    B.history.diffsWithbreadcrumbsPaths
  )
  const matchDiffCounts = calculateMatchDiffCounts(diffsDiffs)
  const partialMatchPercentage =
    calculatePartialMatchPercentage(matchDiffCounts)
  const performanceIndexNames: string[] = [
    '差分の部分一致数',
    '差分の完全一致数',
    '部分一致割合',
  ]
  const performanceIndexes: number[] = [
    matchDiffCounts.partialMatchCount,
    matchDiffCounts.perfectMatchCount,
    partialMatchPercentage,
  ]
  return {
    diffsDiffs,
    diffsWithbreadcrumbsPathsDiffs,
    performanceIndexNames,
    performanceIndexes,
  }
}

// 評価指標の計算
const calculateMatchDiffCounts = (diffs: Diffs) => {
  let partialMatchCount = 0
  let perfectMatchCount = 0
  for (let i = 0; i < diffs.length; i++) {
    const diff = diffs[i]
    if (diff.value === null) continue
    if (diff.value.hasOwnProperty('op')) {
      perfectMatchCount++
    } else {
      partialMatchCount++
    }
  }
  return { perfectMatchCount, partialMatchCount }
}
const calculatePartialMatchPercentage = (matchDiffCounts: {
  perfectMatchCount: number
  partialMatchCount: number
}) => {
  const allCount =
    matchDiffCounts.perfectMatchCount + matchDiffCounts.partialMatchCount
  if (allCount === 0) return 0
  return matchDiffCounts.partialMatchCount / allCount
}

export const generateDiffsDiffsArr = (combinationList: CombinationList) => {
  const diffsDiffsArr = combinationList.map((combination) => {
    const [A, B] = combination
    return calculateEditDistance(A, B)
  })
  return diffsDiffsArr
}

export const generateEventFiringElements = (
  A: DataHistory,
  B: DataHistory,
  index: number
): (string | null)[] => {
  const AEventFiringElement = getEventFiringElement(
    A.oldFormat.to,
    A.eventInfo.eventId,
    index
  )
  const BEventFiringElement = getEventFiringElement(
    B.oldFormat.to,
    B.eventInfo.eventId,
    index
  )
  const AHtml = AEventFiringElement
    ? (getTextHtml(AEventFiringElement) as string)
    : null
  const BHtml = BEventFiringElement
    ? (getTextHtml(BEventFiringElement) as string)
    : null
  console.log(AHtml, BHtml)
  return [AHtml, BHtml]
}

export const getTextHtml = (hast: HastNode) => {
  const node = toDom(hast) as Element
  return node.outerHTML
}
