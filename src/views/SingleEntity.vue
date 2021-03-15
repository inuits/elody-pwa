<template>
  <IIIFViewer />
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { useQuery } from "@vue/apollo-composable"
import gql from "graphql-tag"
import IIIFViewer from "../components/IIIFViewer.vue"

export default defineComponent({
  name: "SingleEntity",
  components: {
    IIIFViewer,
  },
  setup: () => {
    const { result, loading } = useQuery(gql`
      query {
        Entity(id: "2017-0448") {
          _id
          type
          metadata {
            key
            value
          }
        }
      }
    `)

    return {
      result,
      loading,
    }
  },
})
</script>
