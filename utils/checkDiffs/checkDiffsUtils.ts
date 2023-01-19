import { HastNode } from 'hast-util-to-dom/lib'
import { diff as justDiff, Operation } from 'just-diff'
import { CombinationList } from '~/types/combination'
import {
  EventHistory,
  HistoriesByFile,
  HistoryAndFileData,
} from '~/types/history'
import { Indicator, MatchDiffCounts } from '~/types/indicator'
import { Diff, Diffs } from '../../types/diffs'
import { DiffWithBreadcrumbsPath } from '../createDiffs/breadcrumbs'
import {
  getEventFiringElement,
  newRootElement,
} from '../getNewRootPathElements'

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

const createBitList = (n: number) => [...Array(n)].map((_, i) => 1 << i)

export const addBitIdToHistory = (
  history: HistoryAndFileData[],
  base: number
) => {
  const bitList = createBitList(history.length + base)
  return history.map((x, i) => ({ ...x, bitId: bitList[i + base] }))
}

const use = <TA, TC>(
  method: (arg: TA) => TC,
  arg: TA,
  calculateMethodsIndexes: number[],
  showIndexes: number[]
): TC | undefined => {
  const isCalculate = calculateMethodsIndexes.some((i) =>
    showIndexes.some((ui) => ui === i)
  )
  if (!isCalculate) return undefined
  const value = method(arg)
  return value
}

const getDiffsDiffs = (diffss: Diffs[]) => {
  const [xDiff, yDiff] = diffss
  return justDiff(xDiff, yDiff)
}

const getDiffsDiffsByTree = (diffss: Diffs[]) => {
  const [diffsX, diffsY] = diffss
  return justDiff(diffsToPathObj(diffsX, true), diffsToPathObj(diffsY, true))
}

export const allIndicatorNames = [
  'TED',
  '追加情報付与TED',
  '差分の部分一致数',
  '差分の完全一致数',
  '部分一致割合',
  'VED+TED',
  'TED by Tree',
  'VED+TED by Tree',
]

export const getUsedIndicatorNames = (showIndexes: number[]) => {
  return allIndicatorNames.filter((_, i) => showIndexes.some((si) => si === i))
}

