<template>
<div class="ma-8">
  <Form ref="formInline" :model="formInline" :rules="ruleInline" inline id="check-component">
    <FormItem prop="email">
      <Input type="text" v-model="formInline.email" placeholder="Email">
        <template #prepend>
          <Icon type="ios-mail-outline"></Icon>
        </template>
      </Input>
    </FormItem>
    <FormItem prop="password">
      <Input
        type="password"
        v-model="formInline.password"
        placeholder="Password"
      >
        <template #prepend>
          <Icon type="ios-lock-outline"></Icon>
        </template>
      </Input>
    </FormItem>
    <FormItem>
      <Button type="primary" @click="handleSubmit('formInline')">Signin</Button>
    </FormItem>
  </Form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Mixin from '~/mixins/deepDiff'

type Data = {
  formInline: {
    email: string
    password: string
  }
  ruleInline: {
    email: any[]
    password: any[]
  }
}

export default Vue.extend({
  name: 'SignInIView',
  mixins: [Mixin],
  data(): Data {
    return {
      formInline: {
        email: '',
        password: '',
      },
      ruleInline: {
        email: [
          {
            required: true,
            message: 'Please fill in the email',
            trigger: 'change',
          },
          {
            type: 'string',
            min: 8,
            message: 'The email length cannot be less than 8 bits',
            trigger: 'change',
          },
        ],
        password: [
          {
            required: true,
            message: 'Please fill in the password.',
            trigger: 'change',
          },
          {
            type: 'string',
            min: 8,
            message: 'The password length cannot be less than 8 bits',
            trigger: 'change',
          },
        ],
      },
    }
  },
  methods: {
    toLink() {
      this.$router.push('/inspire')
    },
    handleSubmit(name: string) {
      // const formInline = this.$refs.formInline
      // if (formInline) {
      //   formInline.validate((valid: boolean) => {
      //     if (valid) {
      //       this.$Message.success('Success!')
      //     } else {
      //       this.$Message.error('Fail!')
      //     }
      //   })
      // }
      this.toLink()
    },
  },
})
</script>
<style>
.demo-login {
  width: 400px;
  margin: 0 auto !important;
}

.demo-auto-login {
  margin-bottom: 24px;
  text-align: left;
}

.demo-auto-login a {
  float: right;
}
</style>