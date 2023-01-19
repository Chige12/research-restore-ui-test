import { readonly, ref } from 'vue'
import { JsonFile } from '~/utils/jsonFilesType'

export const useJsonFiles = () => {
  const initialState = [] as JsonFile[]
  const state = ref(initialState)
  const setJsonFiles = (jsonFiles: JsonFile[]) => {
    state.value = jsonFiles
  }

  return { jsonFiles: readonly(state), setJsonFiles }
}

export const useFileStore = <T>(key: string, initialState: T) => {
  const state = useState(key, () => initialState)
  const setState = (value: T) => {
    state.value = value
  }

  return {
    state: shallowReadonly(state),
    setState,
  }
}
