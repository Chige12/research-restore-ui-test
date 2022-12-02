import { HastNode } from 'hast-util-to-dom/lib'
import { diff as justDiff } from 'just-diff'
import { CombinationList } from '~/types/combination'
import {
  EventHistory,
  HistoriesByFile,
  HistoryAndFileData,
} from '~/types/history'
import { Indicator } from '~/types/indicator'
import { Diffs } from '../../types/diffs'
import { getEventFiringElement } from '../getNewRootPathElements'

export const getAllEventHistories = (
  file: HistoriesByFile
): HistoryAndFileData[] => {
  let allEventHistories: HistoryAndFileData[] = []
  for (let i = 0; i < file.length; i++) {
    for (let h = 0; h < file[i].histories.length; h++) {
      const history = file[i].histories[h]
      const oneEventHistory: HistoryAndFileData = {
        fileName: file[i].fileName,
        index: h,
        history,
      }
      allEventHistories.push(oneEventHistory)
    }
  }
  return allEventHistories
}

export const getCombinationList = (
  list: HistoryAndFileData[]
): CombinationList => {
  let combinationList = [] as CombinationList
  for (let i = 0; i < list.length; i++) {
    for (let j = 0; j < i; j++) {
      if (list[i].fileName === list[j].fileName) continue
      combinationList.push([list[i], list[j]])
    }
  }
  return combinationList
}

export const getCombinationListByFile = (
  listX: HistoryAndFileData[],
  listY: HistoryAndFileData[]
): CombinationList => {
  let combinationList = [] as CombinationList
  for (let a = 0; a < listX.length; a++) {
    for (let b = 0; b < listY.length; b++) {
      combinationList.push([listX[a], listY[b]])
    }
  }
  return combinationList
}

export const generateIndicators = (X: EventHistory, Y: EventHistory) => {
  const diffsDiffs = justDiff(X.diffs, Y.diffs)
  // この指標はボツ
  // const diffsWithbreadcrumbsPathsDiffs = justDiff(
  //   X.diffsWithbreadcrumbsPaths,
  //   Y.diffsWithbreadcrumbsPaths
  // )
  const matchDiffCounts = calculateMatchDiffCounts(diffsDiffs)
  const partialMatchPercentage =
    calculatePartialMatchPercentage(matchDiffCounts)

  const names: Indicator['names'] = [
    'TED',
    '差分の部分一致数',
    '差分の完全一致数',
    '部分一致割合',
  ]
  const values: Indicator['values'] = [
    { number: diffsDiffs.length, diffs: diffsDiffs },
    { number: matchDiffCounts.partialMatchCount },
    { number: matchDiffCounts.perfectMatchCount },
    { number: partialMatchPercentage },
  ]

  const indicator: Indicator = {
    names,
    values,
  }
  return indicator
}

// 評価指標の計算
const calculateMatchDiffCounts = (diffs: Diffs) => {
  let partialMatchCount = 0
  let perfectMatchCount = 0
  for (let i = 0; i < diffs.length; i++) {
    const diff = diffs[i]
    if (
      diff.value === null ||
      diff.value === undefined ||
      typeof diff.value !== 'object'
    ) {
      partialMatchCount++
    } else {
      if ('op' in diff.value) {
        perfectMatchCount++
      } else {
        partialMatchCount++
      }
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

export const generateIndicatorsByEachCombination = (
  combinationList: CombinationList
) => {
  const indicatorsByEachCombination = combinationList.map((combination) => {
    const [X, Y] = combination
    return generateIndicators(X.history, Y.history)
  })
  return indicatorsByEachCombination
}

export const generateEventFiringElements = async (
  A: EventHistory,
  B: EventHistory,
  index: number
): Promise<(string | null)[]> => {
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
    ? ((await getTextHtml(AEventFiringElement)) as string)
    : null
  const BHtml = BEventFiringElement
    ? ((await getTextHtml(BEventFiringElement)) as string)
    : null
  console.log(AHtml, BHtml)
  return [AHtml, BHtml]
}

const toDom = async (hast: HastNode): Promise<Node> => {
  const module = await import('hast-util-to-dom')
  return module.toDom(hast)
}

export const getTextHtml = async (hast: HastNode) => {
  const node = (await toDom(hast)) as Element
  return node.outerHTML
}
