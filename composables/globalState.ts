import { readonly, ref } from 'vue'
import { JsonFile } from '~/mixins/deepDiffType'
import { HistoriesByFile } from '~/utils/recording/paths'

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
    historiesByFile: readonly(state),
    setHistoriesByFile,
  }
}
