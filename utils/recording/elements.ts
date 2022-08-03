export const setIdToAllElements = (
  pathName: string,
  rootElement: HTMLElement
) => {
  rootElement.querySelectorAll('*').forEach((node, _index) => {
    if (node.id) return

    const random = Math.random().toString(32).substring(2)
    const id = `ReReUiTestId${pathName}-${node.tagName}-${random}`
    node.setAttribute('id', id)
  })
}
