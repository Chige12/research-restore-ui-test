import { HastElement, HastNode, HastRoot } from 'hast-util-from-dom/lib'
import { CSSStyle } from '../utils/recording/styles'

export type Operation = 'add' | 'replace' | 'remove'
export type Path = Array<string | number>
export interface Diff {
  op: Operation
  path: Path
  value: any
}

export type DiffType = 'class' | 'style' | 'dom'

export type JustDiff = Array<Diff>

type JustRootHastNode = {
  type: HastRoot['type']
}

export type JustElementHastNode = {
  type: HastElement['type']
  tagName: HastElement['tagName']
  properties?: HastElement['properties']
  content?: HastElement['content']
  styles?: CSSStyle[]
}

export type ElementDiff =
  | HastNode
  | JustRootHastNode
  | JustElementHastNode
  | undefined

export type ElementDiffs = {
  from?: ElementDiff
  to?: ElementDiff
}

export interface Info {
  type: DiffType
  elementDiffs: ElementDiffs | null
  styleDiffs: JustDiff | null
  from?: HastNode | undefined
}

export type Diffs = Array<Diff>
export type DiffAndInfos = Array<Diff & Info>
