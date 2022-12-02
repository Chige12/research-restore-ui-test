<template>
  <div v-if="state.file.length !== 0">
    <v-dialog v-model="state.dialog" width="1000">
      <template v-slot:activator="{ on, attrs }">
        <div class="ma-4">
          <v-btn class="mb-2" @click="guessCombination"
            >guess comvination</v-btn
          >
          <div
            v-for="(match, m_key) in state.matchingsByFile"
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
                    <th class="text-left">bitId [X]</th>
                    <th class="text-left">name [X]</th>
                    <th class="text-left">index [X]</th>
                    <th class="text-left">index [Y]</th>
                    <th class="text-left">name [Y]</th>
                    <th class="text-left">bitId [Y]</th>
                    <th class="text-left">Button</th>
                    <th v-for="(name, inNa_key) in match.matching[0].indicator.names" :key="`inNa-${inNa_key}`">{{ name }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(match, c_key) in match.matching"
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
                    <td>{{ match.combination[0].fileName }}</td>
                    <td>{{ match.combination[0].index }}</td>
                    <td>{{ match.combination[1].index }}</td>
                    <td>{{ match.combination[1].fileName }}</td>
                    <td>{{ match.combination[1].bitId }}</td>
                    <td>
                      <v-btn
                        @click="
                          state.combKey = c_key
                          state.matchKey = m_key
                          state.dialogType = 'preview'
                        "
                        v-bind="attrs"
                        v-on="on"
                        small
                        >Preview</v-btn
                      >
                      <v-btn
                        @click="
                          state.combKey = c_key
                          state.matchKey = m_key
                          state.dialogType = 'showTree'
                        "
                        v-bind="attrs"
                        v-on="on"
                        small
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
            v-for="(value, inVa_key) in state.matchingsByFile[state.matchKey].matching[state.combKey].indicator.values"
            :key="`diffsDiffs-${inVa_key}`"
          >
            {{ value.diffs || 'なし' }}
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
} from '~/utils/checkDiffs/checkDiffsUtils'
import {
  CombinationWithIndicator,
  MatchingsByFile,
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
  fileCombinations: FileCombination[]
  selectedFileA: string
  selectedFileB: string
  combKey: number
  matchKey: number
  dialog: boolean
  dialogType: 'preview' | 'showTree'
  indexNumber: number
  eventFiringElements: (string | null)[]
  matchingsByFile: MatchingsByFile
}

export default defineComponent({
  setup() {
    const { historiesByFile } = useHistoriesByFileStore()

    const state = reactive<State>({
      file: [],
      fileCombinations: [],
      selectedFileA: '',
      selectedFileB: '',
      dialog: false,
      dialogType: 'preview',
      combKey: 0,
      matchKey: 0,
      indexNumber: 2,
      eventFiringElements: [null, null],
      matchingsByFile: [],
    })

    onMounted(() => {
      const file = cloneDeep(historiesByFile.value)
      state.file = file

      state.fileCombinations = getFileCombination(state.file)
    })

    watchEffect(async () => {
      const index = state.indexNumber * 2
      if (state.matchingsByFile.length === 0) return [null, null]
      const matching = state.matchingsByFile[state.matchKey].matching
      const [A, B] = matching[state.combKey].combination
      const eventFiringElements = await generateEventFiringElements(A.history, B.history, index)
      state.eventFiringElements = eventFiringElements
    })

    const addBitId = (x: HistoryAndFileData[]) =>
      x.map((x, i) => ({ ...x, bitId: i }))

    const guessCombination = () => {
      // jsonファイルAとBがもつ、それぞれの操作対象のペアをマッチングする
      if (state.fileCombinations.length === 0) return
      const matchingsByFile = matchingsByTED(state.fileCombinations)
      state.matchingsByFile = sortMatchingsByFile(matchingsByFile)
    }

    const matchingsByTED = (fileCombinations: FileCombination[]): MatchingsByFile => {
      const { minimumCostBipartiteMatching } = new Matching()
      const matchingsByFile = [] as MatchingsByFile

      for (let i = 0; i < fileCombinations.length; i++) {
        const { fileX, fileY } = fileCombinations[i]
        const fileXEventHistories = addBitId(getAllEventHistories([fileX]))
        const fileYEventHistories = addBitId(getAllEventHistories([fileY]))
        const historyCombinations = getCombinationListByFile(
          fileXEventHistories,
          fileYEventHistories
        )
        const combinationWithIndicators: CombinationWithIndicator[] =
          historyCombinations.map((combination) => {
            const [X, Y] = combination
            const indicator = generateIndicators(X.history, Y.history)
            return { combination, indicator }
          })
        const matching = minimumCostBipartiteMatching(combinationWithIndicators)

        const matchingWithFileName = {
          fileNameX: fileX.fileName,
          fileNameY: fileY.fileName,
          matching,
        }
        matchingsByFile.push(matchingWithFileName)
      }

      return matchingsByFile
    }

    const sortMatchingsByFile = (matchingsByFile: MatchingsByFile) => {
      return cloneDeep(matchingsByFile).sort((a, b) => {
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
      guessCombination,
      fileNameToAlphabet,
    }
  }
})
</script>
