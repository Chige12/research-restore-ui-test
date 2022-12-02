import { HastNode } from 'hast-util-to-dom/lib'
import { diff as justDiff } from 'just-diff'
import { CombinationList } from '~/types/combination'
import {
  EventHistory,
  HistoriesByFile,
  HistoryAndFileData,
} from '~/types/history'
import { Indicator, MatchDiffCounts } from '~/types/indicator'
import { Diffs } from '../../types/diffs'
import { DiffWithBreadcrumbsPath } from '../createDiffs/breadcrumbs'
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

const use = <TA, TC>(
  method: (arg: TA) => TC,
  arg: TA,
  calculateMethodsIndexes: number[]
): TC | undefined => {
  const isCalculate = calculateMethodsIndexes.some((i) =>
    SHOW_INDEXES.some((ui) => ui === i)
  )
  if (!isCalculate) return undefined
  const value = method(arg)
  return value
}

const getDiffsDiffs = (diffss: Diffs[]) => {
  const [xDiff, yDiff] = diffss
  return justDiff(xDiff, yDiff)
}

export const SHOW_INDEXES = [0]

const indicatorNames = [
  'TED',
  '追加情報付与TED',
  '差分の部分一致数',
  '差分の完全一致数',
  '部分一致割合',
]

export const getUsedIndicatorNames = () => {
  return indicatorNames.filter((_, i) => SHOW_INDEXES.some((si) => si === i))
}

export const generateIndicators = (X: EventHistory, Y: EventHistory) => {
  // 0
  const diffsDiffs = use<Diffs[], Diffs>(
    getDiffsDiffs,
    [X.diffs, Y.diffs],
    [0, 2, 3, 4]
  ) as Diffs | undefined
  const diffTED = diffsDiffs ? diffsDiffs.length : NaN

  //1 ボツ指標
  const diffsWithBcpDiffs = use<DiffWithBreadcrumbsPath[], Diffs>(
    getDiffsDiffs,
    [X.diffsWithbreadcrumbsPaths, Y.diffsWithbreadcrumbsPaths],
    [1]
  ) as Diffs | undefined
  const bcpTED = diffsWithBcpDiffs ? diffsWithBcpDiffs.length : NaN

  // 2 or 3 ボツ指標
  const matchDiffCounts = use<Diffs | undefined, MatchDiffCounts>(
    calculateMatchDiffCounts,
    diffsDiffs,
    [2, 3, 4]
  ) as MatchDiffCounts
  const partialMC = matchDiffCounts ? matchDiffCounts.partialMatchCount : NaN // 2
  const perfectMC = matchDiffCounts ? matchDiffCounts.perfectMatchCount : NaN // 3

  // 4 ボツ指標
  const partialMatchPercentage = use<MatchDiffCounts | undefined, number>(
    calculatePartialMatchPercentage,
    matchDiffCounts,
    [4]
  ) as number

  const values: Indicator['values'] = [
    { number: diffTED, diffs: diffsDiffs },
    { number: bcpTED, diffs: diffsWithBcpDiffs },
    { number: partialMC },
    { number: perfectMC },
    { number: partialMatchPercentage },
  ]

  const indicator: Indicator = {
    names: getUsedIndicatorNames(),
    values: values.filter((_, i) => SHOW_INDEXES.some((si) => si === i)),
  }
  return indicator
}

// 評価指標の計算
const calculateMatchDiffCounts = (diffs?: Diffs) => {
  if (!diffs) return { perfectMatchCount: NaN, partialMatchCount: NaN }
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
const calculatePartialMatchPercentage = (matchDiffCounts?: MatchDiffCounts) => {
  if (!matchDiffCounts) return NaN
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
