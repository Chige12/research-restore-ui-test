import { HastNode } from 'hast-util-from-dom/lib'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import { Path } from '../types/diffs'
import { hasProperty } from './check'

export type newRootElement = HastNode & {
  brothers?: newRootElement
  parent?: newRootElement
}

const getPathById = (hast: HastNode, elementId: string): Path => {
  // 特定のエレメントのIDを検索してそのエレメントまでのpathを返す
  const key = 'id'
  const path: Path = []
  const keyExists = (obj: any, key: string): boolean => {
    if (!obj || (typeof obj !== 'object' && !Array.isArray(obj))) {
      return false
    } else if (hasProperty(obj, key) && obj[key] === elementId) {
      return true
    } else if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const result = keyExists(obj[i], key)
        if (result) {
          path.push(i)
          return result
        }
      }
    } else {
      for (const k in obj) {
        const result = keyExists(obj[k], key)
        if (result) {
          path.push(k)
          return result
        }
      }
    }
    return false
  }

  keyExists(hast, key)
  return path.reverse()
}

const generateElementsDeletedChildArr = (element: HastNode, pathArr: Path) => {
  const elementsDeleteChildArr = pathArr.map((_path, index, arr) => {
    const deleteChildPath = arr.slice(0, index + 2)
    const deleteChildProperty = deleteChildPath.slice(-1)[0] // 配列の最後だけ取得
    const deleteChildElement = cloneDeep(
      get(element, deleteChildPath.slice(0, -1))
    ) // 最後だけ除いて取得
    // 親を示す際に、自分が含まれてしまうので消去し、兄弟だけにする。
    if (deleteChildProperty !== 'properties') {
      deleteChildElement[deleteChildProperty] = 'me'
    }
    return deleteChildElement
  })
  // 最後同じオブジェクトが続いてしまうので消去
  return elementsDeleteChildArr.slice(0, -1)
}

const generateNewRootPathElementsByArr = (
  elemArr: HastNode[]
): newRootElement => {
  let newElement = {} as newRootElement
  for (let i = 0; i < elemArr.length; i++) {
    let element: newRootElement = cloneDeep(elemArr[i])
    if (i === 0) {
      newElement = element
    } else if (Array.isArray(element)) {
      newElement = { ...newElement, brothers: element }
    } else {
      element = { ...element, parent: newElement }
      newElement = cloneDeep(element)
    }
  }
  return newElement
}

export const getNewRootPathElements = (
  hast: HastNode,
  newRootId: string
): newRootElement => {
  const pathToRoot = getPathById(hast, newRootId)
  const elementsDeleteChildArr = generateElementsDeletedChildArr(
    hast,
    pathToRoot
  )
  const newRootPathElements = generateNewRootPathElementsByArr(
    elementsDeleteChildArr
  )
  return newRootPathElements
}

export const getEventFiringElement = (
  hast: HastNode,
  id: string,
  minus: number
): HastNode => {
  const path = getPathById(hast, id)
  const index = path.lastIndexOf('children')
  const lastHastPath = index !== -1 ? path.slice(0, index - minus) : path

  const eventFiringHast: HastNode = get(cloneDeep(hast), lastHastPath)
  console.log(eventFiringHast)
  return eventFiringHast
}
