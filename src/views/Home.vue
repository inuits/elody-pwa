<template>
  <div class="p-6">
    <Pagination
      v-if="!loading && result"
      v-model:paginationInfo="paginationInfo"
      :max-page="Math.round(result.Entities.count / 20)"
    />
    <ListContainer>
      <div v-if="loading">
        <EntityListItem
          v-for="n in 20"
          :key="n"
          title="loading"
          :loading="true"
        />
      </div>
      <div v-else-if="result && result.Entities.results">
        <EntityListItem
          v-for="entity in result.Entities.results"
          :key="entity.id"
          onclick=""
          :title="entity.title[0].value"
          @click="
            router.push({ name: 'SingleEntity', params: { id: entity.id } })
          "
        />
      </div>
    </ListContainer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue"
import { useQuery } from "@vue/apollo-composable"
import ListContainer from "../components/ListContainer.vue"
import EntityListItem from "../components/EntityListItem.vue"
import Pagination from "../components/base/Pagination.vue"
import { useRouter } from "vue-router"
import {
  getEnteties,
  getEntitiesQueryType,
  getEntitiesQueryVariableType,
} from "../queries/entities"

export default defineComponent({
  name: "Home",
  components: {
    ListContainer,
    EntityListItem,
    Pagination,
  },
  setup: () => {
    const router = useRouter()

    const paginationInfo = ref<getEntitiesQueryVariableType>({
      skip: 0,
      limit: 20,
    })

    const { result, loading, fetchMore } = useQuery<
      getEntitiesQueryType | undefined,
      getEntitiesQueryVariableType
    >(getEnteties, paginationInfo)

    watch(paginationInfo, (value) => {
      fetchMore({
        variables: value,
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (fetchMoreResult !== undefined) {
            return fetchMoreResult
          }
        },
      })
    })

    return {
      result,
      loading,
      router,
      paginationInfo,
    }
  },
})
</script>
