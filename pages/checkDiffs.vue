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
        <v-simple-table class="ma-4">
          <template #default>
            <thead>
              <tr>
                <th class="text-left">bit</th>
                <th class="text-left">bit X</th>
                <th class="text-left">name X</th>
                <th class="text-left">index X</th>
                <th class="text-left">index Y</th>
                <th class="text-left">name Y</th>
                <th class="text-left">bit Y</th>
                <th class="text-left">Button</th>
                <th class="text-left" v-for="(name, inNa_Key) in state.usedIndicatorNames" :key="`inNa-${inNa_Key}`">{{name}}</th>
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
                <td>{{ combi[0].fileName.slice(14, -5) }}</td>
                <td>{{ combi[0].index }}</td>
                <td>{{ combi[1].index }}</td>
                <td>{{ combi[1].fileName.slice(14, -5) }}</td>
                <td>{{ combi[1].bitId }}</td>
                <td>
                  <v-btn
                    @click="
                      state.key = c_key
                      state.dialogType = 'preview'
                    "
                    class="mt-1"
                    v-bind="attrs"
                    v-on="on"
                    x-small outlined color="primary"
                    >Preview</v-btn
                  ><br/>
                  <v-btn
                    @click="
                      state.key = c_key
                      state.dialogType = 'showTree'
                    "
                    class="my-1"
                    v-bind="attrs"
                    v-on="on"
                    x-small outlined
                    >Show Tree</v-btn
                  >
                </td>
                <td v-for="(value, inVa_key) in state.indicatorsByEachCombination[c_key].values" :key="`inVa-${inVa_key}`">{{ value.number }}</td>
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
            <div v-html="state.eventFiringElements[0]"></div>
          </div>
          <div style="position: relative">
            <div v-html="state.eventFiringElements[1]"></div>
          </div>
        </div>
        <div class="pa-4" v-if="state.dialogType === 'showTree'">
          <div
            class="my-2"
            v-for="(diff, TEDDiff_key) in indicatorTEDDiffs"
            :key="`TEDDiff-${TEDDiff_key}`"
          >
            {{ diff }}
          </div>
          <div v-if="indicatorTEDDiffs.length === 0">差分なし</div>
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
import { Indicator } from '~/types/indicator'
import { HistoriesByFile, HistoryAndFileData } from '~/types/history'
import { CombinationList } from '~/utils/checkDiffs/checkDiffsType'
import {
  generateIndicatorsByEachCombination,
  getAllEventHistories,
  generateEventFiringElements,
  getCombinationList,
  getCombinationListByFile,
  getUsedIndicatorNames,
} from '~/utils/checkDiffs/checkDiffsUtils'

type State = {
  file: HistoriesByFile
  usedIndicatorNames: string[]
  selectedFileA: string
  selectedFileB: string
  combinationList: CombinationList
  indicatorsByEachCombination: Indicator[]
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
      usedIndicatorNames: [],
      selectedFileA: '',
      selectedFileB: '',
      combinationList: [],
      indicatorsByEachCombination: [],
      dialog: false,
      dialogType: 'preview',
      key: 0,
      indexNumber: 0,
      eventFiringElements: [null, null],
    })

    const createBitList = (n: number) => [...Array(n)].map((_, i) => 1 << i)

    const addBitIdToHistory = (history: HistoryAndFileData[]) => {
      const bitList = createBitList(history.length)
      return history.map((x, i) => ({ ...x, bitId: bitList[i] }))
    }

    onMounted(() => {
      const file = cloneDeep(historiesByFile.value)
      state.file = file

      state.usedIndicatorNames = getUsedIndicatorNames()
    })

    const indicatorTEDDiffs = computed(() => {
      const {key, indicatorsByEachCombination} = state
      if (!indicatorsByEachCombination[key]) return []
      const value = indicatorsByEachCombination[key].values[0]
      return value.diffs ? value.diffs : []
    })

    const generateCombinationList = () => {
      const allEventHistories = getAllEventHistories(state.file)
      const allEventHistoriesWithBitId = addBitIdToHistory(allEventHistories)
      const combinationList = getCombinationList(allEventHistoriesWithBitId)
      state.indicatorsByEachCombination = generateIndicatorsByEachCombination(combinationList)
      state.combinationList = combinationList
    }

    watchEffect(async () => {
      const index = state.indexNumber * 2
      if (state.combinationList.length === 0) return [null, null]
      const [A, B] = state.combinationList[state.key]
      state.eventFiringElements = await generateEventFiringElements(A.history, B.history, index)
    })

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

      const AEventHistories = addBitIdToHistory(getAllEventHistories(fileA))
      const BEventHistories = addBitIdToHistory(getAllEventHistories(fileB))

      const combinationList = getCombinationListByFile(
        AEventHistories,
        BEventHistories
      )
      state.combinationList = combinationList
      state.indicatorsByEachCombination = generateIndicatorsByEachCombination(combinationList)
    })

    return {
      state,
      historiesByFile,
      indicatorTEDDiffs,
      generateCombinationList,
    }
  },
})
</script>
