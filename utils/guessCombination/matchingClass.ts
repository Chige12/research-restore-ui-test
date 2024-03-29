import { cloneDeep } from 'lodash'
import { HistoryAndFileData } from '~/types/history'
import {
  alphabetToGroup,
  changeToTejunNumber,
  fileNameToAlphabet,
  fileXYToTargetXY,
} from '~/utils/converters'
import { CombinationWithIndicator, Group, MatchingPareData } from './type'

export class Matching {
  constructor(useIndicatorName: string) {
    Matching.useIndicatorName = useIndicatorName
    Matching.cacheIndicatorIndex = 0
    Matching.matchingArr = []
    Matching.fixedOperationTargetsX = []
    Matching.fixedOperationTargetsY = []
    Matching.fixedOperationIndexesX = []
    Matching.fixedOperationIndexesY = []
    Matching.prevIndicatorValue = null
    Matching.correctCount = 0
    Matching.allCount = 0
  }

  static useIndicatorName: string = ''
  static matchingArr: CombinationWithIndicator[] = []
  static cacheIndicatorIndex: number = 0
  static fixedOperationTargetsX: string[] = []
  static fixedOperationTargetsY: string[] = []
  static fixedOperationIndexesX: number[] = []
  static fixedOperationIndexesY: number[] = []
  static prevIndicatorValue: number | null = null
  static correctCount: number = 0
  static allCount: number = 0

  generateMatchingByAlgorism = (
    combinationWithIndicators: CombinationWithIndicator[],
    isFixedSameValue?: boolean
  ): MatchingPareData => {
    Matching.saveCacheIndicatorIndex(
      combinationWithIndicators[0],
      Matching.useIndicatorName
    )

    const sortedArr = Matching.sortCombinationsByIndicator(
      combinationWithIndicators
    )

    const filteredArr = sortedArr.filter((x) => {
      const [fileX, fileY] = x.combination
      return fileX.history.eventInfo.type === fileY.history.eventInfo.type
    })

    for (let i = 0; i < filteredArr.length; i++) {
      const comb = filteredArr[i]
      const [fileX, fileY] = comb.combination

      const nowIndicatorValue =
        comb.indicator.values[Matching.cacheIndicatorIndex].number
      const isSameAsPrevIndicatorValue =
        nowIndicatorValue === Matching.prevIndicatorValue
      const isFirst = i === 0

      // 既に固定化されてる操作番号 or 操作対象なら追加しない
      if (Matching.isAlreadyFixedOperation(fileX, fileY)) continue

      // 追加処理
      const judge = Matching.judge(fileX, fileY)
      const ableToJudge: boolean | undefined = true
      const adoptedComb = { ...comb, judge, ableToJudge }
      Matching.matchingArr.push(adoptedComb)
      Matching.allCount++
      if (judge) {
        Matching.correctCount++
      }

      //最初なら飛ばす
      if (!isFirst) {
        // 指標が前の周回の値と違うなら
        if (!isSameAsPrevIndicatorValue) {
          // 現在の周回の操作番号と操作対象を固定化
          Matching.fixIndexesAndTargets(comb.combination)
        }
      }

      // 判定可能性に関係なく常に固定化する
      if (isFixedSameValue) {
        Matching.fixIndexesAndTargets(comb.combination)
      }
      Matching.prevIndicatorValue = nowIndicatorValue
    }
    Matching.prevIndicatorValue = null

    // 重複してる指標を判定不可に設定
    const index = Matching.cacheIndicatorIndex
    const matchings = Matching.matchingArr.map((x, _i, self) => {
      const indicatorValue = x.indicator.values[index].number
      const firstIndex = self.findIndex(
        (s) => s.indicator.values[index].number === indicatorValue
      )
      const firstReverseIndex = cloneDeep(self)
        .reverse()
        .findIndex((s) => s.indicator.values[index].number === indicatorValue)
      const lastIndex = self.length - 1 - firstReverseIndex
      const isNotDuplicate = firstIndex === lastIndex
      return {
        ...x,
        ableToJudge: isNotDuplicate as boolean | undefined,
      }
    })

    return {
      matchings,
      allCount: Matching.allCount,
      correctCount: Matching.correctCount,
    }
  }

