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
              <h4>X: {{fileNameToAlphabet(match.fileNameX)}} | {{ match.fileNameX }}</h4>
            </v-col>
            <v-col cols="6">
              <h4>Y: {{fileNameToAlphabet(match.fileNameY)}} | {{ match.fileNameY }}</h4>
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
                  <th class="text-left">TED</th>
                  <th class="text-left">TED BcP</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(match, c_key) in match.matching"
                  :key="`match.combination-${c_key}`"
                >
                  <td>
                    {{
                      match.combination[0].bitId + match.combination[1].bitId
                    }}
                  </td>
                  <td>{{ match.combination[0].bitId }}</td>
                  <td>{{ match.combination[0].name }}</td>
                  <td>{{ match.combination[0].index }}</td>
                  <td>{{ match.combination[1].index }}</td>
                  <td>{{ match.combination[1].name }}</td>
                  <td>{{ match.combination[1].bitId }}</td>
                  <td>{{ match.diffsDiffs.diffsDiffs.length }}</td>
                  <td>
                    {{ match.diffsDiffs.diffsWithbreadcrumbsPathsDiffs.length }}
                  </td>
                  <td>
                    <v-btn
                      @click="() => {state.combKey = c_key; state.matchKey = m_key}"
                      v-bind="attrs"
                      v-on="on"
                      small
                      >Preview</v-btn
                    >
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </div>
        </div>
      </template>
      <v-card>
        <div class="pa-4">
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
        <v-card-actions>
          <v-btn @click="state.dialog = false">close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">
import cloneDeep from 'lodash/cloneDeep'
import { defineComponent } from 'vue'
import { diff as justDiff } from 'just-diff'
import { useHistoriesByFileStore } from '~/composables/globalState'
import { DataHistory, HistoriesByFile, HistoryAndFileName } from '~/utils/createDiffs/breadcrumbs'
import { Diffs } from '~/utils/recording/diffTypes'
import { toDom } from 'hast-util-to-dom'
import { getEventFiringElement } from '~/utils/getNewRootPathElements'
import {
  getAllEventHistories,
  getCombinationListByFile,
} from '~/utils/checkDiffs/checkDiffsUtils'

type EventHistory = {
  name: string
  index: number
  history: DataHistory
}

type EventHistoryWithBitId = EventHistory & {
  bitId: number
}

type DiffsDiffs = {
  diffsDiffs: Diffs
  diffsWithbreadcrumbsPathsDiffs: Diffs
}

type combinationWithDiffsDiff = {
  combination: EventHistoryWithBitId[]
  diffsDiffs: DiffsDiffs
}

type combinationWithDiffsDiffs = combinationWithDiffsDiff[]

export type MatchingsByFile = {
  fileNameX: string
  fileNameY: string
  matching: combinationWithDiffsDiffs
}[]

type FileCombination = {
  fileX: HistoryAndFileName,
  fileY: HistoryAndFileName,
}

type State = {
  file: HistoriesByFile
  selectedFileA: string
  selectedFileB: string
  diffsDiffsArr: DiffsDiffs[]
  combKey: number
  matchKey: number
  dialog: boolean
  indexNumber: number
  eventFiringElements: (string | null)[]
  matchingsByFile: MatchingsByFile
}

