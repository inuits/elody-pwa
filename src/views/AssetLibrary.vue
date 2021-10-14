<template>
  <div class="p-6">
    <div class="flex flex-row flex-wrap gap-y-4">
      <InputField
        v-model="searchQuery"
        :debounce="true"
        placeholder="Search Asset Library..."
        label="Search"
        :bg-color="'neutral-20'"
      />
      <div class="pl-4 my-2 flex flex-row justify-left">
        <Dropdown
          v-if="result?.Entities.count > 0"
          v-model="queryVariables.pagination.limit"
          :options="paginationLimits"
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
        v-model:limit="queryVariables.pagination.limit"
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
  import Pagination, {
    PaginationInfo,
    paginationLimits,
  } from '@/components/base/Pagination.vue';
  import { Unicons } from '@/types';
  import { useRouter } from 'vue-router';
  import { GetEntitiesDocument } from '@/queries';
  import { useAuth } from 'session-vue-3-oidc-library';
  import useRouteHelpers from '@/composables/useRouteHelpers';

  type QueryVariables = {
    pagination: PaginationInfo;
    searchQuery: string;
    sort: string;
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
      const searchQuery = ref<string>('');
      const auth = useAuth();
      const routeHelper = useRouteHelpers();
      const paginationInfo = reactive({
        limit: 20,
        skip: 1,
      });
      routeHelper.getPaginationInfoFromUrl(paginationInfo);

      const queryVariables = reactive<QueryVariables>({
        pagination: paginationInfo,
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
          relation_filter: [],
        },
      });

      const getData = () => {
        fetchMore({
          variables: {
            limit: Number(queryVariables.pagination.limit),
            skip:
              Number(queryVariables.pagination.skip) *
              Number(queryVariables.pagination.limit),
            searchValue: {
              value: searchQuery.value,
              isAsc: false,
              key: queryVariables.sort.toLowerCase(),
              relation_filter: [],
            },
          },
          updateQuery: (prev, { fetchMoreResult: res }) => res || prev,
        });
      };

      watch(searchQuery, (value: string) => {
        queryVariables.pagination.skip = 1;
        getData();
      });

      watch(queryVariables, () => {
        getData();
      });

      return {
        result,
        loading,
        router,
        Unicons,
        queryVariables,
        searchQuery,
        paginationLimits,
      };
    },
  });
</script>