  static fixIndexesAndTargets = (combi: HistoryAndFileData[]) => {
    const [fileX, fileY] = combi
    Matching.fixedOperationIndexesX.push(fileX.index)
    Matching.fixedOperationIndexesY.push(fileY.index)
    const [targetX, targetY] = fileXYToTargetXY(combi)
    if (targetX) Matching.fixedOperationTargetsX.push(targetX)
    if (targetY) Matching.fixedOperationTargetsY.push(targetY)
  }

  static isAlreadyFixedOperation = (
    fileX: HistoryAndFileData,
    fileY: HistoryAndFileData
  ) => {
    const [targetX, targetY] = fileXYToTargetXY([fileX, fileY])
    const isFixedOpIndexX = Matching.fixedOperationIndexesX.some(
      (index) => index === fileX.index
    )
    const isFixedOpIndexY = Matching.fixedOperationIndexesY.some(
      (index) => index === fileY.index
    )
    const isFixedOpTargetIdX = Matching.fixedOperationTargetsX.some(
      (target) => target === targetX
    )
    const isFixedOpTargetIdY = Matching.fixedOperationTargetsY.some(
      (target) => target === targetY
    )
    const isAlreadyFixedOpIndex = isFixedOpIndexX || isFixedOpIndexY
    const isAlreadyFixedOpTargetId = isFixedOpTargetIdX || isFixedOpTargetIdY
    return isAlreadyFixedOpIndex || isAlreadyFixedOpTargetId
  }

  static judge = (X: HistoryAndFileData, Y: HistoryAndFileData): boolean => {
    const nameAndOpNumX = fileNameToAlphabet(X.fileName).split('_')
    const nameAndOpNumY = fileNameToAlphabet(Y.fileName).split('_')
    const arr = [...nameAndOpNumX, ...nameAndOpNumY]

    const group = alphabetToGroup(nameAndOpNumX[0])
    if (!group) {
      alert(
        `error! can't judge matching. ${nameAndOpNumX.join(
          '_'
        )}, ${nameAndOpNumY.join('_')}`
      )
      return false
    }

    return Matching.judgeByGroup(arr, X.index, Y.index, group)
  }

  static judgeByGroup = (
    nameAndOpNumArr: string[],
    x: number,
    y: number,
    group: Group
  ): boolean => {
    const [_nameX, opNumX, _nameY, opNumY] = nameAndOpNumArr

    const tejunNumberX = changeToTejunNumber(Number(opNumX), x, group)
    const tejunNumberY = changeToTejunNumber(Number(opNumY), y, group)
    return tejunNumberX === tejunNumberY
  }

  static sortCombinationsByIndicator = (
    combinationWithIndicators: CombinationWithIndicator[]
  ) => {
    const sortedArr = cloneDeep(combinationWithIndicators).sort((a, b) => {
      const index = Matching.cacheIndicatorIndex

      const ad = a.indicator.values[index].number
      const bd = b.indicator.values[index].number
      return ad === bd ? 0 : ad < bd ? -1 : 1
    })
    return sortedArr
  }

  static saveCacheIndicatorIndex = (
    comb: CombinationWithIndicator,
    indicatorName: string
  ) => {
    if (Matching.cacheIndicatorIndex !== 0) return
    const index = comb.indicator.names.findIndex(
      (name) => name === indicatorName
    )
    if (index !== -1) {
      Matching.cacheIndicatorIndex = index
      return
    } else {
      console.error(
        'Indicator index can not found in combination by indicator name',
        comb.indicator.names,
        indicatorName
      )
    }
  }

  static updatePrevJudgement = () => {
    const index = Matching.cacheIndicatorIndex
    const updateIndex = Matching.matchingArr.findIndex(
      (match) =>
        match.indicator.values[index].number === Matching.prevIndicatorValue
    )
    const ableToJudge: boolean | undefined = false
    Matching.matchingArr[updateIndex] = {
      ...Matching.matchingArr[updateIndex],
      ableToJudge,
    }
    Matching.matchingArr[Matching.matchingArr.length - 1] = {
      ...Matching.matchingArr[Matching.matchingArr.length - 1],
      ableToJudge,
    }
  }
}
