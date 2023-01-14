<template>
  <div v-if="state.file.length !== 0">
    <v-dialog v-model="state.dialog" width="1000">
      <template v-slot:activator="{ on, attrs }">
        <div class="ma-4">
          <v-row>
            <v-col cols="3">
              <v-switch
                v-model="state.isShow"
                :label="`show: ${state.isShow ? 'ON ' : 'OFF'}`"
              ></v-switch>
            </v-col>
            <v-col cols="3">
              <v-select
                v-model="state.useIndicatorName"
                :items="state.usedIndicatorNames"
                label="Select Indicator"
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-btn class="mb-8" @click="guessCombination" fill color="primary" elevation="0">guess comvination</v-btn>
            </v-col>
          </v-row>
          <div class="mb-12"
            v-for="(match, m_key) in state.matchingsByFiles"
            :key="`match-${m_key}`"
          >
            <v-row>
              <v-col cols="6">
                <h4>
                  X: {{ fileNameToAlphabet(match.fileNameX) }} |
                  {{ match.fileNameX }}
                </h4>
              </v-col>
              <v-col cols="6">
                <h4>
                  Y: {{ fileNameToAlphabet(match.fileNameY) }} |
                  {{ match.fileNameY }}
                </h4>
              </v-col>
            </v-row>

            <v-simple-table>
              <template #default>
                <thead>
                  <tr>
                    <th v-if="!state.isShow" class="text-left">X</th>
                    <th v-if="!state.isShow" class="text-left">Y</th>
                    <th v-if="state.isShow" class="text-left">bit</th>
                    <th v-if="state.isShow" class="text-left">bit X</th>
                    <th v-if="state.isShow" class="text-left">name X</th>
                    <th class="text-left">index X</th>
                    <th class="text-left">index Y</th>
                    <th v-if="state.isShow" class="text-left">name Y</th>
                    <th v-if="state.isShow" class="text-left">bit Y</th>
                    <th v-if="state.isShow" class="text-left">Button</th>
                    <th class="text-left" v-for="(name, inNa_Key) in useIndicatorNameList" :key="`inNa-${inNa_Key}`">{{name}}</th>
                    <th class="text-left">正誤</th>
                    <th class="text-left">判定</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(match, c_key) in match.matchings"
                    :key="`match.combination-${c_key}`"
                  >
                    <td v-if="state.isShow">
                      {{
                        match.combination[0].bitId !== undefined &&
                        match.combination[1].bitId !== undefined
                          ? match.combination[0].bitId +
                            match.combination[1].bitId
                          : ''
                      }}
                    </td>
                    <td v-if="!state.isShow">{{ fileNameToAlphabet(match.combination[0].fileName) }}</td>
                    <td v-if="!state.isShow">{{ fileNameToAlphabet(match.combination[1].fileName) }}</td>
                    <td v-if="state.isShow">{{ match.combination[0].bitId }}</td>
                    <td v-if="state.isShow">{{ match.combination[0].fileName.slice(14, -5) }}</td>
                    <td>{{ match.combination[0].index }}</td>
                    <td>{{ match.combination[1].index }}</td>
                    <td v-if="state.isShow">{{ match.combination[1].fileName.slice(14, -5) }}</td>
                    <td v-if="state.isShow">{{ match.combination[1].bitId }}</td>
                    <td v-if="state.isShow">
                      <v-btn
                        @click="
                          state.combKey = c_key
                          state.matchKey = m_key
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
                          state.combKey = c_key
                          state.matchKey = m_key
                          state.dialogType = 'showTree'
                        "
                        class="my-1"
                        v-bind="attrs"
                        v-on="on"
                        x-small outlined
                        >Show Tree</v-btn
                      >
                    </td>
                    <td v-for="(value, inVa_key) in match.indicator.values" :key="`inVa-${inVa_key}`">{{ value.number }}</td>
                    <td>{{match.judge ? '正' : '誤'}}</td>
                    <td>{{match.ableToJudge ? '可' : '不可'}}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </div>
        </div>
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
          <div v-if="indicatorTEDSubData">{{indicatorTEDSubData}}</div>
        </div>
        <v-card-actions>
          <v-btn @click="state.dialog = false">close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <div v-else class="ma-4">
    <p>まだ差分が作成できていません</p>
    <v-btn to="createDiffs" outlined>Go to createDiffs</v-btn>
  </div>
