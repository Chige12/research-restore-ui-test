<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>
      <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-btn icon @click.stop="fixed = !fixed">
        <v-icon>mdi-minus</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn icon @click.stop="rightDrawer = !rightDrawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <Nuxt />
    </v-main>
    <v-navigation-drawer v-model="rightDrawer" :right="right" temporary fixed>
      <v-list>
        <v-list-item @click.native="right = !right">
          <v-list-item-action>
            <v-icon light> mdi-repeat </v-icon>
          </v-list-item-action>
          <v-list-item-title>Switch drawer (click me)</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/',
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'checkPercent',
          to: '/checkPercent',
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'createDiffs',
          to: '/createDiffs',
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'guessCombination',
          to: '/guessCombination',
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'checkDiffs',
          to: '/checkDiffs',
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire',
        },
        {
          icon: 'mdi-login',
          title: 'SignIn 01',
          to: '/signin/comp01',
        },
        {
          icon: 'mdi-login',
          title: 'SignIn 02',
          to: '/signin/comp02',
        },
        {
          icon: 'mdi-login',
          title: 'SignIn 03 elementUI',
          to: '/signin/elementUI',
        },
        {
          icon: 'mdi-login',
          title: 'SignIn 04 iView',
          to: '/signin/iView',
        },
        {
          icon: 'mdi-login',
          title: 'SignIn 04',
          to: '/signin/comp04',
        },
        {
          icon: 'mdi-magnify',
          title: 'Search 01',
          to: '/search/search01',
        },
        {
          icon: 'mdi-magnify',
          title: 'Search 02',
          to: '/search/search02',
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js',
    }
  },
}
</script>
