<template>
  <el-container>
    <el-main>
      <el-row type="flex" class="row-bg" justify="center">
        <el-col :span="6">
          <el-form
            :model="ruleForm"
            status-icon
            :rules="rules"
            id="check-component"
            ref="ruleForm"
          >
            <h3 class="mb-4">サインイン</h3>
            <el-form-item
              label="E-mail"
              :label-width="formLabelWidth"
              prop="email"
            >
              <el-input
                v-model="ruleForm.email"
                type="email"
                placeholder="Please input email"
                autocomplete="off"
              />
            </el-form-item>
            <el-form-item
              label="Password"
              :label-width="formLabelWidth"
              prop="password"
            >
              <el-input
                v-model="ruleForm.password"
                type="password"
                placeholder="Please input password"
                show-password
                autocomplete="off"
              />
            </el-form-item>
            <el-button type="primary" @click="toLink">サインイン</el-button>
          </el-form>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import Vue from 'vue'

type Data = {
  isShowPassword: boolean
  ruleForm: {
    email: string
    password: string
  }
  rules: {
    required: (value: string) => string | boolean
    min: (v: string) => string | boolean
    email: any
    password: any
  }
  formLabelWidth: string
}

export default Vue.extend({
  name: 'SignInComp01',
  layout: 'onlyPage',
  data(): Data {
    const validateEmail = (rule: any, value: string, callback: any) => {
      const pattern =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (value === '') {
        callback(new Error('Please input the email'))
      } else if (!pattern.test(value)) {
        callback(new Error('Invalid e-mail.'))
      } else {
        callback()
      }
    }

    const validatePass = (rule: any, value: string, callback: any) => {
      if (value === '') {
        callback(new Error('Please input the password'))
      } else {
        if (value.length < 8) {
          callback(new Error('Min 8 characters'))
        }
        callback()
      }
    }

    return {
      isShowPassword: false,
      ruleForm: {
        email: '',
        password: '',
      },
      rules: {
        email: [{ validator: validateEmail, trigger: 'change' }],
        password: [{ validator: validatePass, trigger: 'change' }],
        required: (value) => !!value || 'Required.',
        min: (v) => v.length >= 8 || 'Min 8 characters',
      },
      formLabelWidth: '80px',
    }
  },
  methods: {
    toLink() {
      this.$router.push('/inspire')
    }
  }
})
</script>
