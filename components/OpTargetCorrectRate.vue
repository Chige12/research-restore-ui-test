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
            v-for="(pair, pairId) in state.opTargetCorrectRate"
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
  CombinationWithIndicator,
  Group,
  MatchingsByFilesAndIndicator,
} from '~/utils/guessCombination/type'
import { fileNameToAlphabetAndOpAndGroup } from '~/utils/converters'

type State = {
  header: string[]
  opTargetCorrectRate: opTargetCorrectRate[]
}

type correctRateByIndicators = {
  name: string,
  correctRate: number
  correctCount: number
  allCount: number
  matchings: CombinationWithIndicator[]
}

type opTargetCorrectRate = {
  group: Group | undefined
  UI_X: string
  UI_Y: string
  indicators: correctRateByIndicators[]
  uiYVariation: {
    ui_num: number
    indicators: correctRateByIndicators[]
  }[]
}

export default defineComponent({
  props: {
    arr: Array as PropType<MatchingsByFilesAndIndicator[]>
  },
  setup(props) {
    const state = reactive<State>({
      header: [],
      opTargetCorrectRate: []
    })

    onMounted(() => {
      state.opTargetCorrectRate = getStrage()

      const isNoStrage = state.opTargetCorrectRate.length === 0
      if (isNoStrage) {
        state.opTargetCorrectRate = genereteCorrectRateAllPair()
        saveStrage()
      }
      if (props.arr && (props.arr.length >= (state.opTargetCorrectRate[0].indicators.length))) {
        state.opTargetCorrectRate = genereteCorrectRateAllPair()
        saveStrage()
      }
    })

    const getStrage = (): opTargetCorrectRate[] => {
      const json = localStorage.getItem('opTargetCorrectRate')
      if (!json) return []
      const arr = JSON.parse(json)
      if (!Array.isArray(arr)) return []
      return arr
    }

    const saveStrage = () => {
      const setjson = JSON.stringify(state.opTargetCorrectRate)
      localStorage.setItem('opTargetCorrectRate', setjson)
    }

    const genereteCorrectRateAllPair = () => {
      const matchingsByFilesAndIndicator = props.arr
      if (!matchingsByFilesAndIndicator) return []

      const testPairsArr = generateTestPairsArr(matchingsByFilesAndIndicator)

      // TODO: ここでmatchingをもとに同じUIペアで操作手順の一致数をカウントする．多いものから順に採用
      return testPairsArr
    }

    const generateTestPairsArr = (matchingsByFilesAndIndicator: MatchingsByFilesAndIndicator[]):opTargetCorrectRate[] => {
      // 各指標ごとにUIペア配列があるのでその配列の最大値を取る
      const allPairsCounts = matchingsByFilesAndIndicator.map(x => x.matchingsByFiles.length)
      const maxFileLength = allPairsCounts.reduce((previous, current) => {
        return Math.max(previous, current)
      }, 0)

      let prevIdentifier = ''
      // opTargetCorrectRateに，各指標と一緒にUIペアを入れていく
      const opTargetCorrectRate = [] as opTargetCorrectRate[]
      for (let index = 0; index < maxFileLength; index++) {
        const matchingsByFiles = matchingsByFilesAndIndicator[0].matchingsByFiles
        if (!matchingsByFiles[index]) {
          opTargetCorrectRate.push({
            group: undefined,
            UI_X: '',
            UI_Y: '',
            indicators: [],
            uiYVariation: []
          } as opTargetCorrectRate)
          continue
        }
        const { fileNameX, fileNameY } = matchingsByFiles[index]
        const { alphabet: alphabetX, opNum: opX, group } = fileNameToAlphabetAndOpAndGroup(fileNameX)
        const { alphabet: alphabetY, opNum: opY } = fileNameToAlphabetAndOpAndGroup(fileNameY)

        const identifier = `${alphabetX}_${opX}_${alphabetY}`
        const isSameAsPrevIdentifier = identifier === prevIdentifier

        const indicators: correctRateByIndicators[] = matchingsByFilesAndIndicator.map((x) => {
          const { correctRate, correctCount, allCount, matchings } = x.matchingsByFiles[index]
          // TODO: 操作対象の推測精度を計算しないといけない
          return { name: x.indicator, correctRate, correctCount, allCount, matchings }
        })

        if (isSameAsPrevIdentifier) {
          // 一つ前に情報追加する
          opTargetCorrectRate[opTargetCorrectRate.length - 1].uiYVariation.push({
            ui_num: Number(opY),
            indicators,
          })
        } else {
          const correctRateOne: opTargetCorrectRate = {
            group,
            UI_X: `${alphabetX}_${opX}`,
            UI_Y: `${alphabetY}`,
            indicators,
            uiYVariation: [{
              ui_num: Number(opY),
              indicators,
            }]
          }
          opTargetCorrectRate.push(correctRateOne)
        }
      }
      return opTargetCorrectRate
    }

    const headers = computed(() => {
      if (state.opTargetCorrectRate.length === 0) return []
      const obj = state.opTargetCorrectRate[0]
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