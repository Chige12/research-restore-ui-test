<template>
  <div>
    <div class="mx-6">
      <p> diffCount {{diffCount}} </p>
      <p> changeStyleCount  {{changeStyleCount}} | {{ changeStyleCount / allCount  * 100}}%</p>
      <p> addDomCount       {{addDomCount}}      | {{ addDomCount / allCount  * 100}}%</p>
      <p> changeDomCount    {{changeDomCount}}   | {{ changeDomCount / allCount  * 100}}%</p>
      <p> deleteDomCount    {{deleteDomCount}}   | {{ deleteDomCount / allCount  * 100}}%</p>
      <p> allCount {{allCount}} </p>
    </div>
    <div class="mx-6">
      <p> allCssProperties {{allCssProperties}} </p>
      <div v-for="prop in sortedCssProperties" :key="prop.propety">
        <span>{{prop.propety}}</span>：<span>{{prop.count}}</span> | <span>{{prop.count / allCssCount * 100}}%</span>
      </div>
    </div>
  </div>
</template>

<script>
import fileNameList from '@/assets/fileNameList.json'

// const cssProperties = [
//   {
//     propety: '',
//     count: 0,
//   }
// ]

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
      cssProperties: []
    }
  },
  computed: {
    allCount() {
      return this.changeStyleCount + this.addDomCount + this.deleteDomCount
    },
    allCssCount() {
      const reducer = (sum, currentValue) => sum.count + currentValue.count
      return cssProperties.reduce(reducer)
    },
    sortedCssProperties() {
      return this.cssProperties.sort((a, b) => b.count - a.count);
    },
  },
  mounted() {
    const json = '{"diffHistories":true, "cssPropeties":42}';
    this.openJson(json);
    // this.openJson(fileNameList);
  },
  methods: {
    openJson(json) {
      const obj = JSON.parse(json);
      const { diffHistories, cssPropeties } = obj

      this.openDiffHistories(diffHistories)
      this.openCssPropeties(cssPropeties)
    },
    openDiffHistories(diffHistories) {
      diffHistories.forEach((diffHistory) => {
        const info = diffHistory.diffAndInfos
        if (!info) return;
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
      })
    },
    openCssPropeties(cssPropeties) {

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
