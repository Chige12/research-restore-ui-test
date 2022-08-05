<template>
  <div>
    <v-btn @click="openJson">click!</v-btn>
    <div class="mx-6">
      <p>diffCount {{ diffCount }}</p>
      <p>
        changeStyleCount {{ changeStyleCount }} |
        {{ (changeStyleCount / allCount) * 100 }}%
      </p>
      <p>
        addDomCount {{ addDomCount }} | {{ (addDomCount / allCount) * 100 }}%
      </p>
      <p>
        changeDomCount {{ changeDomCount }} |
        {{ (changeDomCount / allCount) * 100 }}%
      </p>
      <p>
        removeDomCount {{ removeDomCount }} |
        {{ (removeDomCount / allCount) * 100 }}%
      </p>
      <p>allCount {{ allCount }}</p>
    </div>
    <div class="mx-6">
      <p>allCssProperties {{ allCssProperties }}, {{ allCssCount }}</p>
      <v-simple-table>
        <template #default>
          <thead>
            <tr>
              <th class="text-left">プロパティ</th>
              <th class="text-left">更新回数</th>
              <th class="text-left">出現率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prop in sortedCssProperties" :key="prop.property">
              <td>{{ prop.property }}</td>
              <td>{{ prop.count }}</td>
              <td>{{ orgRound((prop.count / allCssCount) * 100, 100) }}%</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  countChanges,
  filteredCssProperties,
  getStyleDiffs,
  getCountedProperties,
  CountedProperties,
} from '@/utils/cssPropeties'
import { JsonFile } from '~/mixins/deepDiffType'
import { DiffHistory } from '~/utils/recording/diffTypes'

export type JsonFileArr = { name: string; json: JsonFile }[]

type Data = {
  jsonFileNameArr: string[]
  diffCount: number
  changeStyleCount: number
  addDomCount: number
  removeDomCount: number
  changeDomCount: number
  allCssProperties: number
  countedProperties: CountedProperties
}

export default defineComponent({
  name: 'CheckPercent',
  data(): Data {
    return {
      jsonFileNameArr: [],
      diffCount: 0,
      changeStyleCount: 0,
      addDomCount: 0,
      removeDomCount: 0,
      changeDomCount: 0,
      allCssProperties: 0,
      countedProperties: [],
    }
  },
  computed: {
    allCount(): number {
      return (
        this.changeStyleCount +
        this.addDomCount +
        this.removeDomCount +
        this.changeDomCount
      )
    },
    allCssCount(): number {
      const array = this.countedProperties
      let count = 0
      for (let i = 0; i < array.length; i++) {
        count += array[i].count
      }
      return count
    },
    sortedCssProperties(): CountedProperties {
      return [...this.countedProperties].sort((a, b) => b.count - a.count)
    },
  },
  mounted() {
    const getJsonFileNames = async () => {
      const fileNamelist: string[] = await this.$axios.$get(`/fileNameList.json`)
      this.jsonFileNameArr = fileNamelist
    }

    getJsonFileNames()
  },
  methods: {
    async openJson() {
      const jsonFileArr = await Promise.all(
        this.jsonFileNameArr.map(async (name) => {
          const json: JsonFile = await this.$axios.$get(`/json/${name}`)
          return { name, json }
        })
      )
      // this.openJsonHistory(jsonFileArr)
      this.checkProperty(jsonFileArr)
    },
    orgRound(value: number, base: number): number {
      return Math.round(value * base) / base
    },
    checkProperty(jsonFileArr: JsonFileArr) {
      jsonFileArr.forEach((file) => {
        this.openJsonCssPropeties(file.json)
      })
    },
    openJsonCssPropeties(obj: JsonFile) {
      const { allElementStylesPerDiff, diffHistories } = obj

      this.allCssProperties = filteredCssProperties.length

      const styleDiffs = getStyleDiffs(allElementStylesPerDiff)
      this.countedProperties = getCountedProperties(styleDiffs)

      this.openDiffHistories(diffHistories)
    },
    openDiffHistories(diffHistories: Array<DiffHistory>) {
      for (let i = 0; i < diffHistories.length; i++) {
        const infos = diffHistories[i].diffAndInfos
        if (!infos) continue
        const changes = countChanges(infos)
        this.changeStyleCount += changes.changeStyleCount
        this.addDomCount += changes.addDomCount
        this.removeDomCount += changes.removeDomCount
        this.changeDomCount += changes.changeDomCount
      }
    },
  },
})
</script>
