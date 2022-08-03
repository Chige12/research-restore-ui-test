<template>
  <div>
    <v-btn @click="checkProperty">click!</v-btn>
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
import * as fs from 'fs'
import { defineComponent } from 'vue'
import { diff as justDiff } from 'just-diff'
import { getNewRootPathElements } from '@/utils/getNewRootPathElements'
import {
  countChanges,
  filteredCssProperties,
  getStyleDiffs,
  getCountedProperties,
  CountedProperties,
} from '@/utils/cssPropeties'
import { JsonFile } from '~/mixins/deepDiffType'
import { DiffHistory } from '~/utils/recording/diffTypes'

type Data = {
  jsonFileArr: JsonFile[]
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
      jsonFileArr: [],
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
    const json1: JsonFile = JSON.parse(
      fs
        .readFileSync('@/assets/json/diffHistories-signin-comp02.json')
        .toString()
    )
    const json2: JsonFile = JSON.parse(
      fs
        .readFileSync('@/assets/json/diffHistories-signin-comp04.json')
        .toString()
    )
    this.jsonFileArr = [json1, json2]
    this.openJsonHistory()
  },
  methods: {
    orgRound(value: number, base: number): number {
      return Math.round(value * base) / base
    },
    checkProperty() {
      this.jsonFileArr.forEach((json) => {
        this.openJsonCssPropeties(json)
      })
    },
    openJsonHistory() {
      this.jsonFileArr.forEach((json) => {
        const { diffHistories } = json
        this.openDiffHistories(diffHistories)
      })
    },
    openJsonCssPropeties(obj: JsonFile) {
      const { allElementStylesPerDiff } = obj

      this.allCssProperties = filteredCssProperties.length

      const styleDiffs = getStyleDiffs(allElementStylesPerDiff)
      this.countedProperties = getCountedProperties(styleDiffs)
    },
    openDiffHistories(diffHistories: Array<DiffHistory>) {
      for (let i = 0; i < diffHistories.length; i++) {
        const { to, from } = diffHistories[i]
        if (!!to && !!from) {
          const { eventInfo, hast: toHast } = to
          const { hast: fromHast } = from
          if (!eventInfo) continue

          const id = eventInfo.eventId
          if (!id) console.log('ID is noting!', id)

          const toNewRootHast = getNewRootPathElements(toHast, id)
          const fromNewRootHast = getNewRootPathElements(fromHast, id)
          const diff = justDiff(toNewRootHast, fromNewRootHast)
          console.log(diff)
        }
        const infos = diffHistories[i].diffAndInfos
        if (!infos) continue
        const changes = countChanges(infos)
        this.changeStyleCount = changes.changeStyleCount
        this.addDomCount = changes.addDomCount
        this.removeDomCount = changes.removeDomCount
        this.changeDomCount = changes.changeDomCount
      }
    },
  },
})
</script>
