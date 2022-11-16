<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="12" md="12">
        <Space direction="vertical" size="large" type="flex" id="check-component">
          <Input v-model="search" search placeholder="Enter something..." class="my-4"/>
          <Table :columns="columns" :data="filteredDesserts"></Table>
          <Row justify="end" align="middle" class="code-row-bg mt-4">
            <Col span="3">
              <div class="pr-4 text-right">Rows per page:</div>
            </Col>
            <Col span="2">
              <Select v-model="rowsPerPage">
                <Option v-for="item in rowsPerPageList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </Col>
            <Col span="3">
              <div class="pr-4 text-right">1-10 of 10</div>
            </Col>
            <Col span="2">
              <ButtonGroup>
                <Button type="primary" icon="ios-arrow-back"></Button>
                <Button type="primary" icon="ios-arrow-forward"></Button>
              </ButtonGroup>
            </Col>
          </Row>
          
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
  rowsPerPageList: {value: number | 'All', label: string}[],
  rowsPerPage: number | 'All',
  page: number
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
      rowsPerPageList: [
        {value: 5, label: '5'},
        {value: 10, label: '10'},
        {value: 15, label: '15'},
        {value: 'All', label: 'All'}
      ],
      rowsPerPage: 10,
      page: 1,
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
