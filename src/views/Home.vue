<template>
  <ListContainer>
    <div v-if="loading">
      <EntityListItem
        v-for="n in 20"
        :key="n"
        title="loading"
        :loading="true"
      />
    </div>
    <div v-else-if="result && result.Entities">
      <EntityListItem
        v-for="entity in result.Entities"
        :key="entity._id"
        @click="
          router.push({ name: 'SingleEntity', params: { id: result._id } })
        "
        onclick=""
        :title="
          entity.metadata.find((meta) => {
            return meta.key === 'title'
          }).value
        "
      />
    </div>
  </ListContainer>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { useQuery } from "@vue/apollo-composable"
import ListContainer from "../components/ListContainer.vue"
import EntityListItem from "../components/EntityListItem.vue"
import gql from "graphql-tag"
import { useRouter } from "vue-router"

export default defineComponent({
  name: "Home",
  components: {
    ListContainer,
    EntityListItem,
  },
  setup: () => {
    const router = useRouter()
    const { result, loading } = useQuery(gql`
      query {
        Entities {
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
      router,
    }
  },
})
</script>
