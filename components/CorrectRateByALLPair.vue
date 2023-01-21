<template>
  <div>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th
              v-for="(header, headerId) in headers"
              :key="`headerId-${headerId}`"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(pair, pairId) in state.correctRateAllPair"
            :key="`pairId-${pairId}`"
          >
            <td>{{ pair.group }}</td>
            <td>{{ pair.UI_X }}</td>
            <td>{{ pair.UI_Y }}</td>
            <td
              v-for="(indctr, indctrId) in pair.indicators"
              :key="`indctrId-${indctrId}`"
              :style="`color: ${indctr.correctRate === 100 ? 'green' : indctr.correctRate === 0 ? 'red' : 'rgba(0, 0, 0, 0.87)'}`"
            >
              {{ indctr.correctRate }}% ({{indctr.correctCount}}/{{ indctr.allCount }})
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import {
  Group,
  MatchingsByFilesAndIndicator,
} from '~/utils/guessCombination/type'
import { fileNameToAlphabetAndOpAndGroup } from '~/utils/converters'

type State = {
  header: string[]
  correctRateAllPair: correctRateAllPair[]
}

type correctRateByIndicators = {
  name: string,
  correctRate: number
  correctCount: number
  allCount: number
}

type correctRateAllPair = {
  group: Group | undefined
  UI_X: string
  UI_Y: string
  indicators: correctRateByIndicators[]
}

export default defineComponent({
  props: {
    arr: Array as PropType<MatchingsByFilesAndIndicator[]>
  },
  setup(props) {
    const state = reactive<State>({
      header: [],
      correctRateAllPair: []
    })

    onMounted(() => {
      state.correctRateAllPair = getStrage()

      const isNoStrage = state.correctRateAllPair.length === 0
      if (isNoStrage) {
        state.correctRateAllPair = genereteCorrectRateAllPair()
        saveStrage()
      }
      if (props.arr && (props.arr.length >= (state.correctRateAllPair[0].indicators.length))) {
        state.correctRateAllPair = genereteCorrectRateAllPair()
        saveStrage()
      }
    })

    const getStrage = (): correctRateAllPair[] => {
      const json = localStorage.getItem('correctRateAllPair')
      if (!json) return []
      const arr = JSON.parse(json)
      if (!Array.isArray(arr)) return []
      return arr
    }

    const saveStrage = () => {
      const setjson = JSON.stringify(state.correctRateAllPair)
      localStorage.setItem('correctRateAllPair', setjson)
    }

    const genereteCorrectRateAllPair = () => {
      const matchingsByFilesAndIndicator = props.arr
      if (!matchingsByFilesAndIndicator) return []

      // 各指標ごとにUIペア配列があるのでその配列の最大値を取る
      const allPairsCounts = matchingsByFilesAndIndicator.map(x => x.matchingsByFiles.length)
      const maxFileLength = allPairsCounts.reduce((previous, current) => {
        return Math.max(previous, current)
      }, 0)

      // correctRateAllPairに，各指標と一緒にUIペアを入れていく
      const correctRateAllPair = [] as correctRateAllPair[]
      for (let index = 0; index < maxFileLength; index++) {
        const matchingsByFiles = matchingsByFilesAndIndicator[0].matchingsByFiles
        if (!matchingsByFiles[index]) {
          correctRateAllPair.push({
            group: undefined,
            UI_X: '',
            UI_Y: '',
            indicators: [],
          } as correctRateAllPair)
          continue
        }
        const { fileNameX, fileNameY } = matchingsByFiles[index]
        const { alphabet: alphabetX, opNum: opX, group } = fileNameToAlphabetAndOpAndGroup(fileNameX)
        const { alphabet: alphabetY, opNum: opY } = fileNameToAlphabetAndOpAndGroup(fileNameY)

        const indicators: correctRateByIndicators[] = matchingsByFilesAndIndicator.map((x) => {
          const { correctRate, correctCount, allCount } = x.matchingsByFiles[index]
          return { name: x.indicator, correctRate, correctCount, allCount }
        })
        
        const correctRateOne: correctRateAllPair = {
          group,
          UI_X: `${alphabetX}_${opX}`,
          UI_Y: `${alphabetY}_${opY}`,
          indicators
        }
        correctRateAllPair.push(correctRateOne)
      }

      return correctRateAllPair
    }

    const headers = computed(() => {
      if (state.correctRateAllPair.length === 0) return []
      const obj = state.correctRateAllPair[0]
      const keys = Object.keys(obj).slice(0, -1)
      const indicatorNames = obj.indicators.map(x => x.name)
      return [...keys, ...indicatorNames]
    })

    return {
      props,
      state,
      headers
    }
  }
})
</script>