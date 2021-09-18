<template>
  <div class="p-6">
    <div class="flex flex-row flex-wrap gap-y-4">
      <InputField
        v-model="searchQuery"
        :debounce="true"
        placeholder="Search Asset Library..."
        label="Search"
      />
      <div class="pl-4 my-2 flex flex-row justify-left">
        <Dropdown
          v-if="result?.Entities.count > 0"
          v-model="queryVariables.pagination.limit"
          :options="[5, 10, 15, 20]"
          label="Items"
        />
        <Dropdown
          v-if="result?.Entities.count > 1 && searchQuery != ''"
          v-model="queryVariables.sort"
          :options="['Title', 'Collection']"
          label="Sort"
        />
      </div>
      <div class="flex-grow"></div>
      <Pagination
        v-if="result?.Entities.count > 0"
        v-model:skip="queryVariables.pagination.skip"
        :limit="queryVariables.pagination.limit"
        :loading="loading"
        :total-items="result?.Entities.count"
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
          :media="entity.mediafiles"
          :thumb-icon="Unicons.NoImage.name"
          @click="router.push({ name: 'SingleEntity', params: { id: entity.id } })"
        >
          <template #actions>
            <BaseButton
              :loading="loading"
              class="ml-2"
              :icon="Unicons.Eye.name"
              @click="router.push({ name: 'SingleEntity', params: { id: entity.id } })"
            />
          </template>
        </ListItem>
      </div>
    </ListContainer>
  </div>
</template>

<script lang="ts">
  import { defineComponent, watch, reactive, ref } from 'vue';
  import { useQuery } from '@vue/apollo-composable';
  import ListContainer from '@/components/ListContainer.vue';
  import ListItem from '@/components/ListItem.vue';
  import BaseButton from '@/components/base/BaseButton.vue';
  import InputField from '@/components/base/InputField.vue';
  import Dropdown from '@/components/base/Dropdown.vue';
  import Pagination, { PaginationInfo } from '@/components/base/Pagination.vue';
  import { Unicons } from '@/types';
  import { useRouter } from 'vue-router';
  import { GetEntitiesDocument } from '@/queries';
  import { store } from '@/store';
  import { useAuth } from 'session-vue-3-oidc-library';

  type QueryVariables = {
    pagination: PaginationInfo;
    searchQuery: string;
    sort: string;
  };

  export default defineComponent({
    name: 'Home',
    store: store,
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
      const searchQuery = ref<string>('');
      const auth = useAuth();
      console.log(auth);

      const queryVariables = reactive<QueryVariables>({
        pagination: store.state.pagination,
        searchQuery: searchQuery.value,
        sort: 'Title',
      });

      const { result, loading, fetchMore } = useQuery(GetEntitiesDocument, {
        limit: queryVariables.pagination.limit,
        skip: queryVariables.pagination.skip,
        searchValue: {
          value: queryVariables.searchQuery,
          isAsc: false,
          key: queryVariables.sort.toLowerCase(),
        },
      });

      const getData = () => {
        store.commit('updatePagination', queryVariables.pagination);
        fetchMore({
          variables: {
            limit: Number(queryVariables.pagination.limit),
            skip: Number(queryVariables.pagination.skip),
            searchValue: {
              value: searchQuery.value,
              isAsc: false,
              key: queryVariables.sort.toLowerCase(),
            },
          },
          updateQuery: (prev, { fetchMoreResult: res }) => res || prev,
        });
      };

      watch(searchQuery, (value: string) => {
        queryVariables.pagination.limit = store.state.pagination.limit;
        queryVariables.pagination.skip = 0;
        getData();
      });

      watch(queryVariables, (value: any) => {
        getData();
      });

      return {
        result,
        loading,
        router,
        Unicons,
        queryVariables,
        searchQuery,
      };
    },
  });
</script>
