<template>
  <div v-if="state.jsonFileNameArr.length !== 0">
    <v-btn @click="openJson">open Json File!</v-btn>
    <v-btn @click="createJsonFile">create Json File!</v-btn>
    <div class="mx-6" v-for="file in storeHistoriesByFile" :key="file.name">
      <h3>file {{ file.name }}</h3>
      <div v-for="(history, key) in file.histories" :key="`histories-${key}`">
        <p>{{ key }}</p>
        <v-simple-table>
          <template #default>
            <thead>
              <tr>
                <th class="text-left">index</th>
                <th class="text-left">op</th>
                <th class="text-left">path</th>
                <th class="text-left">value</th>
                <th class="text-left">breadcrumbs</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(diff, d_key) in history.diffsWithbreadcrumbsPaths"
                :key="`diffs-${d_key}`"
              >
                <td>{{ d_key }}</td>
                <td>{{ diff.op }}</td>
                <td>{{ diff.path.join(', ') }}</td>
                <td>{{ diff.value }}</td>
                <td
                  v-for="(breadcrumbsPath, b_key) in diff.breadcrumbsPath"
                  :key="`breadcrumbsPath-${b_key}`"
                >
                  <span v-if="breadcrumbsPath.type"
                    >type: {{ breadcrumbsPath.type }},</span
                  >
                  <span v-if="breadcrumbsPath.tagName"
                    >tagName: {{ breadcrumbsPath.tagName }}</span
                  >
                  <span v-if="breadcrumbsPath.properties"
                    >properties: {{ breadcrumbsPath.properties }}</span
                  >
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import axios from 'axios'
import { HastNode } from 'hast-util-from-dom/lib'
import { defineComponent, reactive } from 'vue'
import { JsonFile } from '~/mixins/deepDiffType'
import { getNewRootPathElements } from '~/utils/getNewRootPathElements'
import { DiffHistory, Diffs } from '~/utils/recording/diffTypes'
import {
  createDiffsWithBreadcrumbsPath,
  DataHistory,
} from '~/utils/createDiffs/breadcrumbs'
import { JsonFileArr } from './checkPercent.vue'
import { diff as justDiff } from 'just-diff'
import { saveJsonFile } from '~/utils/saveJsonFile'
import { useHistoriesByFileStore } from '~/composables/globalState'

type State = {
  jsonFileNameArr: string[]
}

export default defineComponent({
  setup() {
    const { historiesByFile: storeHistoriesByFile, setHistoriesByFile } =
      useHistoriesByFileStore()

    const state = reactive<State>({
      jsonFileNameArr: [],
    })

    const getJsonFileNames = async () => {
      const fileNamelist: string[] = await axios
        .get(`/fileNameList.json`)
        .then((x) => {
          return x.data
        })
      state.jsonFileNameArr = fileNamelist
      console.log(state.jsonFileNameArr)
    }

    getJsonFileNames()

    const openJson = async () => {
      if (state.jsonFileNameArr.length === 0) return
      console.log('open json ...')
      const jsonFileArr = await Promise.all(
        state.jsonFileNameArr.map(async (name) => {
          const json: JsonFile = await axios.get(`/json/${name}`).then((x) => {
            return x.data
          })
          return { name, json }
        })
      )
      console.log('open!')
      openJsonHistory(jsonFileArr)
    }

    const openJsonHistory = (jsonFileArr: JsonFileArr) => {
      const historiesByFile = jsonFileArr.map((file) => {
        const { diffHistories } = file.json
        const histories = openDiffHistories(diffHistories)
        return { name: file.name, histories }
      })

      setHistoriesByFile(historiesByFile)
    }

    const openDiffHistories = (
      diffHistories: Array<DiffHistory>
    ): DataHistory[] => {
      let histories = []
      for (let i = 0; i < diffHistories.length; i++) {
        const { to, from } = diffHistories[i]
        if (!!to && !!from) {
          const { eventInfo, hast: toHast } = to
          const { hast: fromHast } = from
          if (!eventInfo) continue

          const id = eventInfo.eventId
          if (!id) console.log('ID is noting!', id)
          const history = createHistory(toHast, fromHast, id)
          histories.push(history)
        }
      }
      return histories
    }

    const createHistory = (
      toHast: HastNode,
      fromHast: HastNode,
      id: string
    ): DataHistory => {
      const toNewRootHast = getNewRootPathElements(toHast, id)
      const fromNewRootHast = getNewRootPathElements(fromHast, id)
      const diffs: Diffs = justDiff(toNewRootHast, fromNewRootHast)
      const diffsWithbreadcrumbsPaths = createDiffsWithBreadcrumbsPath(
        diffs,
        toNewRootHast
      )
      const history = {
        old: {to: toHast, id},
        from: fromNewRootHast,
        to: toNewRootHast,
        diffs,
        diffsWithbreadcrumbsPaths,
      }
      console.log(history)
      return history
    }

    const createJsonFile = () => {
      storeHistoriesByFile.value.forEach((file) => {
        const name = `histories_${file.name}`
        saveJsonFile(file.histories, name)
      })
    }

    return {
      state,
      storeHistoriesByFile,
      openJson,
      createJsonFile,
    }
  },
})
</script>
