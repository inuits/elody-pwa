<template>
  <div id="font-body">
    <nav
      class="fixed left-0 top-0 w-20  h-screen flex justify-center pt-8 bg-neutral-20"
    >
      <router-link
        :to="{ name: 'Home' }"
        class="logo text-base text-neutral-700 font-semibold"
      >
        DAMS
      </router-link>
    </nav>
    <div class="pl-20 h-screen flex flex-col">
      <div
        class="w-full px-6 py-8 border-b border-neutral-30 bg-neutral-0 z-10"
      >
        <h1 class="text-lg font-semibold text-neutral-800">
          {{ route.meta.title }}
        </h1>
      </div>
      <div class="flex-grow">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, provide, watch } from "vue"
import { DefaultApolloClient } from "@vue/apollo-composable"
import { apolloClient } from "./apolloClient"
import { useRoute } from "vue-router"

export default defineComponent({
  name: "App",
  setup() {
    provide(DefaultApolloClient, apolloClient)
    const route = useRoute()

    return {
      route,
    }
  },
})
</script>

<style scoped>
.logo {
  writing-mode: vertical-lr;
}
</style>