export const generateIndicators = (
  X: EventHistory,
  Y: EventHistory,
  calcIndicatorIndexes: number[]
) => {
  // 0
  const diffsDiffs = use<Diffs[], Diffs>(
    getDiffsDiffs,
    [X.diffs, Y.diffs],
    [0, 2, 3, 4],
    calcIndicatorIndexes
  )
  const diffTED = diffsDiffs ? diffsDiffs.length : NaN

  //1 ボツ指標
  const diffsWithBcpDiffs = use<DiffWithBreadcrumbsPath[], Diffs>(
    getDiffsDiffs,
    [X.diffsWithbreadcrumbsPaths, Y.diffsWithbreadcrumbsPaths],
    [1],
    calcIndicatorIndexes
  )
  const bcpTED = diffsWithBcpDiffs ? diffsWithBcpDiffs.length : NaN

  // 2 or 3 ボツ指標
  const matchDiffCounts = use<Diffs | undefined, MatchDiffCounts>(
    calculateMatchDiffCounts,
    diffsDiffs,
    [2, 3, 4],
    calcIndicatorIndexes
  )
  const partialMC = matchDiffCounts ? matchDiffCounts.partialMatchCount : NaN // 2
  const perfectMC = matchDiffCounts ? matchDiffCounts.perfectMatchCount : NaN // 3

  // 4 ボツ指標
  const partialMatchPercentage = use<MatchDiffCounts | undefined, number>(
    calculatePartialMatchPercentage,
    matchDiffCounts,
    [4],
    calcIndicatorIndexes
  )

  // 5 VED+TED
  const valueEditDistancePlusTED = use<EventHistory[], VEDTED>(
    calculateValueEditDistancePlusTED,
    [X, Y],
    [5],
    calcIndicatorIndexes
  )

  // 6 TED by Tree
  const diffsDiffsByTree = use<Diffs[], Diffs>(
    getDiffsDiffsByTree,
    [X.diffs, Y.diffs],
    [6],
    calcIndicatorIndexes
  )
  const diffTEDbyTree = diffsDiffsByTree ? diffsDiffsByTree.length : NaN

  // 7 VED+TED by Tree
  const valueEditDistancePlusTEDbyTree = use<EventHistory[], VEDTED>(
    calculateValueEditDistancePlusTEDbyTree,
    [X, Y],
    [7],
    calcIndicatorIndexes
  )

  const allValues: Indicator['values'] = [
    { number: diffTED, diffs: diffsDiffs },
    { number: bcpTED, diffs: diffsWithBcpDiffs },
    { number: partialMC },
    { number: perfectMC },
    {
      number:
        partialMatchPercentage === undefined ? NaN : partialMatchPercentage,
    },
    {
      number:
        valueEditDistancePlusTED === undefined
          ? NaN
          : valueEditDistancePlusTED.VEDTED,
      sub: valueEditDistancePlusTED,
    },
    {
      number: diffTEDbyTree,
      diffs: diffsDiffsByTree,
    },
    {
      number:
        valueEditDistancePlusTEDbyTree === undefined
          ? NaN
          : valueEditDistancePlusTEDbyTree.VEDTED,
      sub: valueEditDistancePlusTEDbyTree,
    },
  ]

  const names = allIndicatorNames.filter((_, i1) =>
    calcIndicatorIndexes.some((i2) => i1 === i2)
  )
  const values = allValues.filter((_, i1) =>
    calcIndicatorIndexes.some((i2) => i1 === i2)
  )

  const indicator: Indicator = { names, values }
  return indicator
}

type VEDTED = {
  VEDTED: number
  valueEditDistance: number
  withoutValueTED: number
}

// 評価指標の計算
const calculateValueEditDistancePlusTED = (
  histories: EventHistory[]
): VEDTED => {
  const [X, Y] = histories
  const { values: valuesX, diffsWV: diffsX } = getValuesAndDiffsWithoutValue(X)
  const { values: valuesY, diffsWV: diffsY } = getValuesAndDiffsWithoutValue(Y)

  const valueEditDistance = calculateValueEditDistance(valuesX, valuesY)
  const diffsDiffs = justDiff(diffsX, diffsY)
  const withoutValueTED = diffsDiffs.length
  const weightValue = 1
  const weightTree = 1
  const VEDTED = valueEditDistance * weightValue + withoutValueTED * weightTree
  return { VEDTED, valueEditDistance, withoutValueTED }
}

const calculateValueEditDistancePlusTEDbyTree = (
  histories: EventHistory[]
): VEDTED => {
  const [X, Y] = histories
  const { values: valuesX, diffsWV: diffsX } = getValuesAndDiffsWithoutValue(X)
  const { values: valuesY, diffsWV: diffsY } = getValuesAndDiffsWithoutValue(Y)

  const valueEditDistance = calculateValueEditDistance(valuesX, valuesY)
  const diffsDiffs = justDiff(
    diffsToPathObj(diffsX, true),
    diffsToPathObj(diffsY, true)
  )
  const withoutValueTED = diffsDiffs.length
  const weightValue = 1
  const weightTree = 1
  const VEDTED = valueEditDistance * weightValue + withoutValueTED * weightTree
  return { VEDTED, valueEditDistance, withoutValueTED }
}

type DiffsByOperation = {
  add: { [array: string]: Diff }
  remove: { [array: string]: Diff }
  replace: { [array: string]: Diff }
}

type DiffsPathByOperation = {
  add: newRootElement
  remove: newRootElement
  replace: newRootElement
}

