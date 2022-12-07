<template>
  <div v-if="state.file.length !== 0">
    <v-dialog v-model="state.dialog" width="1000">
      <template v-slot:activator="{ on, attrs }">
        <div class="ma-4">
          <v-btn class="mb-2" @click="guessCombination" fill color="primary" elevation="0"
            >guess comvination</v-btn
          >
          <div
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
                    v-for="(match, c_key) in match.matchings"
                    :key="`match.combination-${c_key}`"
                  >
                    <td>
                      {{
                        match.combination[0].bitId !== undefined &&
                        match.combination[1].bitId !== undefined
                          ? match.combination[0].bitId +
                            match.combination[1].bitId
                          : ''
                      }}
                    </td>
                    <td>{{ match.combination[0].bitId }}</td>
                    <td>{{ match.combination[0].fileName.slice(14, -5) }}</td>
                    <td>{{ match.combination[0].index }}</td>
                    <td>{{ match.combination[1].index }}</td>
                    <td>{{ match.combination[1].fileName.slice(14, -5) }}</td>
                    <td>{{ match.combination[1].bitId }}</td>
                    <td>
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
  HistoryAndFileData,
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
  file: HistoriesByFile
  usedIndicatorNames: string[]
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
      file: [],
      usedIndicatorNames: [],
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
      state.usedIndicatorNames = getUsedIndicatorNames()
      guessCombination()
    })

    const indicatorTEDDiffs = computed(() => {
      const {matchKey, combKey, matchingsByFiles} = state
      if (!matchingsByFiles[matchKey]) return []
      if (!matchingsByFiles[matchKey].matchings[combKey]) return []
      const value = matchingsByFiles[matchKey].matchings[combKey].indicator.values[0]
      return value.diffs ? value.diffs : []
    })

    watchEffect(async () => {
      const index = state.indexNumber * 2
      if (state.matchingsByFiles.length === 0) return [null, null]
      const matching = state.matchingsByFiles[state.matchKey].matchings
      const [X, Y] = matching[state.combKey].combination
      const eventFiringElements = await generateEventFiringElements(X.history, Y.history, index)
      state.eventFiringElements = eventFiringElements
    })

    const guessCombination = () => {
      // jsonファイルAとBがもつ、それぞれの操作対象のペアをマッチングする
      if (state.fileCombinations.length === 0) return
      const matchingsByFiles = matchingsByTED(state.fileCombinations)
      state.matchingsByFiles = sortMatchingsByFileName(matchingsByFiles)
    }

    const matchingsByTED = (fileCombinations: FileCombination[]): MatchingsWithFileName[] => {
      const useIndicatorName = 'TED'
      const { minimumCostBipartiteMatching } = new Matching(useIndicatorName)

      const matchingsByFiles: MatchingsWithFileName[] = fileCombinations.map((fileCombination) => {
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
            const indicator = generateIndicators(X.history, Y.history)
            return { combination, indicator }
          })
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
        default:
          return fileName
      }
    }

    return {
      state,
      historiesByFile,
      indicatorTEDDiffs,
      guessCombination,
      fileNameToAlphabet,
    }
  }
})
</script>
