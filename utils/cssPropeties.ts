import { diff as justDiff } from 'just-diff'
import cssProperties from 'css-properties'
import {
  CSSStyle,
  Diff,
  DiffAndInfos,
  ElementDiffs,
  elementStyle,
} from '~/mixins/deepDiffType'

export type DiffAndStyle = Diff & {
  property: CSSStyle['property']
}

export type StyleDiffs = DiffAndStyle[][]

export const filteredCssProperties = cssProperties.filter((prop) => {
  switch (prop) {
    case 'border-bottom':
    case 'border-left':
    case 'border-right':
    case 'border-top':
    case 'border-bottom-color':
    case 'border-left-color':
    case 'border-right-color':
    case 'border-top-color':
    case 'text-decoration-color':
    case 'column-rule-color':
    case 'outline-color':
    case 'margin':
    case 'padding':
    case 'border-top-left-radius':
    case 'border-top-right-radius':
    case 'border-bottom-left-radius':
    case 'border-bottom-right-radius':
    case 'overflow':
    case 'border-bottom-width':
    case 'border-top-width':
    case 'border-right-width':
    case 'border-left-width':
    case 'border-bottom-style':
    case 'border-left-style':
    case 'border-right-style':
    case 'border-top-style':
    case 'list-style-type':
      return false
    default:
      return true
  }
})

export const getCountedProperties = (styleDiffs: StyleDiffs) => {
  const countedProperties = filteredCssProperties.map((property) => {
    const filteredStyleDiffs = styleDiffs.filter((diff) => {
      return diff.filter((x) => x.property === property)
    })
    const count = filteredStyleDiffs.length
    return {
      property,
      count,
    }
  })
  return countedProperties
}

export const getStyleDiffs = (
  allElementStylesPerDiff: elementStyle[][]
): StyleDiffs => {
  const styleDiffs = [] as StyleDiffs
  for (let i = 0; i < allElementStylesPerDiff.length - 1; i++) {
    const props1 = allElementStylesPerDiff[i]
    const props2 = allElementStylesPerDiff[i + 1]
    const diffs = justDiff(props1, props2)
    const filteredDiffs = diffs.filter((diff) => {
      return diff.op === 'replace'
    })
    const diffAndStyle: DiffAndStyle[] = filteredDiffs.map((diff: Diff) => {
      const { path } = diff
      const lastPath = path.slice(0, path.length - 1)
      const style: CSSStyle = get(props2, lastPath)
      return {
        ...diff,
        property: style.property,
      }
    })
    styleDiffs.push(diffAndStyle)
    console.log(styleDiffs)
  }
  return styleDiffs
}

export const countChanges = (infos: DiffAndInfos) => {
  let removeDomCount = 0
  let addDomCount = 0
  let changeDomCount = 0
  let changeStyleCount = 0

  const domChanges = (elementDiffs: ElementDiffs) => {
    const to = elementDiffs.to
    const from = elementDiffs.from
    if (to === undefined && from !== undefined) {
      removeDomCount++
      return
    }
    if (to !== undefined && from === undefined) {
      addDomCount++
      return
    }
    if (to !== undefined && from !== undefined) {
      if ('tagName' in to && 'tagName' in from && to.tagName === from.tagName) {
        changeDomCount++
        return
      }
      addDomCount++
      removeDomCount++
    }
  }

  infos.forEach((info) => {
    switch (info.type) {
      case 'class':
      case 'style':
        changeStyleCount++
        break
      case 'dom':
        info.elementDiffs && domChanges(info.elementDiffs)
      default:
        break
    }
  })

  return {
    removeDomCount,
    addDomCount,
    changeDomCount,
    changeStyleCount,
  }
}
