import { DiffHistory } from '../types/history'
import { StylesPerElements } from './recording/styles'

export type JsonFile = {
  diffHistories: Array<DiffHistory>
  allElementStylesPerDiff: StylesPerElements[]
}

export type JsonFiles = { name: string; data: JsonFile }[]
