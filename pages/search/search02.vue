<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="12" md="12">
        <Space direction="vertical" size="large" type="flex" id="check-component">
          <Input v-model="search" search placeholder="Enter something..." class=""/>
          <Table :columns="columns" :data="filteredDesserts"></Table>
        </Space>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Mixin from '~/mixins/deepDiff'
import { desserts, Dessert } from '~/assets/searchObj'

type Data = {
  search: string
  columns: {
    title: string
    key: string
  }[]
  filteredDesserts: Dessert[]
  desserts: Dessert[]
}

const isMatch = (text: string, keyword: string) => {
  return !text.trim().toLowerCase().indexOf(keyword.trim().toLowerCase())
}

export default Vue.extend({
  name: 'Search02',
  mixins: [Mixin],
  data(): Data {
    return {
      search: '',
      columns: [
        {
          title: 'Dessert (100g serving)',
          key: 'name',
        },
        { title: 'Calories', key: 'calories' },
        { title: 'Fat (g)', key: 'fat' },
        { title: 'Carbs (g)', key: 'carbs' },
        { title: 'Protein (g)', key: 'protein' },
        { title: 'Iron (%)', key: 'iron' },
      ],
      filteredDesserts: desserts,
      desserts: desserts,
    }
  },
  watch: {
    search: function(newText: string, oldText: string) {
      if (newText === oldText) return;

      if (!newText) {
        this.filteredDesserts = this.desserts
      }
      console.log("search")

      this.filteredDesserts = this.desserts.filter((arr) => {
        return (
          isMatch(arr.name, newText) ||
          isMatch(arr.calories.toString(), newText) ||
          isMatch(arr.fat.toString(), newText) ||
          isMatch(arr.carbs.toString(), newText) ||
          isMatch(arr.protein.toString(), newText) ||
          isMatch(arr.iron.toString(), newText)
        )
      })
    }
  },
})
</script>
