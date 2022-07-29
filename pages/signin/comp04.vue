<template>
  <v-row id="check-component" justify="center" align="center">
    <div class="text-center">
      <v-bottom-sheet v-model="sheet" inset>
        <template #activator="{ on, attrs }">
          <v-btn color="orange" dark v-bind="attrs" v-on="on">
            Open Inset
          </v-btn>
        </template>
        <v-sheet class="text-center" height="200px">
          <v-btn class="mt-6" text color="error" @click="sheet = !sheet">
            close
          </v-btn>
          <div class="my-3">This is a bottom sheet using the inset prop</div>
        </v-sheet>
      </v-bottom-sheet>
    </div>

    <v-switch v-model="showMessages" label="Show messages" />
    <p v-if="showMessages">hogehoge</p>

    <v-expansion-panels>
      <v-expansion-panel v-for="i in 5" :key="i">
        <v-expansion-panel-header> Item </v-expansion-panel-header>
        <v-expansion-panel-content>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="text-center">
      <v-dialog v-model="dialog" width="500">
        <template #activator="{ on, attrs }">
          <v-btn color="red lighten-2" dark v-bind="attrs" v-on="on">
            Click Me
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            Privacy Policy
          </v-card-title>
          <v-card-text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" text @click="dialog = false">
              I accept
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <v-container fluid>
      <v-row align="center">
        <v-col class="d-flex" cols="12" sm="6">
          <v-select :items="items" label="Standard" />
        </v-col>
        <v-col class="d-flex" cols="12" sm="6">
          <v-select :items="items" filled label="Filled style" />
        </v-col>
        <v-col class="d-flex" cols="12" sm="6">
          <v-select :items="items" label="Outlined style" outlined />
        </v-col>
        <v-col class="d-flex" cols="12" sm="6">
          <v-select :items="items" label="Solo field" solo />
        </v-col>
      </v-row>
    </v-container>

    <v-container class="px-0" fluid>
      <v-radio-group v-model="radioGroup">
        <v-radio v-for="n in 3" :key="n" :label="`Radio ${n}`" :value="n" />
      </v-radio-group>
    </v-container>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'
import Mixin from '~/mixins/deepDiff'

type Data = {
  sheet: boolean
  dialog: boolean
  showMessages: boolean
  items: Array<string>
  radioGroup: number
}

export default Vue.extend({
  name: 'SignInComp04',
  mixins: [Mixin],
  data(): Data {
    return {
      sheet: false,
      dialog: false,
      showMessages: false,
      items: ['Foo', 'Bar', 'Fizz', 'Buzz'],
      radioGroup: 1,
    }
  },
})
</script>
