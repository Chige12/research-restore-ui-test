<template>
  <div v-if="historiesByFile.length !== 0">
    <v-btn @click="generateCombinationList">generate comvination</v-btn>
    <v-simple-table>
      <template #default>
        <thead>
          <tr>
            <th class="text-left">bit</th>
            <th class="text-left">bitId [A]</th>
            <th class="text-left">name [A]</th>
            <th class="text-left">index [A]</th>
            <th class="text-left">index [B]</th>
            <th class="text-left">name [B]</th>
            <th class="text-left">bitId [B]</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(combination, c_key) in state.combinationList"
            :key="`combination-${c_key}`"
          >
            <td>{{combination[0].bitId + combination[1].bitId}}</td>
            <td>{{combination[0].bitId}}</td>
            <td>{{combination[0].name}}</td>
            <td>{{combination[0].index}}</td>
            <td>{{combination[1].index}}</td>
            <td>{{combination[1].name}}</td>
            <td>{{combination[1].bitId}}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>
<script lang="ts">
import cloneDeep from 'lodash/cloneDeep'
import { defineComponent } from 'vue'
import { useHistoriesByFileStore } from '~/composables/globalState'
import { DataHistory, HistoriesByFile } from '~/utils/createDiffs/breadcrumbs'

type EventHistory = {
  name: string
  index: number
  history: DataHistory
}

type EventHistoryWithBitId = EventHistory & {
  bitId: number 
}

type CombinationList = EventHistoryWithBitId[][]

type State = {
  combinationList: CombinationList
}

export default defineComponent({
  setup() {
    const { historiesByFile } = useHistoriesByFileStore()

    const state = reactive<State>({
      combinationList: [],
    })

    const getAllEventHistories = (file: HistoriesByFile): EventHistory[] => {
      let allEventHistories = [] as EventHistory[]
      for (let i = 0; i < file.length; i++) {
        for (let h = 0; h < file[i].histories.length; h++) {
          const history = file[i].histories[h];
          const oneEventHistory: EventHistory = {
            name: file[i].name,
            index: h,
            history,
          }
          allEventHistories.push(oneEventHistory)
        }
      }
      return allEventHistories
    }

    const getCombinationList = (list: EventHistoryWithBitId[]): CombinationList => {
      let combinationList = [];
      for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < i; j++) {
          if (list[i].name === list[j].name) continue
          combinationList.push([list[i], list[j]]);
        }
      }
      return combinationList;
    }

    const createBitList = (n: number) => [...Array(n)].map((_, i) => 1 << i);

    const generateCombinationList = () => {
      const file = cloneDeep(historiesByFile.value)
      const allEventHistories = getAllEventHistories(file)
      const bitList = createBitList(allEventHistories.length)
      const allEventHistoriesWithBitId = allEventHistories.map((x, i) => ({ ...x, bitId: bitList[i]}))
      const combinationList = getCombinationList(allEventHistoriesWithBitId)
      state.combinationList = combinationList
    }

    const calculateEditDistance = () => {
      
    }

    return {
      state,
      historiesByFile,
      generateCombinationList
    }
  },
})
</script>
