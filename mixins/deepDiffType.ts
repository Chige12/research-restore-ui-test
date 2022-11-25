import { HastNode } from 'hast-util-from-dom/lib'
import { EventInfo, EVENT_TYPES } from '~/types/event'
import {
  Diff,
  DiffAndInfos,
  DiffHistory,
  DiffType,
  ElementDiff,
  ElementDiffs,
  HastHistory,
  JustDiff,
} from '~/utils/recording/diffTypes'
import {
  CSSStyle,
  StylesAndId,
  StylesPerElements,
} from '~/utils/recording/styles'

export type StyleDiffs = {
  diff: JustDiff
}

export type Data = {
  rootElement: HTMLElement | null
  hastHistories: Array<HastHistory>
  diffHistories: Array<DiffHistory>
  pathName: string
  mergeIdList: string[]
  allElementStylesPerDiff: StylesPerElements[]
  allElementStyleDiffs: StyleDiffs[]
}

export type Methods = {
  sleep: (ms: number) => Promise<unknown>
  setIdToAllElements: (pathName: string, rootElement: HTMLElement) => void
  setAllElementStyles: (rootElement: HTMLElement) => void
  getElementStyle: (elem: Element, id: string) => StylesAndId
  createHastHistory: (type: EVENT_TYPES, event?: Event) => void
  getEventInfo: (event?: Event) => EventInfo | undefined
  createAndSaveDiff: () => void
  createJsonFile: (pathName: string) => void
  convertDiffAndInfos: (
    diffs: JustDiff,
    fromHast: HastNode,
    toHast: HastNode
  ) => DiffAndInfos
  uniqueDiffAndInfos: (diffAndInfos: DiffAndInfos) => DiffAndInfos
  addStylesFromDiffAndInfos: (diffAndInfos: DiffAndInfos) => DiffAndInfos
  addStylesFromElementDiffs: (elem: ElementDiff) => ElementDiff
  getIdFromElementDiffs: (elem: ElementDiff) => string | null
  getStyleDiffs: (to: ElementDiff, from: ElementDiff) => JustDiff | null
  checkDiffType: (diff: Diff) => DiffType
  getFrom: (diff: Diff, fromHast: HastNode) => HastNode | undefined
  getElementDiffs: (
    diff: Diff,
    fromHast: HastNode,
    toHast: HastNode
  ) => ElementDiffs | null
  getJustElementHast: (hast: HastNode, path: Diff['path']) => ElementDiff
  getStyles: (element: Element) => CSSStyle[]
}
