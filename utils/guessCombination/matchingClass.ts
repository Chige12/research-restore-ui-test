import { cloneDeep } from 'lodash'
import { HistoryAndFileData } from '~/types/history'
import { CombinationWithIndicator } from './type'

export class Matching {
  constructor(useIndicatorName: string) {
    Matching.useIndicatorName = useIndicatorName
    Matching.matchingArr = []
    Matching.XeventIdArr = []
    Matching.XIndexArr = []
    Matching.YeventIdArr = []
    Matching.YIndexArr = []
    Matching.cacheIndex = 0
    Matching.prevIndicatorValue = 0
  }

  static useIndicatorName: string = ''
  static matchingArr: CombinationWithIndicator[] = []
  static XeventIdArr: string[] = []
  static XIndexArr: number[] = []
  static YeventIdArr: string[] = []
  static YIndexArr: number[] = []
  static prevIndicatorValue: number = 0
  static cacheIndex: number | null = null

  minimumCostBipartiteMatching = (
    combinationWithIndicators: CombinationWithIndicator[]
  ): CombinationWithIndicator[] => {
    const sortedArr = Matching.sortCombinationsByIndicator(
      combinationWithIndicators
    )

    for (let i = 0; i < sortedArr.length; i++) {
      const comb = sortedArr[i]
      const [histFileX, histFileY] = comb.combination
      if (Matching.isAdoptMatching(histFileX, histFileY)) {
        const judge: boolean | undefined = histFileX.index === histFileY.index
        const ableToJudge: boolean | undefined = true
        const adoptedComb = { ...comb, judge, ableToJudge }
        Matching.matchingArr.push(adoptedComb)
        Matching.pushArrAddedId(comb)
      }
    }
    return Matching.matchingArr
  }

  static sortCombinationsByIndicator = (
    combinationWithIndicators: CombinationWithIndicator[]
  ) => {
    const indicatorName = Matching.useIndicatorName
    const sortedArr = cloneDeep(combinationWithIndicators).sort((a, b) => {
      const index = Matching.getIndex(a, indicatorName)
      const ad = a.indicator.values[index].number
      const bd = b.indicator.values[index].number
      return ad === bd ? 0 : ad < bd ? -1 : 1
    })
    return sortedArr
  }

  static getIndex = (comb: CombinationWithIndicator, indicatorName: string) => {
    if (Matching.cacheIndex !== null) return Matching.cacheIndex
    const index = comb.indicator.names.findIndex(
      (name) => name === indicatorName
    )
    return index === -1 ? 0 : index
  }

  static pushArrAddedId = (comb: CombinationWithIndicator) => {
    const [histFileX, histFileY] = comb.combination
    const index = Matching.getIndex(comb, Matching.useIndicatorName)
    const isSameIndicatorToPrev =
      Matching.prevIndicatorValue === comb.indicator.values[index].number
    Matching.prevIndicatorValue = comb.indicator.values[index].number

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
