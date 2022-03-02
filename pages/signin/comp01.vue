<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card outlined id="check-component">
        <v-card-title class="headline px-12 pt-8"> Sign in </v-card-title>
        <v-card-text class="px-12 py-4">
          <v-text-field
            v-model="email"
            type="email"
            outlined
            label="Email address"
            :rules="[rules.required, rules.email]"
          ></v-text-field>
          <v-text-field
            v-model="password"
            outlined
            label="Password"
            :type="isShowPassword ? 'text' : 'password'"
            :append-icon="isShowPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[rules.required, rules.min]"
            name="input-10-2"
            hint="At least 8 characters"
            class="input-group--focused"
            @click:append="isShowPassword = !isShowPassword"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="px-12 pb-8">
          <v-spacer />
          <v-btn outlined nuxt to="/inspire"> Continue </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'
import Mixin from '~/mixins/deepDiff'

type Data = {
  email: string
  password: string
  isShowPassword: boolean
  rules: {
    required: (value: string) => string | boolean
    min: (v: string) => string | boolean
    email: (value: string) => string | boolean
  }
}

export default Vue.extend({
  name: 'SignInComp01',
  mixins: [ Mixin ],
  data(): Data {
    return {
      email: '',
      password: '',
      isShowPassword: false,
      rules: {
        required: value => !!value || 'Required.',
        min: v => v.length >= 8 || 'Min 8 characters',
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(value) || 'Invalid e-mail.'
        },
      },
    }
  },
})
</script>
