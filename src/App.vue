<template>
  <div id="font-body">
    <nav
      class="fixed left-0 top-0 w-20  h-screen flex flex-col justify-start align-center  pt-10 bg-neutral-20 px-5"
    >
      <router-link
        :to="{ name: 'AssestLibrary' }"
        class="logo text-base text-neutral-700 font-semibold flex justify-center items-center mb-8"
      >
        DAMS
      </router-link>
      <BaseButton
        :icon="IncludedIcons.BookOpen"
        bg-color="30"
        @click="router.push({ name: 'AssestLibrary' })"
      />
    </nav>
    <div class="pl-20 h-screen flex flex-col">
      <div
        class="w-full px-6 py-8 border-b border-neutral-30 bg-neutral-0 z-10"
      >
        <h1 class="text-lg font-semibold text-neutral-800">
          {{ pageTitle }}
        </h1>
      </div>
      <div class="flex-grow">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, provide, ref, onUpdated } from 'vue'
  import { DefaultApolloClient } from '@vue/apollo-composable'
  import { apolloClient } from './apolloClient'
  import { useRoute, useRouter } from 'vue-router'
  import { IncludedIcons } from './enums'
  import BaseButton from './components/base/BaseButton.vue'

  export type updatePageTitleType = (_newTitle: string) => void
  export type setRoutePageTitleType = () => void

  export default defineComponent({
    name: 'App',
    components: {
      BaseButton
    },
    setup() {
      // Provide appolloClient for all childeren
      provide(DefaultApolloClient, apolloClient)
      const route = useRoute()
      const router = useRouter()

      // Provide option to update the page title
      const pageTitle = ref<string | unknown>(route.meta.title)
      const updatePageTitle: updatePageTitleType = (newTitle: string) => {
        pageTitle.value = newTitle
      }
      const setRoutePageTitle: setRoutePageTitleType = () => {
        pageTitle.value = route.meta.title
      }

      provide('updatePageTitle', updatePageTitle)
      provide('setRoutePageTitle', setRoutePageTitle)

      return {
        router,
        pageTitle,
        IncludedIcons
      }
    }
  })
</script>

<style scoped>
  .logo {
    writing-mode: vertical-lr;
  }
</style>
