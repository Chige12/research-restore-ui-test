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
                v-model="state.calcIndicatorName"
                :items="state.indicatorNameSelections"
                label="Select Indicator"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-btn @click="guessCombination" fill color="primary" elevation="0">guess comvination</v-btn>
              <v-btn v-if="state.matchingsByFiles.length > 0" to="evaluations" outlined elevation="0">go to evaluations</v-btn>
            </v-col>
          </v-row>
          
          <p> 全マッチ数: {{state.allMatchCount}}, 正: {{state.correctMatchCount}}, 正答率: {{state.correctMatchCount / state.allMatchCount * 100}} %</p>
          <div class="mb-12"
            v-for="(match, m_key) in state.matchingsByFiles"
            :key="`match-${m_key}`"
          >
            <v-row>
              <v-col cols="4">
                <h4>
                  X: {{ fileNameToAlphabet(match.fileNameX) }} |
                  {{ match.fileNameX }}
                </h4>
              </v-col>
              <v-col cols="4">
                <h4>
                  Y: {{ fileNameToAlphabet(match.fileNameY) }} |
                  {{ match.fileNameY }}
                </h4>
              </v-col>
              <v-col cols="3">
                <p>正答率: {{ match.correctRate }}%</p>
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
                    <th v-if="state.isShow" class="text-left">bit Y</th>
                    <th v-if="state.isShow" class="text-left">name X</th>
                     <th v-if="state.isShow" class="text-left">name Y</th>
                    <th class="text-left">index X</th>
                    <th class="text-left">index Y</th>
                    <th class="text-left">操作手順X</th>
                    <th class="text-left">操作手順Y</th>
                    <th v-if="state.isShow" class="text-left">Button</th>
                    <th class="text-left">{{state.calcIndicatorName}}</th>
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
                    <td v-if="state.isShow">{{ match.combination[1].bitId }}</td>
                    <td v-if="state.isShow">{{ match.combination[0].fileName.slice(14, -5) }}</td>
                    <td v-if="state.isShow">{{ match.combination[1].fileName.slice(14, -5) }}</td>
                    <td v-if="state.isShow">{{ match.combination[0].index}}</td>
                    <td v-if="state.isShow">{{ match.combination[1].index}}</td>
                    <td v-if="!state.isShow">{{ `$${SOrT(match.combination[0])}_${match.combination[0].index}$` }}</td>
                    <td v-if="!state.isShow">{{ `$${SOrT(match.combination[0])}_${match.combination[1].index}$` }}</td>
                    <td>{{ changeToTejunNumberFromFileData(match.combination[0]) }}</td>
                    <td>{{ changeToTejunNumberFromFileData(match.combination[1]) }}</td>
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
import { useFileStore } from '~/composables/globalState'
import {
  HistoriesByFile,
  HistoriesAndFileData,
  HistoryAndFileData,
} from '~/types/history'
import {
  getAllEventHistories,
  getCombinationListByFile,
  generateEventFiringElements,
  generateIndicators,
  getUsedIndicatorNames,
  addBitIdToHistory,
  allIndicatorNames,
} from '~/utils/checkDiffs/checkDiffsUtils'
import {
  CombinationWithIndicator,
  MatchingsWithFileName,
  MatchingsByFilesAndIndicator,
  MatchingPareData,
} from '~/utils/guessCombination/type'
import {
  Matching
} from '~/utils/guessCombination/matchingClass'
import {
  MatchingTwo
} from '~/utils/guessCombination/matchingClass2'
import {
  MatchingThree
} from '~/utils/guessCombination/matchingClass3'
import { fileNameToAlphabet, alphabetToGroup, changeToTejunNumber } from '~/utils/converters'

type FileCombination = {
  fileX: HistoriesAndFileData
  fileY: HistoriesAndFileData
}

const MATCHINGALGORITHMS = [
  'AdoptInAscending',
  'MinimumWeightBipartiteMatch',
  'AdoptInAscendingForDuplicate'
]

type MatchingAlgorithm = 'AdoptInAscending' | 'MinimumWeightBipartiteMatch' | 'AdoptInAscendingForDuplicate'

type State = {
  isShow: boolean,
  file: HistoriesByFile
  indicatorNameSelections: string[]
  calcIndicatorName: string
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
  allMatchCount: number
  correctMatchCount: number
  matchingsByFilesAndIndicator: MatchingsByFilesAndIndicator[]
  matchingAlgorithm: MatchingAlgorithm
}

