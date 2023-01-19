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
            v-for="(group, groupId) in state.correctRatesByGroup"
            :key="`groupId-${groupId}`"
          >
            <td>{{ group.groupName }}</td>
            <td>{{ group.indicator }}</td>
            <td>{{ group.allCount }}</td>
            <td>{{ group.correctCount }}</td>
            <td>{{ group.correctRate }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { CorrectRateData } from '~/types/evaluations'
import {
  Group,
  MatchingsByFilesAndIndicator,
} from '~/utils/guessCombination/type'
import { fileNameToAlphabetAndOpAndGroup } from '~/utils/converters'

type State = {
  header: string[]
  correctRatesByGroup: CorrectRateData[]
}

export default defineComponent({
  props: {
    arr: Array as PropType<MatchingsByFilesAndIndicator[]>
  },
  setup(props) {
    const state = reactive<State>({
      header: [],
      correctRatesByGroup: []
    })

    onMounted(() => {
      genereteCorrectRateArr()
    })

    const genereteCorrectRateArr = () => {
      const matchingsByFilesAndIndicator = props.arr
      if (!matchingsByFilesAndIndicator) return []

      const groupList: Group[] = ['signin', 'table']

      const correctRatesByGroup = groupList.map((groupName) => {
        const correctRateByIndicator = matchingsByFilesAndIndicator.map(x => {
          const group = x.matchingsByFiles.filter(x => {
            const alphabetAndOpAndGroup = fileNameToAlphabetAndOpAndGroup(x.fileNameX)
            return alphabetAndOpAndGroup.group === groupName
          })

          const sumCounts = group.map(({allCount, correctCount}) => ({allCount, correctCount})).reduce((accumulator, current) => {
            const { allCount, correctCount } = accumulator
            return {
              allCount: allCount + current.allCount,
              correctCount: correctCount + current.correctCount
            };
          });

          const correctRate = sumCounts.correctCount / sumCounts.allCount * 100

          const correctRateData: CorrectRateData = {
            groupName,
            indicator: x.indicator,
            allCount: sumCounts.allCount,
            correctCount: sumCounts.correctCount,
            correctRate,
          }
          return correctRateData
        })
        return correctRateByIndicator
      })
      state.correctRatesByGroup = correctRatesByGroup.flat()
    }

    const headers = computed(() => {
      if (state.correctRatesByGroup.length === 0) return []
      const obj = state.correctRatesByGroup[0]
      return Object.keys(obj)
    })

    return {
      props,
      state,
      headers
    }
  }
})
</script>