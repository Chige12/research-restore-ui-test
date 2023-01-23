import { cloneDeep } from 'lodash'
import {
  fileNameToAlphabetAndOpAndGroup,
  fileXYToTargetXY,
} from '../converters'
import { Matching } from './matchingClass'
import { CombinationWithIndicator, MatchingPareData } from './type'

export class MatchingThree extends Matching {
  constructor(useIndicatorName: string) {
    super(useIndicatorName)
  }

  generateMatchingByAlgorism = (
    combinationWithIndicators: CombinationWithIndicator[]
  ): MatchingPareData => {
    MatchingThree.saveCacheIndicatorIndex(
      combinationWithIndicators[0],
      MatchingThree.useIndicatorName
    )

    const sortedArr = MatchingThree.sortCombinationsByIndicator(
      combinationWithIndicators
    )
    const filteredArr = sortedArr.filter((x) => {
      const [fileX, fileY] = x.combination
      return fileX.history.eventInfo.type === fileY.history.eventInfo.type
    })

    // indicatorが重なってるindexを出す [1,2,3, 7,8] など
    let overlappingIndexes = [] as number[]
    for (let i = 0; i < filteredArr.length; i++) {
      const match = filteredArr[i]
      if (!match.ableToJudge) {
        overlappingIndexes.push(i)
      }
    }

    // [1, 2, 4, 5, 6, 9, 10] -> [1, 2]
    const firstOverlappingIndexes =
      MatchingThree.numbersToSplitSequence(overlappingIndexes)[0]

    // 重複なしなら操作対象でフィルタリングして返す
    const isNoOverlapping = firstOverlappingIndexes.length === 0
    if (isNoOverlapping) {
      console.log('no over lapping')
      const pair = {
        matchings: filteredArr,
        allCount: 0,
        correctCount: 0,
      }
      return MatchingThree.filteringByTargetId(pair)
    }

    // 重なってるIndex分だけ調査する
    const pairs = firstOverlappingIndexes.map((fixedIndex) => {
      // あるindexを固定化させた状態でMatching
      const old = {
        matchings: filteredArr,
        allCount: 0,
        correctCount: 0,
      }
      const filterdPairData = MatchingThree.filteringByTargetIdWithFixedIndexes(
        old,
        fixedIndex
      )
      return filterdPairData
    })

    const filterdPairs = pairs.filter((pair) => {
      const { group } = fileNameToAlphabetAndOpAndGroup(
        pair.matchings[0].combination[0].fileName
      )
      if (group === 'signin') {
        if (!(pair.allCount >= 2)) console.error('Error! allCount < 2')
        return pair.allCount >= 2
      }
      if (group === 'table') {
        if (!(pair.allCount >= 5)) console.error('Error! allCount < 5')
        return pair.allCount >= 5
      }
      console.error('Error! group is undefined')
      return false
    })

    console.log(filterdPairs, pairs)

    const indicatorIndex = MatchingThree.cacheIndicatorIndex
    // それらの中で指標の合計値が最も小さいものを探して採用
    const sumIndicators = filterdPairs.map((x) => {
      return x.matchings.reduce((sum, elm) => {
        return sum + elm.indicator.values[indicatorIndex].number
      }, 0)
    })
    const min = Math.min(...sumIndicators)
    const minIndex = sumIndicators.findIndex((x) => x === min)
    if (minIndex === -1) {
      console.error('Error!: minIndex === -1', sumIndicators)
      return pairs[0]
    }
    console.log(filterdPairs, minIndex)
    const matchingPair = filterdPairs[minIndex]
    return matchingPair
  }

