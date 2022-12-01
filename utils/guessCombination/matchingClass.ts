import { cloneDeep } from 'lodash'
import { HistoryAndFileData } from '~/types/history'
import { combinationWithDiffsDiff, combinationWithDiffsDiffs } from './type'

export class Matching {
  constructor() {
    Matching.matchingArr = []
    Matching.XeventIdArr = []
    Matching.XIndexArr = []
    Matching.YeventIdArr = []
    Matching.YIndexArr = []
    Matching.prevTED = 0
  }

  static matchingArr: combinationWithDiffsDiffs = []
  static XeventIdArr: string[] = []
  static XIndexArr: number[] = []
  static YeventIdArr: string[] = []
  static YIndexArr: number[] = []
  static prevTED: number = 0

  minimumCostBipartiteMatching = (
    combinationWithDiffsDiffs: combinationWithDiffsDiffs
  ): combinationWithDiffsDiffs => {
    const sortedArr = Matching.sortByTED(combinationWithDiffsDiffs)

    for (let i = 0; i < sortedArr.length; i++) {
      const comb = sortedArr[i]
      const [histFileX, histFileY] = comb.combination
      if (Matching.isAdoptMatching(histFileX, histFileY)) {
        Matching.matchingArr.push(comb)
        Matching.pushArrAddedId(comb)
      }
    }
    return Matching.matchingArr
  }

  static sortByTED = (combinationWithDiffsDiffs: combinationWithDiffsDiffs) => {
    const sortedArr = cloneDeep(combinationWithDiffsDiffs).sort((a, b) => {
      const ad = a.diffsDiffs.diffsDiffs.length
      const bd = b.diffsDiffs.diffsDiffs.length
      return ad === bd ? 0 : ad < bd ? -1 : 1
    })
    return sortedArr
  }

  static pushArrAddedId = (comb: combinationWithDiffsDiff) => {
    const [histFileX, histFileY] = comb.combination
    const isSameTedToPrev =
      Matching.prevTED === comb.diffsDiffs.diffsDiffs.length
    Matching.prevTED = comb.diffsDiffs.diffsDiffs.length

    if (!isSameTedToPrev) {
      Matching.XeventIdArr.push(histFileX.history.eventInfo.eventId)
      Matching.YeventIdArr.push(histFileY.history.eventInfo.eventId)
      Matching.XIndexArr.push(histFileX.index)
      Matching.YIndexArr.push(histFileY.index)
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

    const isAIndexExist = Matching.XIndexArr.some((index: number) => {
      return index === historyAndFileDataX.index
    })
    const isBIndexExist = Matching.YIndexArr.some((index: number) => {
      return index === historyAndFileDataY.index
    })

    const isSameEventType =
      historyAndFileDataX.history.eventInfo.type ===
      historyAndFileDataY.history.eventInfo.type

    return (
      !isAEventIdExist &&
      !isBEventIdExist &&
      !isAIndexExist &&
      !isBIndexExist &&
      isSameEventType
    )
  }
}
