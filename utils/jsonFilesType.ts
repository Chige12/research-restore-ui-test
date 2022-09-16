import { DiffHistory } from './recording/diffTypes'
import { StylesPerElements } from './recording/styles'

export type JsonFile = {
  diffHistories: Array<DiffHistory>
  allElementStylesPerDiff: StylesPerElements[]
}

export type JsonFiles = { name: string; data: JsonFile }[]
