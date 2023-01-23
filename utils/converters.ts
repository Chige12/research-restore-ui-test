import { HistoryAndFileData } from '~/types/history'
import { Group } from './guessCombination/type'

export const fileNameToAlphabet = (fileName: string): string => {
  switch (fileName) {
    case 'diffHistories-signin-comp01.json':
      return 'A_1'
    case 'diffHistories-signin-comp01-2.json':
      return 'A_2'
    case 'diffHistories-signin-comp02.json':
      return 'B_1'
    case 'diffHistories-signin-comp02-2.json':
      return 'B_2'
    case 'diffHistories-signin-elementUI.json':
      return 'C_1'
    case 'diffHistories-signin-elementUI-2.json':
      return 'C_2'
    case 'diffHistories-signin-iView.json':
      return 'D_1'
    case 'diffHistories-signin-iView-2.json':
      return 'D_2'
    case 'diffHistories-search-search01.json':
      return 'E_1'
    case 'diffHistories-search-search01-2.json':
      return 'E_2'
    case 'diffHistories-search-search01-3.json':
      return 'E_3'
    case 'diffHistories-search-search01-4.json':
      return 'E_4'
    case 'diffHistories-search-search01-5.json':
      return 'E_5'
    case 'diffHistories-search-search01-6.json':
      return 'E_6'
    case 'diffHistories-search-search02.json':
      return 'F_1'
    case 'diffHistories-search-search02-2.json':
      return 'F_2'
    case 'diffHistories-search-search02-3.json':
      return 'F_3'
    case 'diffHistories-search-search02-4.json':
      return 'F_4'
    case 'diffHistories-search-search02-5.json':
      return 'F_5'
    case 'diffHistories-search-search02-6.json':
      return 'F_6'
    default:
      return fileName
  }
}

export const changeToTejunNumber = (
  opNum: number,
  index: number,
  group: Group
): number => {
  // [n,m] → xの手順番号がnのとき，xの変換コマンドはn-1
  const signin = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
  ]
  const table = [
    [1, 2, 3, 4, 5, 6, 7],
    [1, 2, 3, 6, 7, 4, 5],
    [4, 5, 1, 2, 3, 6, 7],
    [6, 7, 1, 2, 3, 4, 5],
    [4, 5, 6, 7, 1, 2, 3],
    [6, 7, 4, 5, 1, 2, 3],
  ]

  const changeCommandList = group === 'signin' ? signin : table
  const tejunNumber = changeCommandList[opNum - 1][index]
  return tejunNumber - 1
}

export const alphabetToGroup = (alphabet: string): Group | undefined => {
  switch (alphabet) {
    case 'A':
    case 'B':
    case 'C':
    case 'D':
      return 'signin'
    case 'E':
    case 'F':
      return 'table'
    default:
      return undefined
  }
}

export type AlphabetAndOpAndGroup = {
  alphabet: string
  opNum: number
  group: Group | undefined
}

export const fileNameToAlphabetAndOpAndGroup = (
  fileName: string
): AlphabetAndOpAndGroup => {
  const [alphabet, opNum] = fileNameToAlphabet(fileName).split('_')
  const group = alphabetToGroup(alphabet)
  return {
    alphabet,
    opNum: Number(opNum),
    group,
  }
}

export const indexToTarget = (
  opNum: number,
  index: number,
  group: Group
): string | null => {
  const tejunNumber = changeToTejunNumber(opNum, index, group)
  if (group === 'signin') {
    switch (tejunNumber) {
      case 0:
      case 1:
        return 'email'
      case 2:
      case 3:
        return 'password'
      default:
        return null
    }
  }
  if (group === 'table') {
    switch (tejunNumber) {
      case 0:
      case 1:
      case 2:
        return 'search'
      case 3:
        return 'selector'
      case 4:
        return 'selectorItem'
      case 5:
        return 'nextPage'
      case 6:
        return 'prevPage'
      default:
        return null
    }
  }
  return null
}

export const fileXYToTargetXY = (
  comb: HistoryAndFileData[]
): (string | null)[] => {
  const [fileX, fileY] = comb
  const { opNum: opNumX, group } = fileNameToAlphabetAndOpAndGroup(
    fileX.fileName
  )
  const { opNum: opNumY } = fileNameToAlphabetAndOpAndGroup(fileY.fileName)
  if (!group) console.error('Error: group is undefined')
  const targetX = indexToTarget(opNumX, fileX.index, group ? group : 'table')
  const targetY = indexToTarget(opNumY, fileY.index, group ? group : 'table')
  if (!targetX || !targetY) console.error('taget is null', targetX, targetY)
  return [targetX, targetY]
}
