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
  opNum: string,
  index: number,
  group: 'signin' | 'table'
): number => {
  // [n,m] → xの手順番号がnのとき，xの変換コマンドはn-1
  const signin = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
  ]
  const table = [
    [1, 2, 3, 4, 5, 6, 7],
    [1, 2, 5, 6, 7, 3, 4],
    [4, 5, 1, 2, 3, 6, 7],
    [6, 7, 1, 2, 3, 4, 5],
    [4, 5, 6, 7, 1, 2, 3],
    [6, 7, 4, 5, 1, 2, 3],
  ]

  const changeCommandList = group === 'signin' ? signin : table
  const tejunNumber = changeCommandList[Number(opNum) - 1][index]
  return tejunNumber - 1
}

export const alphabetToGroup = (alphabet: string) => {
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