  static filteringByTargetIdWithFixedIndexes = (
    pair: MatchingPareData,
    fixedIndex: number
  ): MatchingPareData => {
    let fixedOperationIndexesX = [] as number[]
    let fixedOperationIndexesY = [] as number[]
    let fixedOperationTargetsX = [] as string[]
    let fixedOperationTargetsY = [] as string[]
    let newMatchingArr = [] as CombinationWithIndicator[]
    let allCount = 0
    let correctCount = 0

    const match = pair.matchings[fixedIndex]
    const [fileX, fileY] = match.combination
    fixedOperationIndexesX.push(fileX.index)
    fixedOperationIndexesY.push(fileY.index)

    for (let i = 0; i < pair.matchings.length; i++) {
      const match = pair.matchings[i]
      const [fileX, fileY] = match.combination
      const isFixedIndex = fixedIndex === i

      // targetXとtargetYを生成
      const [targetX, targetY] = fileXYToTargetXY(match.combination)

      // 固定化するかどうか判定
      const isFixedOpIndexX = fixedOperationIndexesX.some(
        (index) => index === fileX.index
      )
      const isFixedOpIndexY = fixedOperationIndexesY.some(
        (index) => index === fileY.index
      )
      const isFixedOpTargetIdX = fixedOperationTargetsX.some(
        (target) => target === targetX
      )
      const isFixedOpTargetIdY = fixedOperationTargetsY.some(
        (target) => target === targetY
      )
      const isAlreadyFixedOperation =
        isFixedOpIndexX ||
        isFixedOpIndexY ||
        isFixedOpTargetIdX ||
        isFixedOpTargetIdY

      if (isAlreadyFixedOperation && !isFixedIndex) continue

      // 固定化する場合はpush
      const judge = MatchingThree.judge(fileX, fileY)
      const ableToJudge: boolean | undefined = true
      const adoptedComb = { ...match, judge, ableToJudge }
      newMatchingArr.push(adoptedComb)
      allCount++
      if (judge) {
        correctCount++
      }

      // 固定化したやつはindexとtargetIdを登録
      fixedOperationIndexesX.push(fileX.index)
      fixedOperationIndexesY.push(fileY.index)
      if (targetX) fixedOperationTargetsX.push(targetX)
      if (targetY) fixedOperationTargetsY.push(targetY)
    }
    return {
      matchings: newMatchingArr,
      allCount,
      correctCount,
    }
  }

  static filteringByTargetId = (pair: MatchingPareData): MatchingPareData => {
    let fixedOperationIndexesX = [] as number[]
    let fixedOperationIndexesY = [] as number[]
    let fixedOperationTargetsX = [] as string[]
    let fixedOperationTargetsY = [] as string[]
    let allCount = 0
    let correctCount = 0
    let newMatchingArr = [] as CombinationWithIndicator[]

    for (let i = 0; i < pair.matchings.length; i++) {
      const match = pair.matchings[i]
      const [fileX, fileY] = match.combination

      // targetXとtargetYを生成
      const [targetX, targetY] = fileXYToTargetXY(match.combination)

      // 固定化するかどうか判定
      const isFixedOpIndexX = fixedOperationIndexesX.some(
        (index) => index === fileX.index
      )
      const isFixedOpIndexY = fixedOperationIndexesY.some(
        (index) => index === fileY.index
      )
      const isFixedOpTargetIdX = fixedOperationTargetsX.some(
        (target) => target === targetX
      )
      const isFixedOpTargetIdY = fixedOperationTargetsY.some(
        (target) => target === targetY
      )
      const isAlreadyFixedOperation =
        isFixedOpIndexX ||
        isFixedOpIndexY ||
        isFixedOpTargetIdX ||
        isFixedOpTargetIdY

      if (isAlreadyFixedOperation) continue

      // 固定化する場合はpush
      const judge = MatchingThree.judge(fileX, fileY)
      const ableToJudge: boolean | undefined = true
      const adoptedComb = { ...match, judge, ableToJudge }
      newMatchingArr.push(adoptedComb)
      allCount++
      if (judge) {
        correctCount++
      }

      // 固定化したやつはindexとtargetIdを登録
      fixedOperationIndexesX.push(fileX.index)
      fixedOperationIndexesY.push(fileY.index)
      if (targetX) fixedOperationTargetsX.push(targetX)
      if (targetY) fixedOperationTargetsY.push(targetY)
    }
    return {
      matchings: newMatchingArr,
      allCount,
      correctCount,
    }
  }

  static numbersToSplitSequence = (numbers: number[]): number[][] => {
    // [1, 2, 4, 5, 6, 9, 10] -> [[1, 2],[4, 5, 6],[9, 10]] -> [[1, 2]]
    const splitArr = [] as number[][]
    let pre = null as null | number
    for (let index = 0; index < numbers.length; index++) {
      const x = numbers[index]
      if (pre !== x - 1) {
        splitArr[splitArr.length] = [x]
      } else {
        if (splitArr.length === 0) {
          splitArr[splitArr.length - 1].push(x)
        } else {
          break
        }
      }
      pre = x
    }
    return splitArr
  }

  static getCombination = (numbersArr: number[][]) => {
    // [[1, 2],[4, 5, 6]] -> [[1,4],[1,5],[1,6],[2,4],[2,5],[2,6]]
    if (numbersArr.length === 1) {
      return numbersArr[0].map((x) => [x])
    }
    const [arr1, arr2] = numbersArr
    return arr1.flatMap((d) => {
      return arr2.map((v) => [d, v])
    })
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
}
