<template>
  <div v-if="state.isExistJsonFile" class="ma-4">
    <div>
      <v-btn @click="updateHistoriesByFile" outlined> update! </v-btn>
      <v-btn @click="createJsonFile" outlined>create Json File!</v-btn>
      <v-btn v-if="storeHistoriesByFile.length > 0" to="guessCombination" fill color="primary" elevation="0">guess comvination</v-btn>
    </div>
    <div class="my-6" v-for="file in storeHistoriesByFile" :key="file.fileName">
      <h3>file {{ file.fileName }}</h3>
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
import { defineComponent, reactive, Ref } from 'vue'
import { diff as justDiff } from 'just-diff'
import { getNewRootPathElements } from '~/utils/getNewRootPathElements'
import { Diffs } from '~/types/diffs'
import { createDiffsWithBreadcrumbsPath } from '~/utils/createDiffs/breadcrumbs'
import {
  FromAndToHastHistory,
  EventHistory,
  HistoriesAndFileData,
  HistoriesByFile,
} from '~/types/history'
import { JsonFile, JsonFiles } from '~/utils/jsonFilesType'
import { saveJsonFile } from '~/utils/saveJsonFile'
import { useFileStore } from '~/composables/globalState'
import { EventInfo } from '~/types/event'

type State = {
  isExistJsonFile: boolean
  historiesByFile: HistoriesByFile
}

export default defineComponent({
  setup() {
    const {state: storeHistoriesByFile, setState: setHistoriesByFile } =
      useFileStore<HistoriesByFile>('historiesByFile', [])

    const state = reactive<State>({
      isExistJsonFile: false,
      historiesByFile: []
    })

    onMounted(() => {
      updateHistoriesByFile()
    })

    const updateHistoriesByFile = async () => {
      const jsonFiles = await getJsonFiles()
      console.log('get json!')
      if (!jsonFiles) return

      const historiesByFile = await createHistoriesByFile(jsonFiles)
      console.log('finish create histories!')
      setHistoriesByFile(historiesByFile)
    }

    const getAndSetStateJsonFileNames = async (): Promise<string[]> => {
      const jsonFileNames = await axios.get(`/fileNameList.json`).then((x) => {
        return x.data
      })
      state.isExistJsonFile = jsonFileNames.length !== 0
      return jsonFileNames
    }

    const getJsonFiles = async (): Promise<JsonFiles | null> => {
      const jsonFileNames = await getAndSetStateJsonFileNames()
      if (jsonFileNames.length === 0) return null
      console.log('open json file ...')
      return await Promise.all(
        jsonFileNames.map(async (name) => {
          const data: JsonFile = await axios.get(`/json/${name}`).then((x) => {
            return x.data
          })
          return { name, data }
        })
      )
    }

    const createHistoriesByFile = async (jsonFiles: JsonFiles): Promise<HistoriesByFile> => {
      return await Promise.all(jsonFiles.map(async (file, index) => {
        const { fromAndToHastHistories } = file.data
        const histories = await createHistories(fromAndToHastHistories)
        const historiesANdFileData: HistoriesAndFileData = {
          fileName: file.name,
          index,
          histories,
        }
        return historiesANdFileData
      }))
    }

    const createHistories = async (
      fromAndToHastHistories: FromAndToHastHistory[]
    ): Promise<EventHistory[]> => {
      const historiesIncludeUndefined = await Promise.all(fromAndToHastHistories.map(async (x)=>{
        const { to, from } = x
        if (!to || !from) return

        const { hast: toHast, eventInfo } = to
        const { hast: fromHast } = from
        if (!eventInfo) return

        const id = eventInfo.eventId
        if (!id) console.log('ID is noting!', id)
        const history = await createHistory(toHast, fromHast, eventInfo)
        return history
      }))
      const histories = historiesIncludeUndefined.filter((x) => typeof x !== 'undefined') as EventHistory[]
      return histories
    }

    const createHistory = (
      toHast: HastNode,
      fromHast: HastNode,
      eventInfo: EventInfo
    ): Promise<EventHistory> => {
      return new Promise((resolve, _reject) => {
        const toNewRootHast = getNewRootPathElements(toHast, eventInfo.eventId)
        const fromNewRootHast = getNewRootPathElements(
          fromHast,
          eventInfo.eventId
        )
        const diffs: Diffs = justDiff(toNewRootHast, fromNewRootHast)
        const diffsWithbreadcrumbsPaths = createDiffsWithBreadcrumbsPath(
          diffs,
          toNewRootHast
        )
        const history = {
          oldFormat: { to: toHast },
          eventInfo,
          from: fromNewRootHast,
          to: toNewRootHast,
          diffs,
          diffsWithbreadcrumbsPaths,
        }
        return resolve(history)
      })
    }

    const createJsonFile = () => {
      storeHistoriesByFile.value.forEach((file) => {
        const name = `histories_${file.fileName}`
        saveJsonFile(file.histories, name)
      })
    }

    return {
      state,
      storeHistoriesByFile,
      updateHistoriesByFile,
      createJsonFile,
    }
  },
})
</script>
