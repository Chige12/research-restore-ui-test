<template>
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
          v-for="(diff, d_key) in diffsWithbreadcrumbsPaths"
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
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import type { PropType } from 'vue'
import { DiffAndInfos } from '~/utils/recording/diffTypes'

export default defineComponent({
  props: {
    diffsWithbreadcrumbsPaths: {
      type: Object as PropType<DiffAndInfos>,
      required: true,
    },
  },
  setup(props) {
    const { diffsWithbreadcrumbsPaths } = toRefs(props)
    return {
      diffsWithbreadcrumbsPaths,
    }
  },
})
</script>