</template>
<script lang="ts">
import cloneDeep from 'lodash/cloneDeep'
import { defineComponent } from 'vue'
import { useHistoriesByFileStore } from '~/composables/globalState'
import {
  HistoriesByFile,
  HistoriesAndFileData,
} from '~/types/history'
import {
  getAllEventHistories,
  getCombinationListByFile,
  generateEventFiringElements,
  generateIndicators,
  getUsedIndicatorNames,
  addBitIdToHistory,
  indicatorNames,
} from '~/utils/checkDiffs/checkDiffsUtils'
import {
  CombinationWithIndicator,
  MatchingsWithFileName,
} from '~/utils/guessCombination/type'
import {
  Matching
} from '~/utils/guessCombination/matchingClass'

type FileCombination = {
  fileX: HistoriesAndFileData
  fileY: HistoriesAndFileData
}

type State = {
  isShow: boolean,
  file: HistoriesByFile
  usedIndicatorNames: string[]
  useIndicatorName: string
  showIndexes: number[]
  fileCombinations: FileCombination[]
  selectedFileA: string
  selectedFileB: string
  combKey: number
  matchKey: number
  dialog: boolean
  dialogType: 'preview' | 'showTree'
  indexNumber: number
  eventFiringElements: (string | null)[]
  matchingsByFiles: MatchingsWithFileName[]
}

