import { FromAndToHastHistory } from '../types/history'
import { StylesPerElements } from './recording/styles'

export type JsonFile = {
  fromAndToHastHistories: FromAndToHastHistory[]
  allElementStylesPerDiff: StylesPerElements[]
}

export type JsonFiles = { name: string; data: JsonFile }[]
