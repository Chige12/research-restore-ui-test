<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card id="check-component" color="#fafafa" elevation="0">
        <h3>サインイン</h3>
        <label>メール：<input type="email" //></label>
        <label>パスワード：<input type="password" //></label>
        <input type="submit" value="サインイン" //>
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
  mixins: [Mixin],
  data(): Data {
    return {
      email: '',
      password: '',
      isShowPassword: false,
      rules: {
        required: (value) => !!value || 'Required.',
        min: (v) => v.length >= 8 || 'Min 8 characters',
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(value) || 'Invalid e-mail.'
        },
      },
    }
  },
})
</script>
