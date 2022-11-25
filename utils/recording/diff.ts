import { HastElement, HastNode } from 'hast-util-from-dom/lib'
import { diff as justDiff } from 'just-diff'
import get from 'lodash/get'
import {
  Diff,
  DiffAndInfos,
  DiffType,
  ElementDiff,
  ElementDiffs,
  JustDiff,
} from '../../types/diffs'
import { getStyles } from './styles'

export const createDiffAndInfos = (
  diffs: JustDiff,
  fromHast: HastNode,
  toHast: HastNode
): DiffAndInfos => {
  const diffAndInfos = diffs.map((diff) => {
    const type = checkDiffType(diff)
    const from = getFrom(diff, fromHast)
    const elementDiffs = getElementDiffs(diff, fromHast, toHast)
    return {
      ...diff,
      type,
      elementDiffs,
      from,
      styleDiffs: null,
    }
  })
  return diffAndInfos
}

const checkDiffType = (diff: Diff): DiffType => {
  const { path } = diff
  const isClass = path.includes('className')
  if (isClass) return 'class'
  const isStyle = path.includes('style')
  if (isStyle) return 'style'
  return 'dom'
}

const getFrom = (diff: Diff, fromHast: HastNode): HastNode | undefined => {
  const { op, path } = diff
  if (op === 'add') return
  return get(fromHast, path)
}

const getElementDiffs = (
  diff: Diff,
  fromHast: HastNode,
  toHast: HastNode
): ElementDiffs | null => {
  const { path } = diff
  const index = path.lastIndexOf('children')
  if (index === -1) return null

  const lastHastPath = path.slice(0, index + 2)
  const toHastElement = toHast as HastElement
  const fromHastElement = fromHast as HastElement
  const toJustHast = getHastFromPath(toHastElement, lastHastPath)
  const fromJustHast = getHastFromPath(fromHastElement, lastHastPath)
  if (!toJustHast && !fromJustHast) return null
  return {
    from: fromJustHast,
    to: toJustHast,
  }
}

const getHastFromPath = (hast: HastNode, path: Diff['path']): ElementDiff => {
  const lastHast: HastNode = get(hast, path)
  if (!lastHast) return undefined
  if ('children' in lastHast) {
    const { children: _, ...justElementHast } = lastHast
    return justElementHast
  }
  return lastHast
}

export const addStylesFromDiffAndInfos = (
  diffAndInfos: DiffAndInfos
): DiffAndInfos => {
  return diffAndInfos.map((diff) => {
    if (diff.type !== 'class') return diff
    const toDiff = diff.elementDiffs?.to
    const fromDiff = diff.elementDiffs?.from
    const to = addStylesFromElementDiffs(toDiff)
    const from = addStylesFromElementDiffs(fromDiff)
    const elementDiffs = { to, from }
    const styleDiffs = getStyleDiffs(to, from)
    console.log('styleDiffs', styleDiffs)
    const diffWithStyles = { ...diff, elementDiffs, styleDiffs }
    return diffWithStyles
  })
}

const addStylesFromElementDiffs = (elem: ElementDiff): ElementDiff => {
  const id = getIdFromElementDiffs(elem)
  console.log(id)
  if (!id) return elem
  const element = document.getElementById(id)
  console.log(element)
  if (!element) return elem
  const styles = getStyles(element)
  console.log(styles)
  const elemWithStyle = { ...elem, styles } as ElementDiff
  return elemWithStyle
}

export const getIdFromElementDiffs = (elem: ElementDiff): string | null => {
  // todo: 説明変数化（なぜか変数にすると型推論が効かなくなる）
  if (!elem || !('properties' in elem) || elem.properties === undefined)
    return null
  return elem.properties.id as string
}

const getStyleDiffs = (to: ElementDiff, from: ElementDiff): JustDiff | null => {
  console.log(to, from)
  if (!to || !('styles' in to) || to.styles === undefined) return null
  if (!from || !('styles' in from) || from.styles === undefined) return null
  console.log(to.styles, from.styles)
  const styleDiffs = justDiff(to.styles, from.styles)
  return styleDiffs
}