export default defineComponent({
  setup() {
    const { historiesByFile } = useHistoriesByFileStore()

    const state = reactive<State>({
      isShow: true,
      file: [],
      usedIndicatorNames: [],
      useIndicatorName: 'VED+TED by Tree',
      showIndexes: [0, 5, 6, 7],
      fileCombinations: [],
      selectedFileA: '',
      selectedFileB: '',
      dialog: false,
      dialogType: 'preview',
      combKey: 0,
      matchKey: 0,
      indexNumber: 0,
      eventFiringElements: [null, null],
      matchingsByFiles: [],
    })

    onMounted(() => {
      const file = cloneDeep(historiesByFile.value)
      state.file = file

      state.fileCombinations = getFileCombination(state.file)
      state.usedIndicatorNames = getUsedIndicatorNames(state.showIndexes)
      state.showIndexes = [7]
      guessCombination()
    })

    const indicatorTEDDiffs = computed(() => {
      const {matchKey, combKey, matchingsByFiles} = state
      if (!matchingsByFiles[matchKey]) return []
      if (!matchingsByFiles[matchKey].matchings[combKey]) return []
      const value = matchingsByFiles[matchKey].matchings[combKey].indicator.values[0]
      return value.diffs ? value.diffs : []
    })

    const indicatorTEDSubData = computed(() => {
      const {matchKey, combKey, matchingsByFiles} = state
      if (!matchingsByFiles[matchKey]) return []
      if (!matchingsByFiles[matchKey].matchings[combKey]) return []
      const value = matchingsByFiles[matchKey].matchings[combKey].indicator.values[0]
      return value.sub ? value.sub : ''
    })

    const useIndicatorNameList = computed(() => {
      return [state.useIndicatorName]
    })

    watchEffect(async () => {
      const index = state.indexNumber * 2
      if (state.matchingsByFiles.length === 0) return [null, null]
      const matching = state.matchingsByFiles[state.matchKey].matchings
      const [X, Y] = matching[state.combKey].combination
      const eventFiringElements = await generateEventFiringElements(X.history, Y.history, index)
      state.eventFiringElements = eventFiringElements
    })

    watch(() => state.useIndicatorName, (next) => {
      state.showIndexes = [indicatorNames.findIndex(name => name === next)]
      guessCombination()
    })

    const guessCombination = () => {
      // jsonファイルAとBがもつ、それぞれの操作対象のペアをマッチングする
      if (state.fileCombinations.length === 0) return
      const matchingsByFiles = matchingsByTED(state.fileCombinations)
      state.matchingsByFiles = sortMatchingsByFileName(matchingsByFiles)
    }

    const matchingsByTED = (fileCombinations: FileCombination[]): MatchingsWithFileName[] => {
      const matchingsByFiles: MatchingsWithFileName[] = fileCombinations.filter(fileCombination => {
        const { fileX, fileY } = fileCombination
        return fileX.fileName.split('-')[1] === fileY.fileName.split('-')[1]
      }).map((fileCombination) => {
        const { fileX, fileY } = fileCombination
        const fileXEventHistories = addBitIdToHistory(getAllEventHistories([fileX]), 0)
        const fileYEventHistories = addBitIdToHistory(getAllEventHistories([fileY]), fileXEventHistories.length)
        const combinations = getCombinationListByFile(
          fileXEventHistories,
          fileYEventHistories
        )
        const combinationWithIndicators: CombinationWithIndicator[] =
          combinations.map((combination) => {
            const [X, Y] = combination
            const indicator = generateIndicators(X.history, Y.history, state.showIndexes)
            return { combination, indicator }
          })
        const { minimumCostBipartiteMatching } = new Matching(state.useIndicatorName)
        const matchings = minimumCostBipartiteMatching(combinationWithIndicators)

        const matchingsWithFileName: MatchingsWithFileName = {
          fileNameX: fileX.fileName,
          fileNameY: fileY.fileName,
          matchings,
        }
        return matchingsWithFileName
      })

      return matchingsByFiles
    }

    const sortMatchingsByFileName = (matchingsByFiles: MatchingsWithFileName[]) => {
      return cloneDeep(matchingsByFiles).sort((a, b) => {
        const a1 = fileNameToAlphabet(a.fileNameX).toLowerCase()
        const a2 = fileNameToAlphabet(b.fileNameX).toLowerCase()
        const b1 = fileNameToAlphabet(a.fileNameY).toLowerCase()
        const b2 = fileNameToAlphabet(b.fileNameY).toLowerCase()
        if (a1 < a2) return -1
        if (a1 > a2) return 1
        if (b1 < b2) return -1
        if (b1 > b2) return 1
        return 0
      })
    }

    const sortFilesByName = (files: HistoriesByFile): HistoriesByFile => {
      return files.sort((a, b) => {
        const ad = fileNameToAlphabet(a.fileName).toLowerCase()
        const bd = fileNameToAlphabet(b.fileName).toLowerCase()
        return ad < bd ? -1 : 1
      })
    }

    const getFileCombination = (files: HistoriesByFile): FileCombination[] => {
      let fileCombinations = [] as FileCombination[]
      for (let i = 0; i < files.length; i++) {
        for (let j = 0; j < i; j++) {
          if (files[i].fileName === files[j].fileName) continue
          const sortedFiles = sortFilesByName([files[i], files[j]])
          const fileCombination = {
            fileX: sortedFiles[0],
            fileY: sortedFiles[1],
          }
          fileCombinations.push(fileCombination)
        }
      }
      return fileCombinations
    }

    const fileNameToAlphabet = (fileName: string): string => {
      switch (fileName) {
        case 'diffHistories-signin-comp01.json':
          return 'A'
        case 'diffHistories-signin-comp02.json':
          return 'B'
        case 'diffHistories-signin-elementUI.json':
          return 'C'
        case 'diffHistories-signin-iView.json':
          return 'D'
        case 'diffHistories-signin-comp01-2.json':
          return 'E'
        case 'diffHistories-search-search01.json':
          return 'E'
        case 'diffHistories-search-search02.json':
          return 'F'
        default:
          return fileName
      }
    }

    return {
      state,
      useIndicatorNameList,
      historiesByFile,
      indicatorTEDDiffs,
      indicatorTEDSubData,
      guessCombination,
      fileNameToAlphabet,
    }
  }
})
</script>
