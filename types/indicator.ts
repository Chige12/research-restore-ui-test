import { Diffs } from '~/types/diffs'

export type Indicator = {
  names: string[]
  values: {
    number: number
    diffs?: Diffs | undefined
    sub?: any
  }[]
}

export type MatchDiffCounts = {
  perfectMatchCount: number
  partialMatchCount: number
}
