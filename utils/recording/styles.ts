import cssProperties from 'css-properties'

export type StylesPerElements = StylesAndId[]

export const getAllElementStylesAndId = (
  rootElement: HTMLElement
): StylesPerElements => {
  const allElement = Array.from(rootElement.querySelectorAll('*'))
  const allElementStylesAndId = allElement.map((node: Element) => {
    return getElementStylesAndId(node, node.id)
  })
  return allElementStylesAndId
}

export type StylesAndId = {
  id: string
  styles: CSSStyle[]
}

const getElementStylesAndId = (elem: Element, id: string): StylesAndId => {
  const styles = getStyles(elem)
  return { id, styles }
}

export type CSSStyle = {
  property: string
  value: string
}

export const getStyles = (element: Element): CSSStyle[] => {
  const compStyles = window.getComputedStyle(element)
  const styles = cssProperties as string[]
  return styles.map((property) => {
    const value = compStyles.getPropertyValue(property)
    return {
      property,
      value,
    }
  })
}
