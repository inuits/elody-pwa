<template>
  <div class="p-6">
    <div class="flex flex-row flex-wrap w-full gap-y-4">
      <InputField
        v-model="queryVariables.searchQuery"
        :debounce="true"
        :placeholder="'Search Asset Library...'"
      />
      <div class="ml-12 flex flex-row">
        <Dropdown
          v-model:selected="queryVariables.pagination.limit"
          :options="[5, 10, 15, 20]"
        />
      </div>
    </div>
    <div class="flex justify-end py-4">
      <Pagination
        v-if="result"
        v-model:paginationInfo="queryVariables.pagination"
        :loading="loading"
        :max-page="
          Math.round(result.Entities.count / queryVariables.pagination.limit)
        "
      />
    </div>
    <ListContainer>
      <div v-if="loading">
        <ListItem
          v-for="n in queryVariables.pagination.limit"
          :key="n"
          title="loading"
          :loading="true"
          :meta="[
            { key: '/', value: '/' },
            { key: '/', value: '/' },
            { key: '/', value: '/' },
            { key: '/', value: '/' },
          ]"
        >
          <template #actions>
            <BaseButton :loading="true" class="ml-2" :icon="Unicons.Eye.name" />
          </template>
        </ListItem>
      </div>
      <div v-else-if="result?.Entities.results">
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
              :icon="Unicons.Eye.name"
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
  import { defineComponent, watch, reactive } from 'vue';
  import { useQuery } from '@vue/apollo-composable';
  import ListContainer from '@/components/ListContainer.vue';
  import ListItem from '@/components/ListItem.vue';
  import BaseButton from '@/components/base/BaseButton.vue';
  import InputField from '@/components/base/InputField.vue';
  import Dropdown from '@/components/base/Dropdown.vue';
  import Pagination, {
    Pagination as PaginationType,
  } from '@/components/base/Pagination.vue';
  import { Unicons } from '@/types';
  import { useRouter } from 'vue-router';
  import { GetEntitiesDocument } from '@/queries';

  type QueryVariables = {
    pagination: PaginationType;
    searchQuery: string;
  };

  export default defineComponent({
    name: 'Home',
    components: {
      ListContainer,
      ListItem,
      Pagination,
      BaseButton,
      InputField,
      Dropdown,
    },
    setup: () => {
      const router = useRouter();
      const defaultPagination = reactive<PaginationType>({
        skip: 0,
        limit: 20,
      });
      const queryVariables = reactive<QueryVariables>({
        pagination: defaultPagination,
        searchQuery: 'asset',
      });

      const { result, loading, fetchMore } = useQuery(GetEntitiesDocument, {
        limit: queryVariables.pagination.limit,
        skip: queryVariables.pagination.skip,
        searchQuery: queryVariables.searchQuery,
      });

      watch(queryVariables, (value: QueryVariables) => {
        fetchMore({
          variables: {
            limit: value.pagination.limit,
            skip: value.pagination.skip,
            searchQuery: value.searchQuery,
          },
          updateQuery: (prev, { fetchMoreResult: res }) => res || prev,
        });
      });

      return {
        result,
        loading,
        router,
        Unicons,
        queryVariables,
      };
    },
  });
</script>
