import { minimumWeightBipartiteMatch } from 'min-cost-flow'
import { Matching } from './matchingClass'
import { CombinationWithIndicator, MatchingPareData } from './type'

export class MatchingTwo extends Matching {
  constructor(useIndicatorName: string) {
    super(useIndicatorName)
  }

  minimumCostBipartiteMatching = (
    combinationWithIndicators: CombinationWithIndicator[]
  ): MatchingPareData => {
    MatchingTwo.saveCacheIndicatorIndex(
      combinationWithIndicators[0],
      MatchingTwo.useIndicatorName
    )

    const index = Matching.cacheIndicatorIndex
    const input = combinationWithIndicators.map((combi) => {
      const [X, Y] = combi.combination
      const left = `${X.fileName}---${X.bitId}`
      const right = `${Y.fileName}---${Y.bitId}`
      const weight = combi.indicator.values[index].number
      return {
        left,
        right,
        weight,
      }
    })

    const output = minimumWeightBipartiteMatch(input)

    const matchings = output.map((o) => {
      const comb = combinationWithIndicators.find((combi) => {
        const [X, Y] = combi.combination
        return (
          `${X.fileName}---${X.bitId}` === o.left &&
          `${Y.fileName}---${Y.bitId}` === o.right
        )
      })
      if (!comb) return
      const [histFileX, histFileY] = comb.combination
      const judge = MatchingTwo.judge(histFileX, histFileY)
      const ableToJudge: boolean | undefined = true
      MatchingTwo.allCount++
      if (judge) {
        MatchingTwo.correctCount++
      }
      return { ...comb, judge, ableToJudge }
    }) as CombinationWithIndicator[]

    const sortedMatchings = MatchingTwo.sortCombinationsByIndicator(matchings)

    return {
      matchings: sortedMatchings,
      allCount: MatchingTwo.allCount,
      correctCount: MatchingTwo.correctCount,
    }
  }
}
