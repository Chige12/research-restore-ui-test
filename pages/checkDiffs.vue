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
                v-model="state.selectedFileX"
                label="[ A ]"
                outlined
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                :items="[''].concat(state.file.map((x) => x.fileName))"
                v-model="state.selectedFileY"
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
import { HistoriesByFile } from '~/types/history'
import {
  generateIndicatorsByEachCombination,
  getAllEventHistories,
  generateEventFiringElements,
  getCombinationList,
  getCombinationListByFile,
  getUsedIndicatorNames,
  addBitIdToHistory,
} from '~/utils/checkDiffs/checkDiffsUtils'
import { CombinationList } from '~/types/combination'

type State = {
  file: HistoriesByFile
  usedIndicatorNames: string[]
  showIndexes: number[]
  selectedFileX: string
  selectedFileY: string
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
      showIndexes: [7],
      selectedFileX: '',
      selectedFileY: '',
      combinationList: [],
      indicatorsByEachCombination: [],
      dialog: false,
      dialogType: 'preview',
      key: 0,
      indexNumber: 0,
      eventFiringElements: [null, null],
    })


    onMounted(() => {
      const file = cloneDeep(historiesByFile.value)
      state.file = file

      state.usedIndicatorNames = getUsedIndicatorNames(state.showIndexes)
    })

    const indicatorTEDDiffs = computed(() => {
      const {key, indicatorsByEachCombination} = state
      if (!indicatorsByEachCombination[key]) return []
      const value = indicatorsByEachCombination[key].values[0]
      return value.diffs ? value.diffs : []
    })

    const generateCombinationList = () => {
      const allEventHistories = getAllEventHistories(state.file)
      const allEventHistoriesWithBitId = addBitIdToHistory(allEventHistories, 0)
      const combinationList = getCombinationList(allEventHistoriesWithBitId)
      state.indicatorsByEachCombination = generateIndicatorsByEachCombination(combinationList, state.showIndexes)
      state.combinationList = combinationList
    }

    watchEffect(async () => {
      const index = state.indexNumber * 2
      if (state.combinationList.length === 0) return [null, null]
      const [A, B] = state.combinationList[state.key]
      state.eventFiringElements = await generateEventFiringElements(A.history, B.history, index)
    })

    watchEffect(() => {
      const fileNameX = state.selectedFileX
      const fileNameY = state.selectedFileY
      if (fileNameX === '' || fileNameY === '') return

      const fileX: HistoriesByFile = state.file.filter(
        (x) => x.fileName === fileNameX
      )
      const fileY: HistoriesByFile = state.file.filter(
        (x) => x.fileName === fileNameY
      )

      const fileXEventHistories = addBitIdToHistory(getAllEventHistories(fileX), 0)
      const fileYEventHistories = addBitIdToHistory(getAllEventHistories(fileY), fileXEventHistories.length)

      const combinationList = getCombinationListByFile(
          fileXEventHistories,
          fileYEventHistories
        )
      state.combinationList = combinationList
      state.indicatorsByEachCombination = generateIndicatorsByEachCombination(combinationList, state.showIndexes)
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