export default defineComponent({
  setup() {
    const {state: historiesByFile } =
      useFileStore<HistoriesByFile>('historiesByFile', [])
    const { state: matchingState, setState } =
      useFileStore<MatchingsByFilesAndIndicator[]>('matchingsByFilesAndIndicator', [])

    const state = reactive<State>({
      isShow: true,
      file: [],
      calcIndicatorName: 'VED+TED by Tree',
      indicatorNameSelections: [],
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
      allMatchCount: 0,
      correctMatchCount: 0,
      matchingsByFilesAndIndicator: [],
      matchingAlgorithm: 'AdoptInAscendingForDuplicate' 
    })

    const INDICATOR_INDEXES = [0, 5, 6, 7]

    onMounted(() => {
      const file = cloneDeep(historiesByFile.value)
      state.file = file
      state.fileCombinations = getFileCombination(state.file)
      state.matchingsByFilesAndIndicator = matchingState.value

      // 選択肢を生成
      state.indicatorNameSelections = getUsedIndicatorNames(INDICATOR_INDEXES)
      cacheGuessCombination()
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

    watchEffect(async () => {
      const index = state.indexNumber * 2
      if (state.matchingsByFiles.length === 0) return [null, null]
      const matching = state.matchingsByFiles[state.matchKey].matchings
      const [X, Y] = matching[state.combKey].combination
      const eventFiringElements = await generateEventFiringElements(X.history, Y.history, index)
      state.eventFiringElements = eventFiringElements
    })

    watch(() => state.calcIndicatorName, () => {
      cacheGuessCombination()
    })

    const cacheGuessCombination = async () => {
      const mbfai = state.matchingsByFilesAndIndicator.find(mbf => mbf.indicator === state.calcIndicatorName)
      if (mbfai !== undefined) {
        state.matchingsByFiles = mbfai.matchingsByFiles
        return;
      };
      await guessCombination()
    }

    const guessCombination = async () => {
      // jsonファイルAとBがもつ、それぞれの操作対象のペアをマッチングする
      state.allMatchCount = 0
      state.correctMatchCount = 0
      if (state.fileCombinations.length === 0) return
      const matchingsByFiles = await matchingsByTED(state.fileCombinations)
      console.log('sorting...')
      state.matchingsByFiles = sortMatchingsByFileName(matchingsByFiles)
      pushToState(state.matchingsByFiles, state.calcIndicatorName)
      console.log('finish guess')
    }

    const pushToState = (matchingsByFiles: MatchingsWithFileName[], indicator: string) => {
      state.matchingsByFilesAndIndicator.push({ matchingsByFiles, indicator })
      setState(state.matchingsByFilesAndIndicator)
    }

    const matchingsByTED = async (fileCombinations: FileCombination[]) => {
      const filteredMatchingsByFiles = fileCombinations.filter(fileCombination => {
        const { fileX, fileY } = fileCombination
        const isSameGroup = fileX.fileName.split('-')[1] === fileY.fileName.split('-')[1]
        const isSameUI = fileNameToAlphabet(fileX.fileName).split('_')[0] === fileNameToAlphabet(fileY.fileName).split('_')[0]
        return isSameGroup && !isSameUI
      })
      const matchingsByFiles = Promise.all(filteredMatchingsByFiles.map(async (fileCombination, index, arr) => {
        const matchingsWithFileName = await generateMatchingsWithFileName(fileCombination)

        state.allMatchCount = state.allMatchCount + matchingsWithFileName.allCount
        state.correctMatchCount = state.correctMatchCount + matchingsWithFileName.correctCount
        console.log(`finished calculation: file ${index+1} / ${arr.length}`)
        return matchingsWithFileName
      }))
      return matchingsByFiles
    }

    const generateMatchingsWithFileName = (fileCombination: FileCombination ): Promise<MatchingsWithFileName> => {
      return new Promise((resolve, reject) => {
        const { fileX, fileY } = fileCombination
        const fileXEventHistories = addBitIdToHistory(getAllEventHistories([fileX]), 0)
        const fileYEventHistories = addBitIdToHistory(getAllEventHistories([fileY]), fileXEventHistories.length)
        const combinations = getCombinationListByFile(
          fileXEventHistories,
          fileYEventHistories
        )
        const calcIndicatorIndexByAll = allIndicatorNames.findIndex(name => name === state.calcIndicatorName)
        const combinationWithIndicators: CombinationWithIndicator[] =
          combinations.map((combination) => {
            const [X, Y] = combination
            const indicator = generateIndicators(X.history, Y.history, [calcIndicatorIndexByAll])
            return { combination, indicator }
          })
        const { matchings, allCount, correctCount } = generateMatching(combinationWithIndicators)

        const matchingsWithFileName: MatchingsWithFileName = {
          fileNameX: fileX.fileName,
          fileNameY: fileY.fileName,
          matchings,
          allCount,
          correctCount,
          correctRate: correctCount / allCount * 100
        }
        return resolve(matchingsWithFileName)
      });
    }

    const generateMatching = (matchings: CombinationWithIndicator[]): MatchingPareData => {
      if (state.matchingAlgorithm === 'AdoptInAscending') {
        const { generateMatchingByAlgorism } = new Matching(state.calcIndicatorName)
        const pairData = generateMatchingByAlgorism(matchings, false)
        return pairData
      }
      if (state.matchingAlgorithm === 'MinimumWeightBipartiteMatch') {
        const { generateMatchingByAlgorism } = new MatchingTwo(state.calcIndicatorName)
        const pairData = generateMatchingByAlgorism(matchings)
        return pairData
      }
      if (state.matchingAlgorithm === 'AdoptInAscendingForDuplicate') {
        const { generateMatchingByAlgorism } = new MatchingThree(state.calcIndicatorName)
        const pairData = generateMatchingByAlgorism(matchings)
        return pairData
      }
      return {
        matchings,
        allCount: 0,
        correctCount: 0
      }
    }

    const sortMatchingsByFileName = (matchingsByFiles: MatchingsWithFileName[]) => {
      return matchingsByFiles.slice().sort((a, b) => {
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

    const changeToTejunNumberFromFileData = (historyAndfileData: HistoryAndFileData) => {
      const [ alphabet, opNum] = fileNameToAlphabet(historyAndfileData.fileName).split('_')
      const group = alphabetToGroup(alphabet)
      if (!group) return NaN
      return changeToTejunNumber(Number(opNum), historyAndfileData.index, group)
    }

    const SOrT = (historyAndfileData: HistoryAndFileData): string => {
      const [ alphabet, _] = fileNameToAlphabet(historyAndfileData.fileName).split('_')
      const isT = alphabet === 'E' || alphabet === 'F'
      return isT ? 't' : 's'
    }

    return {
      state,
      historiesByFile,
      indicatorTEDDiffs,
      indicatorTEDSubData,
      guessCombination,
      fileNameToAlphabet,
      changeToTejunNumberFromFileData,
      SOrT,
    }
  }
})
</script>
