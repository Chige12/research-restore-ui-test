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
              <h4>A: {{ match.fileNameA }}</h4>
            </v-col>
            <v-col cols="6">
              <h4>A: {{ match.fileNameB }}</h4>
            </v-col>
          </v-row>

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
import { DataHistory, HistoriesByFile } from '~/utils/createDiffs/breadcrumbs'
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
  fileNameA: string
  fileNameB: string
  matching: combinationWithDiffsDiffs
}[]

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
      A: EventHistoryWithBitId,
      B: EventHistoryWithBitId
    ) => {
      const diffsDiffs = justDiff(A.history.diffs, B.history.diffs)
      const diffsWithbreadcrumbsPathsDiffs = justDiff(
        A.history.diffsWithbreadcrumbsPaths,
        B.history.diffsWithbreadcrumbsPaths
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
        A.old.to,
        A.old.id,
        index
      )
      const BEventFiringElement = getEventFiringElement(
        B.old.to,
        B.old.id,
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
      const combinationFiles = getFileCombination(state.file)
      console.log(combinationFiles)
      const matchingsByFile = [] as MatchingsByFile
      for (let i = 0; i < combinationFiles.length; i++) {
        const [fileA, fileB] = combinationFiles[i]
        const AEventHistories = addBitId(getAllEventHistories([fileA]))
        const BEventHistories = addBitId(getAllEventHistories([fileB]))
        const combinationList = getCombinationListByFile(
          AEventHistories,
          BEventHistories
        )
        const combinationWithDiffsDiffs: combinationWithDiffsDiffs =
          combinationList.map((combination) => {
            const [A, B] = combination
            const diffsDiffs = calculateEditDistance(A, B)
            return { combination, diffsDiffs }
          })
        const matching = minimumCostBipartiteMatching(combinationWithDiffsDiffs)
        matchingsByFile.push({
          fileNameA: combinationFiles[i][0].name,
          fileNameB: combinationFiles[i][1].name,
          matching,
        })
      }
      console.log(matchingsByFile)
      state.matchingsByFile = matchingsByFile
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
      const AeventIdArr = [] as string[]
      const AIndexArr = [] as number[]
      const BeventIdArr = [] as string[]
      const BIndexArr = [] as number[]
      for (let i = 0; i < sortedcombinationWithDiffsDiffs.length; i++) {
        const comb = sortedcombinationWithDiffsDiffs[i]
        const [combA, combB] = comb.combination

        const isAEventIdExist = AeventIdArr.some((id: string)=> {
          return id === combA.history.old.id 
        })
        const isBEventIdExist = BeventIdArr.some((id: string)=> {
          return id === combB.history.old.id 
        })

        const isAIndexExist = AIndexArr.some((index: number)=> {
          return index === combA.index
        })
        const isBIndexExist = BIndexArr.some((index: number)=> {
          return index === combB.index
        })

        if (!isAIndexExist && !isBIndexExist && !isAEventIdExist && !isBEventIdExist) {
          matchingArr.push(comb)
          AeventIdArr.push( combA.history.old.id )
          BeventIdArr.push( combB.history.old.id )
          AIndexArr.push(combA.index)
          BIndexArr.push(combB.index)
        }
      }
      return matchingArr
    }

    const getFileCombination = (files: HistoriesByFile): HistoriesByFile[] => {
      let combinationFiles = [] as HistoriesByFile[]
      for (let i = 0; i < files.length; i++) {
        for (let j = 0; j < i; j++) {
          if (files[i].name === files[j].name) continue
          combinationFiles.push([files[i], files[j]])
        }
      }
      return combinationFiles
    }

    return {
      state,
      historiesByFile,
      eventFiringElements,
      guessCombination,
    }
  },
})
</script>