type ValuesByOperation = {
  add: { [array: string]: string }
  remove: { [array: string]: string }
  replace: { [array: string]: string }
}

const diffsToObj = (diffs: Diffs): DiffsByOperation => {
  const obj: DiffsByOperation = {
    add: {},
    remove: {},
    replace: {},
  }
  for (let i = 0; i < diffs.length; i++) {
    const diff = diffs[i]
    switch (diff.op) {
      case 'add':
        obj.add[diff.path.join('/')] = diff
        break
      case 'remove':
        obj.remove[diff.path.join('/')] = diff
        break
      case 'replace':
        obj.replace[diff.path.join('/')] = diff
        break
      default:
        break
    }
  }
  return obj
}

const diffsToPathObj = (
  diffs: Diffs,
  isValue: boolean
): DiffsPathByOperation => {
  const add = pathToPathObj(
    diffs.filter((diff) => diff.op === 'add'),
    isValue
  )
  const remove = pathToPathObj(
    diffs.filter((diff) => diff.op === 'remove'),
    isValue
  )
  const replace = pathToPathObj(
    diffs.filter((diff) => diff.op === 'replace'),
    isValue
  )
  return { add, remove, replace }
}

const pathToPathObj = (diffs: Diffs, isValue: boolean): newRootElement => {
  const output = {} as newRootElement
  let current = {} as any

  for (let i = 0; i < diffs.length; i++) {
    const path = diffs[i].path
    current = output
    for (const segment of path) {
      if (segment.toString() !== '') {
        if (!(segment in current)) {
          current[segment] = isValue ? { value: diffs[i].value } : {}
        }
        current = current[segment]
      }
    }
  }
  return output
}

type OpAndValue = {
  op: Operation
  value: string
}

const getValuesAndDiffsWithoutValue = (history: EventHistory) => {
  const values: OpAndValue[] = []
  const diffsWithoutValue = history.diffs.map((diff) => {
    const isValue = diff.path[diff.path.length - 1] === 'value'
    if (!isValue) return diff
    const value = String(diff.value)
    values.push({
      op: diff.op,
      value,
    })
    return {
      op: diff.op,
      path: diff.path,
      value: undefined,
    }
  })
  return { values, diffsWV: diffsWithoutValue }
}

const calculateValueEditDistance = (
  valuesX: OpAndValue[],
  valuesY: OpAndValue[]
): number => {
  const { add: addX, remove: removeX, replace: replaceX } = valuesToObj(valuesX)
  const { add: addY, remove: removeY, replace: replaceY } = valuesToObj(valuesY)
  const addDiff = justDiff(addX, addY)
  const removeDiff = justDiff(removeX, removeY)
  const replaceDiff = justDiff(replaceX, replaceY)
  const valueDistance = addDiff.length + removeDiff.length + replaceDiff.length
  return valueDistance
}

const valuesToObj = (arr: OpAndValue[]): ValuesByOperation => {
  const pushedArr = []
  const obj: ValuesByOperation = {
    add: {},
    remove: {},
    replace: {},
  }
  let sameNumberValues = []
  for (let i = 0; i < arr.length; i++) {
    const { op, value } = arr[i]
    const sameNumberCount = pushedArr.filter((v) => v === value).length
    if (sameNumberCount !== 0) {
      sameNumberValues.push({ value: value, count: sameNumberCount, op: op })
    }
    const countersList = sameNumberValues
      .filter((v) => v.value === value && v.op === op)
      .map((v) => v.count)
    const counter = Math.max(...countersList) + 1
    const valuePath = sameNumberCount !== 0 ? `${value}-(${counter})` : value
    obj[op][valuePath] = value
    pushedArr.push(value)
  }
  return obj
}

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
  combinationList: CombinationList,
  showIndexes: number[]
) => {
  const indicatorsByEachCombination = combinationList.map((combination) => {
    const [X, Y] = combination
    return generateIndicators(X.history, Y.history, showIndexes)
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
