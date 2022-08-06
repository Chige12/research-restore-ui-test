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
            <th class="text-left">TED</th>
            <th class="text-left">TED BcP</th>
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
            <td>{{state.diffsDiffsArr[c_key].diffsDiffs.length}}</td>
            <td>{{state.diffsDiffsArr[c_key].diffsWithbreadcrumbsPathsDiffs.length}}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>
<script lang="ts">
import cloneDeep from 'lodash/cloneDeep'
import { defineComponent } from 'vue'
import { diff as justDiff } from 'just-diff'
import { useHistoriesByFileStore } from '~/composables/globalState'
import { DataHistory, HistoriesByFile } from '~/utils/createDiffs/breadcrumbs'
import { Diffs } from '~/utils/recording/diffTypes'

type EventHistory = {
  name: string
  index: number
  history: DataHistory
}

type EventHistoryWithBitId = EventHistory & {
  bitId: number 
}

type CombinationList = EventHistoryWithBitId[][]

type DiffsDiffs = {
  diffsDiffs: Diffs
  diffsWithbreadcrumbsPathsDiffs: Diffs
}

type State = {
  combinationList: CombinationList
  diffsDiffsArr: DiffsDiffs[]
}

export default defineComponent({
  setup() {
    const { historiesByFile } = useHistoriesByFileStore()

    const state = reactive<State>({
      combinationList: [],
      diffsDiffsArr: []
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
      calculateEditDistance(combinationList)
    }

    const calculateEditDistance = (combinationList: CombinationList) => {
      const diffsDiffsArr = combinationList.map(combination => {
        const [ A, B ] = combination
        const diffsDiffs = justDiff(A.history.diffs, B.history.diffs)
        const diffsWithbreadcrumbsPathsDiffs = justDiff(A.history.diffsWithbreadcrumbsPaths, B.history.diffsWithbreadcrumbsPaths)
        return {
          diffsDiffs,
          diffsWithbreadcrumbsPathsDiffs,
        }
      })
      state.diffsDiffsArr = diffsDiffsArr
    }

    return {
      state,
      historiesByFile,
      generateCombinationList
    }
  },
})
</script>
