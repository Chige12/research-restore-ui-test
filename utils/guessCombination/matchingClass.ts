import { cloneDeep } from 'lodash'
import { HistoryAndFileData } from '~/types/history'
import {
  alphabetToGroup,
  changeToTejunNumber,
  fileNameToAlphabet,
} from '~/utils/converters'
import { CombinationWithIndicator, Group, MatchingPareData } from './type'

export class Matching {
  constructor(useIndicatorName: string) {
    Matching.useIndicatorName = useIndicatorName
    Matching.cacheIndicatorIndex = 0
    Matching.matchingArr = []
    Matching.XeventIdArr = []
    Matching.XIndexArr = []
    Matching.YeventIdArr = []
    Matching.YIndexArr = []
    Matching.prevArrIndicatorValue = null
    Matching.correctCount = 0
    Matching.allCount = 0
  }

  static useIndicatorName: string = ''
  static matchingArr: CombinationWithIndicator[] = []
  static cacheIndicatorIndex: number = 0
  static XeventIdArr: string[] = []
  static XIndexArr: number[] = []
  static YeventIdArr: string[] = []
  static YIndexArr: number[] = []
  static prevArrIndicatorValue: number | null = null
  static correctCount: number = 0
  static allCount: number = 0

  minimumCostBipartiteMatching = (
    combinationWithIndicators: CombinationWithIndicator[]
  ): MatchingPareData => {
    const sortedArr = Matching.sortCombinationsByIndicator(
      combinationWithIndicators
    )

    Matching.saveCacheIndicatorIndex(
      combinationWithIndicators[0],
      Matching.useIndicatorName
    )

    for (let i = 0; i < sortedArr.length; i++) {
      const comb = sortedArr[i]
      const [histFileX, histFileY] = comb.combination
      if (Matching.isAdoptMatching(histFileX, histFileY)) {
        const judge = Matching.judge(histFileX, histFileY)
        const ableToJudge: boolean | undefined = true
        const adoptedComb = { ...comb, judge, ableToJudge }
        Matching.matchingArr.push(adoptedComb)
        Matching.pushArrAddedId(comb)
        Matching.allCount++
        if (judge) {
          Matching.correctCount++
        }
      }
    }
    Matching.prevArrIndicatorValue = null
    return {
      matchings: Matching.matchingArr,
      allCount: Matching.allCount,
      correctCount: Matching.correctCount,
    }
  }

  // static sameIndicatorValueCount = (arr: CombinationWithIndicator[]) => {
  //   const indicatorArr = arr.map(
  //     (combi) => combi.indicator.values[Matching.indicatorIndex].number
  //   )
  //   var count = {}

  //   for (var i = 0; i < indicatorArr.length; i++) {
  //     const number = indicatorArr[i]
  //     count[number] = (count[number] || 0) + 1
  //   }

  //   console.log(count)
  //   return s.size != arr.length
  // }

  // static isNeedReMatching = (arr: CombinationWithIndicator[]) => {
  // }

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

    const tejunNumberX = changeToTejunNumber(opNumX, x, group)
    const tejunNumberY = changeToTejunNumber(opNumY, y, group)
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

  static pushArrAddedId = (comb: CombinationWithIndicator) => {
    const [histFileX, histFileY] = comb.combination
    const index = Matching.cacheIndicatorIndex
    const isSameIndicatorToPrev =
      Matching.prevArrIndicatorValue === comb.indicator.values[index].number
    Matching.prevArrIndicatorValue = comb.indicator.values[index].number

    if (!isSameIndicatorToPrev) {
      Matching.XeventIdArr.push(histFileX.history.eventInfo.eventId)
      Matching.YeventIdArr.push(histFileY.history.eventInfo.eventId)
      Matching.XIndexArr.push(histFileX.index)
      Matching.YIndexArr.push(histFileY.index)
    } else {
      Matching.updatePrevJudgement(index)
    }
  }

  static updatePrevJudgement = (index: number) => {
    const updateIndex = Matching.matchingArr.findIndex(
      (match) =>
        match.indicator.values[index].number === Matching.prevArrIndicatorValue
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

  static isAdoptMatching = (
    historyAndFileDataX: HistoryAndFileData,
    historyAndFileDataY: HistoryAndFileData
  ): boolean => {
    const isAEventIdExist = Matching.XeventIdArr.some((id: string) => {
      return id === historyAndFileDataX.history.eventInfo.eventId
    })
    const isBEventIdExist = Matching.YeventIdArr.some((id: string) => {
      return id === historyAndFileDataY.history.eventInfo.eventId
    })

    const isSameEventType =
      historyAndFileDataX.history.eventInfo.type ===
      historyAndFileDataY.history.eventInfo.type

    return !isAEventIdExist && !isBEventIdExist && isSameEventType
  }
}
