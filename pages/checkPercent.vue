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
import { get, cloneDeep } from 'lodash'
import json1 from '@/assets/json/diffHistories-signin-comp02.json'
import json2 from '@/assets/json/diffHistories-signin-comp04.json'
import { diff as justDiff } from 'just-diff'
const cssProperties = require('css-properties')

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

      this.openCssPropeties(allElementStylesPerDiff)
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

          const toNewRootHast = this.getNewRootPathElements(toHast, id)
          const fromNewRootHast = this.getNewRootPathElements(fromHast, id)
        }
        const infos = diffHistories[i].diffAndInfos;
        if (!infos) continue;
        infos.forEach(info => {
          switch (info.type) {
            case 'class':
            case 'style':
              this.changeStyleCount++
              break;
            case 'dom':
              this.domChanges(info.elementDiffs)
            default:
              break;
          }
        });
      }
    },
    getNewRootPathElements(hast, newRootId){
      const generateElementsDeletedChildArr = (element, pathArr) => {
        const elementsDeleteChildArr = pathArr.map((_path, index, arr) => {
          const deleteChildPath = arr.slice(0, index+2)
          const deleteChildProperty = deleteChildPath.slice(-1)[0] //最後だけ取得
          const deleteChildElement = cloneDeep(get(element, deleteChildPath.slice(0, -1))); //最後だけ除いて取得
          // 親を示す際に、自分が含まれてしまうので消去し、兄弟だけにする。
          if (deleteChildProperty !== 'properties') {
            deleteChildElement[deleteChildProperty] = 'me'
          }
          return deleteChildElement
        })
        // 最後同じオブジェクトが続いてしまうので消去
        return elementsDeleteChildArr.slice(0, -1)
      }

      const generateNewRootPathElementsByArr = (elemArr) => {
        let newElement = {}
        for (let i = 0; i < elemArr.length; i++) {
          const element = cloneDeep(elemArr[i])
          if (i === 0) {
            newElement = element
          } else {
            if(Array.isArray(element)) {
              newElement.brothers = element
            } else {
              element.parent = newElement
              newElement = cloneDeep(element)
            }
          }
        }
        return newElement
      }

      const pathToRoot = this.getPathById(hast, newRootId)
      const elementsDeleteChildArr = generateElementsDeletedChildArr(hast, pathToRoot)
      const newRootPathElements = generateNewRootPathElementsByArr(elementsDeleteChildArr)
      console.log(newRootPathElements)
      return newRootPathElements
    },
    getPathById (hast, elementId) {
      // 特定のエレメントのIDを検索してそのエレメントまでのpathを返す
      const key = 'id'
      const path = [];
      const keyExists = (obj) => {
        if (!obj || (typeof obj !== "object" && !Array.isArray(obj))) {
          return false;
        }
        else if (obj.hasOwnProperty(key) && obj[key] === elementId) {
          return true;
        }
        else if (Array.isArray(obj)) {
          for (let i = 0; i < obj.length; i++) {
            const result = keyExists(obj[i], key);
            if (result) {
              path.push(i);
              return result;
            }
          }
        }
        else {
          for (const k in obj) {
            const result = keyExists(obj[k], key);
            if (result) {
              path.push(k);
              return result;
            }
          }
        }
        return false;
      };

      keyExists(hast);
      return path.reverse();
    },
    openCssPropeties(allElementStylesPerDiff) {
      const styleDiffs = []
      for (let i = 0; i < allElementStylesPerDiff.length - 1; i++) {
        const props1 = allElementStylesPerDiff[i];
        const props2 = allElementStylesPerDiff[i + 1];
        const diffs = justDiff(props1, props2)
        const filteredDiffs = diffs.filter((diff) => {
          return diff.op === 'replace'
        })
        const diffAndStyle = filteredDiffs.map((diff) => {
          const { path } = diff
          const lastPath = path.slice(0, path.length - 1)
          const style = get(props2, lastPath)
          return {
            ...diff,
            property: style.property
          }
        })
        styleDiffs.push(...diffAndStyle)
        console.log(styleDiffs)
      }
      console.log('styleDiffs',styleDiffs)

      const filteredCssProperties = cssProperties.filter((prop) => {
        switch (prop) {
          case 'border-bottom':
          case 'border-left':
          case 'border-right':
          case 'border-top':
          case 'border-bottom-color':
          case 'border-left-color':
          case 'border-right-color':
          case 'border-top-color':
          case 'text-decoration-color':
          case 'column-rule-color':
          case 'outline-color':
          case 'margin':
          case 'padding':
          case 'border-top-left-radius':
          case 'border-top-right-radius':
          case 'border-bottom-left-radius':
          case 'border-bottom-right-radius':
          case 'overflow':
          case 'border-bottom-width':
          case 'border-top-width':
          case 'border-right-width':
          case 'border-left-width':
          case 'border-bottom-style':
          case 'border-left-style':
          case 'border-right-style':
          case 'border-top-style':
          case 'list-style-type':
            return false
          default:
            return true
            break;
        }
      })

      this.allCssProperties = filteredCssProperties.length
      const countedProperties = filteredCssProperties.map((property) => {
        const filteredStyleDiffs = styleDiffs.filter((diff) => {
          return diff.property === property
        })
        const count = filteredStyleDiffs.length
        return {
          property,
          count,
        }
      })
      this.countedProperties = countedProperties
    },
    domChanges(elementDiffs) {
      const to = elementDiffs.to
      const from = elementDiffs.from
      if (to === undefined && from !== undefined) {
        this.removeDomCount++
        return;
      }
      if (to !== undefined && from === undefined) {
        this.addDomCount++
        return;
      }
      if (to !== undefined && from !== undefined) {
        if (to.tagName === from.tagName) {
          this.changeDomCount++
          return;
        }
        this.addDomCount++
        this.removeDomCount++
      }
    }
  }
}
</script>
