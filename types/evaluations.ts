import { Group } from '~/utils/guessCombination/type'

export type CorrectRateData = {
  groupName: Group
  indicator: string
  allCount: number
  correctCount: number
  correctRate: number
}
