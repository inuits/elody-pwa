<template>
  <div class="p-6">
    <div class="flex justify-end py-4">
      <Pagination
        v-if="result"
        v-model:paginationInfo="paginationInfo"
        :loading="loading"
        :max-page="Math.round(result.Entities.count / 20)"
      />
    </div>
    <ListContainer>
      <div v-if="loading">
        <ListItem
          v-for="n in 20"
          :key="n"
          title="loading"
          :loading="true"
          :meta="[
            { key: '/', value: '/' },
            { key: '/', value: '/' },
            { key: '/', value: '/' },
            { key: '/', value: '/' }
          ]"
        >
          <template #actions>
            <BaseButton
              :loading="true"
              class="ml-2"
              :icon="IncludedIcons.Eye"
            />
          </template>
        </ListItem>
      </div>
      <div v-else-if="result && result.Entities.results">
        <ListItem
          v-for="entity in result.Entities.results"
          :key="entity.id"
          :meta="entity.metadata"
          @click="
            router.push({ name: 'SingleEntity', params: { id: entity.id } })
          "
        >
          <template #actions>
            <BaseButton
              :loading="loading"
              class="ml-2"
              :icon="IncludedIcons.Eye"
              @click="
                router.push({ name: 'SingleEntity', params: { id: entity.id } })
              "
            />
          </template>
        </ListItem>
      </div>
    </ListContainer>
  </div>
</template>

<script lang="ts">
  import { defineComponent, inject, ref, watch, onMounted } from 'vue'
  import { useQuery } from '@vue/apollo-composable'
  import ListContainer from '../components/ListContainer.vue'
  import ListItem from '../components/ListItem.vue'
  import BaseButton from '../components/base/BaseButton.vue'
  import Pagination from '../components/base/Pagination.vue'
  import { IncludedIcons } from '../enums'
  import { useRouter } from 'vue-router'
  import {
    getEnteties,
    getEntitiesQueryType,
    getEntitiesQueryVariableType
  } from '../queries/entities'
  import { setRoutePageTitleType, updatePageTitleType } from '@/App.vue'

  export default defineComponent({
    name: 'Home',
    components: {
      ListContainer,
      ListItem,
      Pagination,
      BaseButton
    },
    setup: () => {
      const router = useRouter()

      const setRoutePageTitle: setRoutePageTitleType | undefined = inject(
        'setRoutePageTitle'
      )

      const paginationInfo = ref<getEntitiesQueryVariableType>({
        skip: 0,
        limit: 20
      })

      const { result, loading, fetchMore } = useQuery<
        getEntitiesQueryType | undefined,
        getEntitiesQueryVariableType
      >(getEnteties, paginationInfo)

      watch(paginationInfo, value => {
        fetchMore({
          variables: value,
          updateQuery: (previousResult, { fetchMoreResult }) => {
            if (fetchMoreResult !== undefined) {
              return fetchMoreResult
            }
          }
        })
      })

      onMounted(() => {
        setRoutePageTitle && setRoutePageTitle()
      })

      return {
        result,
        loading,
        router,
        IncludedIcons,
        paginationInfo
      }
    }
  })
</script>
