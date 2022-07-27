<template>
  <div>
    <v-btn @click="checkProperty">click!</v-btn>
    <div class="mx-6">
      <p> diffCount {{diffCount}} </p>
      <p> changeStyleCount  {{changeStyleCount}} | {{ changeStyleCount / allCount  * 100}}%</p>
      <p> addDomCount       {{addDomCount}}      | {{ addDomCount / allCount  * 100}}%</p>
      <p> changeDomCount    {{changeDomCount}}   | {{ changeDomCount / allCount  * 100}}%</p>
      <p> deleteDomCount    {{deleteDomCount}}   | {{ deleteDomCount / allCount  * 100}}%</p>
      <p> allCount {{allCount}} </p>
    </div>
    <div class="mx-6">
      <p> allCssProperties {{allCssProperties}}, {{allCssCount}}</p>
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">
                プロパティ
              </th>
              <th class="text-left">
                更新回数
              </th>
              <th class="text-left">
                出現率
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prop in sortedCssProperties" :key="prop.property">
              <td>{{prop.property}}</td>
              <td>{{prop.count}}</td>
              <td>{{orgRound(prop.count / allCssCount * 100, 100)}}%</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import json1 from '@/assets/json/diffHistories-signin-comp02.json'
import json2 from '@/assets/json/diffHistories-signin-comp04.json'
import { diff as justDiff } from 'just-diff'
import { getNewRootPathElements } from '@/utils/getNewRootPathElements'
import { countChanges, filteredCssProperties } from '@/utils/cssPropeties'

export default {
  name: 'checkPercent',
  data() {
    return {
      diffCount: 0,
      changeStyleCount: 0,
      addDomCount: 0,
      deleteDomCount: 0,
      changeDomCount: 0,
      allCssProperties: 0,
      countedProperties: []
    }
  },
  computed: {
    allCount() {
      return this.changeStyleCount + this.addDomCount + this.deleteDomCount + this.changeDomCount
    },
    allCssCount() {
      const array = this.countedProperties
      let count = 0
      for (let i = 0; i < array.length; i++) {
        count += array[i].count
      }
      return count
    },
    sortedCssProperties() {
      return this.countedProperties.sort((a, b) => b.count - a.count);
    },
  },
  mounted() {
    // const json = '{"diffHistories":true, "cssPropeties":42}';
    this.openJsonHistory(json1);
    this.openJsonHistory(json2);
    // this.openJson(fileNameList);
  },
  methods: {
    orgRound(value, base) {
      return Math.round(value * base) / base;
    },
    checkProperty() {
      this.openJsonCssPropeties(json1);
      this.openJsonCssPropeties(json2);
    },
    openJsonHistory(json) {
      const obj = JSON.parse(JSON.stringify(json));
      const { diffHistories } = obj

      this.openDiffHistories(diffHistories)
    },
    openJsonCssPropeties(json) {
      const obj = JSON.parse(JSON.stringify(json));
      const { allElementStylesPerDiff } = obj

      this.allCssProperties = filteredCssProperties.length

      const styleDiffs = getStyleDiffs(allElementStylesPerDiff)
      this.countedProperties = getCountedProperties(styleDiffs)
    },
    openDiffHistories(diffHistories) {
      for (let i = 0; i < diffHistories.length; i++) {
        const to = diffHistories[i].to
        const from = diffHistories[i].from
        if (!!to && !!from) {
          const { eventInfo, hast: toHast } = to
          const { hast: fromHast } = from
          if (!eventInfo) continue;

          const id = eventInfo.eventId
          if (!id) console.log('ID is noting!', id)

          const toNewRootHast = getNewRootPathElements(toHast, id)
          const fromNewRootHast = getNewRootPathElements(fromHast, id)
          const diff = justDiff(toNewRootHast, fromNewRootHast)
          console.log(diff)
        }
        const infos = diffHistories[i].diffAndInfos;
        if (!infos) continue;
        const changes = countChanges(infos)
        this.changeStyleCount = changes.changeStyleCount
        this.addDomCount = changes.addDomCount
        this.deleteDomCount = changes.deleteDomCount
        this.changeDomCount = changes.changeDomCount
      }
    }
  }
}
</script>
