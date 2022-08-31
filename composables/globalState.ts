import { readonly, ref } from 'vue'
import { JsonFile } from '~/mixins/deepDiffType'
import { HistoriesByFile } from '~/utils/createDiffs/breadcrumbs'

export const useJsonFiles = () => {
  const initialState = [] as JsonFile[]
  const state = ref(initialState)
  const setJsonFiles = (jsonFiles: JsonFile[]) => {
    state.value = jsonFiles
  }

  return { jsonFiles: readonly(state), setJsonFiles }
}

export const useHistoriesByFileStore = () => {
  const initialState = [] as HistoriesByFile
  const state = useState('historiesByFile', () => initialState)
  const setHistoriesByFile = (historiesByFile: HistoriesByFile) => {
    state.value = historiesByFile
  }

  return {
    historiesByFile: shallowReadonly(state),
    setHistoriesByFile,
  }
}

export const useMatchingsByFileStore = () => {
  const initialState = [] as MatchingsByFile
  const state = useState('matchingsByFile', () => initialState)
  const setMatchingsByFile = (matchingsByFile: MatchingsByFile) => {
    state.value = matchingsByFile
  }

  return {
    historiesByFile: shallowReadonly(state),
    setMatchingsByFile,
  }
}
