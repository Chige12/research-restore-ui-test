<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="12" md="12">
        <Space
          direction="vertical"
          size="large"
          type="flex"
          id="check-component"
        >
          <Input
            v-model="search"
            search
            placeholder="Enter something..."
            class="my-4"
          />
          <Table :columns="columns" :data="searchedDesserts"></Table>
          <Row justify="end" align="middle" class="code-row-bg mt-4">
            <Col span="3">
              <div class="pr-4 text-right">Rows per page:</div>
            </Col>
            <Col span="2">
              <Select v-model="rowsPerPage">
                <Option
                  v-for="item in rowsPerPageList"
                  :value="item.value"
                  :key="item.value"
                  >{{ item.label }}</Option
                >
              </Select>
            </Col>
            <Col span="3">
              <div class="pr-4 text-right">
                {{ firstItemNumber }}-{{ endItemNumber }} of
                {{ desserts.length }}
              </div>
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

type RowsPerPage = number | 'All'

type Data = {
  search: string
  columns: {
    title: string
    key: string
  }[]
  searchedDesserts: Dessert[]
  desserts: Dessert[]
  rowsPerPageList: { value: RowsPerPage; label: string }[]
  rowsPerPage: RowsPerPage
  page: number
  firstItemNumber: number
  endItemNumber: number
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
      searchedDesserts: desserts,
      desserts: desserts,
      rowsPerPageList: [
        { value: 5, label: '5' },
        { value: 10, label: '10' },
        { value: 15, label: '15' },
        { value: 'All', label: 'All' },
      ],
      rowsPerPage: 10,
      page: 1,
      firstItemNumber: 1,
      endItemNumber: 10,
    }
  },
  methods: {
    calculateFirstItemNumber(rowsPerPage: RowsPerPage, page: number) {
      if (rowsPerPage === 'All') return 1
      return (page - 1) * rowsPerPage + 1
    },
    calculateEndItemNumber(rowsPerPage: RowsPerPage, page: number) {
      if (rowsPerPage === 'All') return this.desserts.length
      return (page - 1) * rowsPerPage + rowsPerPage
    },
    updateSearchedDesserts(
      text: string,
      rowsPerPage: RowsPerPage,
      page: number
    ) {
      const filteredDesserts = !text
        ? desserts
        : desserts.filter((arr) => {
            return (
              isMatch(arr.name, text) ||
              isMatch(arr.calories.toString(), text) ||
              isMatch(arr.fat.toString(), text) ||
              isMatch(arr.carbs.toString(), text) ||
              isMatch(arr.protein.toString(), text) ||
              isMatch(arr.iron.toString(), text)
            )
          })
      this.firstItemNumber = this.calculateFirstItemNumber(rowsPerPage, page)
      this.endItemNumber = this.calculateEndItemNumber(rowsPerPage, page)

      if (rowsPerPage === 'All') {
        this.searchedDesserts = filteredDesserts
        this.page = 1
        return
      }
      this.searchedDesserts = filteredDesserts.slice(
        this.firstItemNumber - 1,
        this.endItemNumber
      )
    },
  },
  watch: {
    search(next: string) {
      this.updateSearchedDesserts(next, this.rowsPerPage, this.page)
    },
    page(next: number) {
      this.updateSearchedDesserts(this.search, this.rowsPerPage, next)
    },
    rowsPerPage(next: RowsPerPage) {
      this.updateSearchedDesserts(this.search, next, this.page)
    },
  },
})
</script>
