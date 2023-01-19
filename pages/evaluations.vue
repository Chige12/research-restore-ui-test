<template>
  <div class="ma-4">
    <v-btn to="guessCombination" outlined>Go to guessCombination</v-btn>
    <div v-if="createdIndicatorNames.length !== 0">
      <span class="ma-1" v-for='(name, nameIndex) in createdIndicatorNames' :key="`indicator-name-${nameIndex}`">{{name}}</span>
    </div>
    <div v-else>
      <p>まだ指標が作成できていません</p>
    </div>
    <CorrectRate :arr="matchingsByFilesAndIndicator" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { useFileStore } from '~/composables/globalState'

import {
  MatchingsByFilesAndIndicator,
} from '~/utils/guessCombination/type'

type State = {
  isShow: boolean
}

export default defineComponent({
  setup() {
    const { state: matchingsByFilesAndIndicator } = useFileStore<
      MatchingsByFilesAndIndicator[]
    >('matchingsByFilesAndIndicator', [])

    const state = reactive<State>({
      isShow: true,
    })

    onMounted(() => {
      
    })

    watchEffect(async () => {})

    const createdIndicatorNames = computed(() => {
      return matchingsByFilesAndIndicator.value.map(x => x.indicator)
    })

    return {
      state,
      createdIndicatorNames,
      matchingsByFilesAndIndicator,
    }
  },
})
</script>
