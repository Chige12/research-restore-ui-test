<template>
  <div v-if="state.file.length !== 0">
    <v-dialog v-model="state.dialog" width="1000">
      <template v-slot:activator="{ on, attrs }">
        <div class="ma-4">
          <v-btn class="mb-2" @click="generateCombinationList"
            >generate comvination</v-btn
          >
          <v-row align="center">
            <v-col cols="6">
              <v-select
                :items="[''].concat(state.file.map((x) => x.fileName))"
                v-model="state.selectedFileA"
                label="[ A ]"
                outlined
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                :items="[''].concat(state.file.map((x) => x.fileName))"
                v-model="state.selectedFileB"
                label="[ B ]"
                outlined
              ></v-select>
            </v-col>
          </v-row>
        </div>
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
                <th class="text-left">Button</th>
                <!-- <th class="text-left" v-for="(indexName, inNa_Key) in state.diffsDiffsArr[0]" :key="`inNa-${inNa_Key}`">{{}}</th> -->
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(combi, c_key) in state.combinationList"
                :key="`combi-${c_key}`"
              >
                <td>
                  {{
                    combi[0].bitId !== undefined && combi[1].bitId !== undefined
                      ? combi[0].bitId + combi[1].bitId
                      : ''
                  }}
                </td>
                <td>{{ combi[0].bitId }}</td>
                <td>{{ combi[0].fileName }}</td>
                <td>{{ combi[0].index }}</td>
                <td>{{ combi[1].index }}</td>
                <td>{{ combi[1].fileName }}</td>
                <td>{{ combi[1].bitId }}</td>
                <td>{{ state.diffsDiffsArr[c_key].diffsDiffs.length }}</td>
                <td>
                  <v-btn
                    @click="
                      state.key = c_key
                      state.dialogType = 'preview'
                    "
                    v-bind="attrs"
                    v-on="on"
                    small
                    >Preview</v-btn
                  >
                  <v-btn
                    @click="
                      state.key = c_key
                      state.dialogType = 'showTree'
                    "
                    v-bind="attrs"
                    v-on="on"
                    small
                    >Show Tree</v-btn
                  >
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </template>
      <v-card>
        <div class="pa-4" v-if="state.dialogType === 'preview'">
          <div>
            <v-btn icon @click="state.indexNumber++"
              ><v-icon> mdi-plus </v-icon></v-btn
            >
            <span>{{ state.indexNumber }}</span>
            <v-btn icon @click="state.indexNumber--"
              ><v-icon> mdi-minus </v-icon></v-btn
            >
          </div>
          <div class="mb-4" style="position: relative">
            <div v-html="eventFiringElements[0]"></div>
          </div>
          <div style="position: relative">
            <div v-html="eventFiringElements[1]"></div>
          </div>
        </div>
        <div class="pa-4" v-if="state.dialogType === 'showTree'">
          <div
            class="my-2"
            v-for="(diff, dd_key) in state.diffsDiffsArr[state.key].diffsDiffs"
            :key="`diffsDiffs-${dd_key}`"
          >
            {{ diff }}
          </div>
        </div>
        <v-card-actions>
          <v-btn @click="state.dialog = false">close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <div v-else>
    <v-btn to="createDiffs">Go to createDiffs</v-btn>
  </div>
</template>
<script lang="ts">
import { cloneDeep } from 'lodash'
import { defineComponent } from 'vue'
import { useHistoriesByFileStore } from '~/composables/globalState'
import { DiffsDiffs } from '~/types/diffsDiffs'
import { HistoriesByFile, HistoryAndFileData } from '~/types/history'
import { CombinationList } from '~/utils/checkDiffs/checkDiffsType'
import {
  generateDiffsDiffsArr,
  getAllEventHistories,
  generateEventFiringElements,
  getCombinationList,
  getCombinationListByFile,
} from '~/utils/checkDiffs/checkDiffsUtils'

type State = {
  file: HistoriesByFile
  selectedFileA: string
  selectedFileB: string
  combinationList: CombinationList
  diffsDiffsArr: DiffsDiffs[]
  key: number
  dialog: boolean
  dialogType: 'preview' | 'showTree'
  indexNumber: number
  eventFiringElements: (string | null)[]
}

export default defineComponent({
  setup() {
    const { historiesByFile } = useHistoriesByFileStore()

    const state = reactive<State>({
      file: [],
      selectedFileA: '',
      selectedFileB: '',
      combinationList: [],
      diffsDiffsArr: [],
      dialog: false,
      dialogType: 'preview',
      key: 0,
      indexNumber: 2,
      eventFiringElements: [null, null],
    })

    const createBitList = (n: number) => [...Array(n)].map((_, i) => 1 << i)

    onMounted(() => {
      const file = cloneDeep(historiesByFile.value)
      state.file = file
    })

    const generateCombinationList = () => {
      const allEventHistories = getAllEventHistories(state.file)
      const bitList = createBitList(allEventHistories.length)
      const allEventHistoriesWithBitId = allEventHistories.map((x, i) => ({
        ...x,
        bitId: bitList[i],
      }))
      const combinationList = getCombinationList(allEventHistoriesWithBitId)
      state.combinationList = combinationList
      state.diffsDiffsArr = generateDiffsDiffsArr(combinationList)
    }

    const eventFiringElements = computed(() => {
      const index = state.indexNumber * 2
      if (state.combinationList.length === 0) return [null, null]
      const [A, B] = state.combinationList[state.key]
      return generateEventFiringElements(A.history, B.history, index)
    })

    const addBitId = (x: HistoryAndFileData[]) =>
      x.map((x, i) => ({ ...x, bitId: i }))

    watchEffect(() => {
      const fileNameA = state.selectedFileA
      const fileNameB = state.selectedFileB
      if (fileNameA === '' || fileNameB === '') return

      const fileA: HistoriesByFile = state.file.filter(
        (x) => x.fileName === fileNameA
      )
      const fileB: HistoriesByFile = state.file.filter(
        (x) => x.fileName === fileNameB
      )

      console.log(state.file, fileA, fileB)

      const AEventHistories = addBitId(getAllEventHistories(fileA))
      const BEventHistories = addBitId(getAllEventHistories(fileB))

      const combinationList = getCombinationListByFile(
        AEventHistories,
        BEventHistories
      )
      state.combinationList = combinationList
      state.diffsDiffsArr = generateDiffsDiffsArr(combinationList)
    })

    return {
      state,
      historiesByFile,
      eventFiringElements,
      generateCombinationList,
    }
  },
})
</script>
