import { cloneDeep } from 'lodash'
import { Matching } from './matchingClass'
import { CombinationWithIndicator, MatchingPareData } from './type'

export class MatchingThree {
  constructor(useIndicatorName: string) {
    MatchingThree.useIndicatorName = useIndicatorName
    MatchingThree.cacheIndicatorIndex = 0
  }

  static useIndicatorName: string = ''
  static cacheIndicatorIndex: number = 0

  generateMatchingByAlgorism = (
    combinationWithIndicators: CombinationWithIndicator[]
  ): MatchingPareData => {
    MatchingThree.saveCacheIndicatorIndex(
      combinationWithIndicators[0],
      MatchingThree.useIndicatorName
    )

    const { generateMatchingByAlgorism } = new Matching(
      MatchingThree.useIndicatorName
    )
    const pairData = generateMatchingByAlgorism(combinationWithIndicators)

    // indicatorが重なってるindexを出す [1,2,3, 7,8] など
    let overlappingIndexes = [] as number[]
    for (let i = 0; i < pairData.matchings.length; i++) {
      const match = pairData.matchings[i]
      if (match.ableToJudge) {
        overlappingIndexes.push(i)
      }
    }

    const indicatorIndex = MatchingThree.cacheIndicatorIndex

    // 重複なしなら操作対象でフィルタリングして返す
    const isNoOverlapping = overlappingIndexes.length === 0
    if (isNoOverlapping) {
      return MatchingThree.filteringByTargetId(pairData)
    }

    // [1, 2, 4, 5, 6, 9, 10] -> [[1, 2],[4, 5, 6],[9, 10]]
    const splitSequence =
      MatchingThree.numbersToSplitSequence(overlappingIndexes) //.slice(0, 2)

    // 固定したいIndexの配列を作成
    // [[1, 2],[4, 5, 6],[9, 10]] -> [[1,4],[1,5],[1,6],[2,4],[2,5],[2,6]]
    const fixedIndexesArr = MatchingThree.getCombination(splitSequence)

    // 重なってるIndex分だけ調査する
    const pairs = fixedIndexesArr.map((fixedIndexes) => {
      // あるindexを固定化させた状態でMatching
      const old = {
        matchings: pairData.matchings,
        allCount: pairData.allCount,
        correctCount: pairData.correctCount,
      }
      const filterdPairData = MatchingThree.filteringByTargetIdWithFixedIndexes(
        old,
        fixedIndexes
      )
      return filterdPairData
    })

    // それらの中で指標の合計値が最も小さいものを探して採用
    const sumIndicators = pairs.map((x) => {
      return x.matchings.reduce((sum, elm) => {
        return sum + elm.indicator.values[indicatorIndex].number
      }, 0)
    })
    const min = Math.min(...sumIndicators)
    const minIndex = sumIndicators.findIndex((x) => x === min)
    if (minIndex === -1) {
      console.error('Error!: minIndex === -1')
      return pairs[0]
    }
    const matchingPair = pairs[minIndex]
    return matchingPair
  }

  static filteringByTargetIdWithFixedIndexes = (
    pair: MatchingPareData,
    fixedIndexes: number[]
  ): MatchingPareData => {
    let fixedOperationIndexesX = [] as number[]
    let fixedOperationIndexesY = [] as number[]
    let fixedOperationTargetIdsX = [] as string[]
    let fixedOperationTargetIdsY = [] as string[]
    let newMatchingArr = [] as CombinationWithIndicator[]
    let allCount = 0
    let correctCount = 0
    for (let i = 0; i < pair.matchings.length; i++) {
      const match = pair.matchings[i]
      const [fileX, fileY] = match.combination
      const isFixedIndex = fixedIndexes.some((index) => index === i)

      const isFixedOpIndexX = fixedOperationIndexesX.some(
        (index) => index === fileX.index
      )
      const isFixedOpIndexY = fixedOperationIndexesY.some(
        (index) => index === fileY.index
      )
      const isFixedOpTargetIdX = fixedOperationTargetIdsX.some(
        (id) => id === fileX.history.eventInfo.eventId
      )
      const isFixedOpTargetIdY = fixedOperationTargetIdsY.some(
        (id) => id === fileY.history.eventInfo.eventId
      )
      const isAlreadyFixedOperation =
        isFixedOpIndexX ||
        isFixedOpIndexY ||
        isFixedOpTargetIdX ||
        isFixedOpTargetIdY

      if (isAlreadyFixedOperation && !isFixedIndex) continue
      newMatchingArr.push(match)
      allCount++
      if (match.judge) {
        correctCount++
      }
      fixedOperationIndexesX.push(fileX.index)
      fixedOperationIndexesY.push(fileY.index)
      fixedOperationTargetIdsX.push(fileX.history.eventInfo.eventId)
      fixedOperationTargetIdsY.push(fileY.history.eventInfo.eventId)
    }
    return {
      matchings: newMatchingArr,
      allCount,
      correctCount,
    }
  }

  static filteringByTargetId = (pair: MatchingPareData): MatchingPareData => {
    let fixedOperationTargetIdsX = [] as string[]
    let fixedOperationTargetIdsY = [] as string[]
    let newMatchingArr = [] as CombinationWithIndicator[]
    for (let i = 0; i < pair.matchings.length; i++) {
      const match = pair.matchings[i]
      const [fileX, fileY] = match.combination

      const isFixedOpTargetIdX = fixedOperationTargetIdsX.some(
        (id) => id === fileX.history.eventInfo.eventId
      )
      const isFixedOpTargetIdY = fixedOperationTargetIdsY.some(
        (id) => id === fileY.history.eventInfo.eventId
      )
      const isAlreadyFixedOpTargetId = isFixedOpTargetIdX || isFixedOpTargetIdY
      if (isAlreadyFixedOpTargetId) continue
      newMatchingArr.push(match)

      fixedOperationTargetIdsX.push(fileX.history.eventInfo.eventId)
      fixedOperationTargetIdsY.push(fileY.history.eventInfo.eventId)
    }
    return {
      matchings: newMatchingArr,
      allCount: pair.allCount,
      correctCount: pair.correctCount,
    }
  }

  static numbersToSplitSequence = (numbers: number[]): number[][] => {
    // [1, 2, 4, 5, 6, 9, 10] -> [[1, 2],[4, 5, 6],[9, 10]]
    const splitArr = [] as number[][]
    let pre = null as null | number
    numbers.forEach((x) => {
      if (pre !== x - 1) {
        splitArr[splitArr.length] = [x]
      } else {
        splitArr[splitArr.length - 1].push(x)
      }
      pre = x
    })
    return splitArr
  }

  static getCombination = (numbersArr: number[][]) => {
    // [[1, 2],[4, 5, 6]] -> [[1,4],[1,5],[1,6],[2,4],[2,5],[2,6]]
    if (numbersArr.length === 1) {
      return numbersArr[0].map((x) => [x])
    }
    const [arr1, arr2] = numbersArr
    return arr1.flatMap((d) => arr2.map((v) => [d, v]))
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
    if (MatchingThree.cacheIndicatorIndex !== 0) return
    const index = comb.indicator.names.findIndex(
      (name) => name === indicatorName
    )
    if (index !== -1) {
      MatchingThree.cacheIndicatorIndex = index
      return
    } else {
      console.error(
        'Indicator index can not found in combination by indicator name',
        comb.indicator.names,
        indicatorName
      )
    }
  }
}
