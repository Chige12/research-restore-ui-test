import { HastElement } from 'hast-util-from-dom/lib'
import get from 'lodash/get'
import { Diff, Diffs, Path } from '../../types/diffs'
import { hasProperty } from '../check'
import { newRootElement } from '../getNewRootPathElements'
import { CSSStyle } from '../recording/styles'

export type PropertiesExcludingSome = {
  type?: string
  value?: string
}

export type BreadcrumbsPath = Array<{
  path: string | number
  type?: string
  styles?: CSSStyle[]
  tagName?: string
  properties?: PropertiesExcludingSome
}>

export type DiffWithBreadcrumbsPath = Array<
  Diff & {
    breadcrumbsPath: BreadcrumbsPath
  }
>

export const createDiffsWithBreadcrumbsPath = (
  diffs: Diffs,
  toHast: newRootElement
): DiffWithBreadcrumbsPath => {
  return diffs.map((diff) => {
    const { path } = diff
    const breadcrumbsPath = createBreadCrumbsPath(path, toHast)
    return {
      ...diff,
      breadcrumbsPath,
      // ここにto, fromを足す
    }
  })
}

const createBreadCrumbsPath = (
  pathArr: Path,
  toHast: newRootElement
): BreadcrumbsPath => {
  return pathArr.map((path, index) => {
    const currentValuePath = pathArr.slice(0, index + 1)
    const currentValue: newRootElement = get(toHast, currentValuePath)

    const type = hasProperty(currentValue, 'type')
      ? currentValue.type
      : undefined
    const styles = undefined
    const tagName = hasProperty(currentValue, 'tagName')
      ? currentValue.tagName
      : undefined
    const properties = getPropertiesItem(currentValue)

    return {
      path,
      type,
      styles,
      tagName,
      properties,
    }
  })
}

const getPropertiesItem = (
  currentValue: newRootElement
): PropertiesExcludingSome | undefined => {
  if (hasProperty(currentValue, 'type') && currentValue.type === 'element') {
    return getPropertiesItemFromElement(currentValue.properties)
  }
  return undefined
}

const getPropertiesItemFromElement = (
  properties: HastElement['properties']
): PropertiesExcludingSome | undefined => {
  if (properties === undefined) return undefined

  const type = hasProperty(properties, 'type')
    ? (properties.type as string)
    : undefined
  const value = hasProperty(properties, 'value')
    ? (properties.value as string)
    : undefined

  if (type === undefined && value === undefined) return undefined
  return {
    type,
    value,
  }
}