export default defineComponent({
  setup() {
    const { historiesByFile } = useHistoriesByFileStore()

    const state = reactive<State>({
      file: [],
      selectedFileA: '',
      selectedFileB: '',
      diffsDiffsArr: [],
      dialog: false,
      combKey: 0,
      matchKey: 0,
      indexNumber: 2,
      eventFiringElements: [null, null],
      matchingsByFile: [],
    })

    onMounted(() => {
      const file = cloneDeep(historiesByFile.value)
      state.file = file
    })

    const calculateEditDistance = (
      x: DataHistory,
      y: DataHistory
    ) => {
      const diffsDiffs = justDiff(x.diffs, y.diffs)
      const diffsWithbreadcrumbsPathsDiffs = justDiff(
        x.diffsWithbreadcrumbsPaths,
        y.diffsWithbreadcrumbsPaths
      )
      return {
        diffsDiffs,
        diffsWithbreadcrumbsPathsDiffs,
      }
    }

    const generateEventFiringElements = (
      A: DataHistory,
      B: DataHistory,
      index: number
    ): (string | null)[] => {
      const AEventFiringElement = getEventFiringElement(
        A.oldFormat.to,
        A.eventInfo.eventId,
        index
      )
      const BEventFiringElement = getEventFiringElement(
        B.oldFormat.to,
        B.eventInfo.eventId,
        index
      )
      const AHtml = AEventFiringElement
        ? (toDom(AEventFiringElement).outerHTML as string)
        : null
      const BHtml = BEventFiringElement
        ? (toDom(BEventFiringElement).outerHTML as string)
        : null
      console.log(AHtml, BHtml)
      return [AHtml, BHtml]
    }

    const eventFiringElements = computed(() => {
      const index = state.indexNumber * 2
      if (state.matchingsByFile.length === 0) return [null, null]
      const [A, B] = state.matchingsByFile[state.matchKey].matching[state.combKey].combination
      return generateEventFiringElements(A.history, B.history, index)
    })

    const addBitId = (x: EventHistory[]) =>
      x.map((x, i) => ({ ...x, bitId: i }))

    const guessCombination = () => {
      // jsonファイルAとBがもつ、それぞれの操作対象のペアをマッチングする
      const fileCombinations = getFileCombination(state.file)
      const matchingsByFile = [] as MatchingsByFile
      for (let i = 0; i < fileCombinations.length; i++) {
        
        const {fileX, fileY} = fileCombinations[i]
        const fileXEventHistories = addBitId(getAllEventHistories([fileX]))
        const fileYEventHistories = addBitId(getAllEventHistories([fileY]))
        const historyCombinations = getCombinationListByFile(
          fileXEventHistories,
          fileYEventHistories
        )
        const combinationWithDiffsDiffs: combinationWithDiffsDiffs =
          historyCombinations.map((combination) => {
            const [X, Y] = combination
            const diffsDiffs = calculateEditDistance(X.history, Y.history)
            return { combination, diffsDiffs }
          })
        const matching = minimumCostBipartiteMatching(combinationWithDiffsDiffs)

        const matchingWithFileName = {
          fileNameX: fileX.name,
          fileNameY: fileY.name,
          matching,
        }
        matchingsByFile.push(matchingWithFileName)
      }

      const sortedMatchingsByFile = cloneDeep(matchingsByFile).sort((a, b) => {
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
      state.matchingsByFile = sortedMatchingsByFile
    }

    const minimumCostBipartiteMatching = (
      combinationWithDiffsDiffs: combinationWithDiffsDiffs
    ): combinationWithDiffsDiffs => {
      const sortedcombinationWithDiffsDiffs = cloneDeep(
        combinationWithDiffsDiffs
      ).sort((a, b) => {
        const ad = a.diffsDiffs.diffsDiffs.length
        const bd = b.diffsDiffs.diffsDiffs.length
        return ad === bd ? 0 : ad < bd ? -1 : 1
      })

      const matchingArr = [] as combinationWithDiffsDiffs
      const XeventIdArr = [] as string[]
      const XIndexArr = [] as number[]
      const YeventIdArr = [] as string[]
      const YIndexArr = [] as number[]
      for (let i = 0; i < sortedcombinationWithDiffsDiffs.length; i++) {
        const comb = sortedcombinationWithDiffsDiffs[i]
        const [combX, combY] = comb.combination

        const isAEventIdExist = XeventIdArr.some((id: string)=> {
          return id === combX.history.eventInfo.eventId 
        })
        const isBEventIdExist = YeventIdArr.some((id: string)=> {
          return id === combY.history.eventInfo.eventId 
        })

        const isAIndexExist = XIndexArr.some((index: number)=> {
          return index === combX.index
        })
        const isBIndexExist = YIndexArr.some((index: number)=> {
          return index === combY.index
        })

        const isSameEventAction = combX.history.eventInfo.event === combY.history.eventInfo.event

        if (!isAIndexExist && !isBIndexExist && !isAEventIdExist && !isBEventIdExist && isSameEventAction) {
          matchingArr.push(comb)
          XeventIdArr.push( combX.history.eventInfo.eventId )
          YeventIdArr.push( combY.history.eventInfo.eventId )
          XIndexArr.push(combX.index)
          YIndexArr.push(combY.index)
        }
      }
      return matchingArr
    }

    const sortFilesByName = (files: HistoriesByFile): HistoriesByFile => {
      return files.sort((a, b) => {
        const ad = fileNameToAlphabet(a.name).toLowerCase()
        const bd = fileNameToAlphabet(b.name).toLowerCase()
        return ad < bd ? -1 : 1
      })
    }

    const getFileCombination = (files: HistoriesByFile): FileCombination[] => {
      let fileCombinations = [] as FileCombination[]
      for (let i = 0; i < files.length; i++) {
        for (let j = 0; j < i; j++) {
          if (files[i].name === files[j].name) continue
          const sortedFiles = sortFilesByName([files[i], files[j]])
          const fileCombination = {fileX: sortedFiles[0], fileY: sortedFiles[1]}
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
      eventFiringElements,
      guessCombination,
      fileNameToAlphabet,
    }
  },
})
</script>
