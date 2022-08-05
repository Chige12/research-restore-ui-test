<template>
  <div>
    {{historiesByFile}}
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { useHistoriesByFileStore } from '~/composables/globalState'

const { historiesByFile } = useHistoriesByFileStore()

export default defineComponent({
  setup() {
    return {
      historiesByFile
    }
  },
})
</script>
