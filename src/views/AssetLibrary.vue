<template>
  <div class="p-6">
    <div class="flex flex-row flex-wrap gap-y-4">
      <InputField
        v-model="searchQuery"
        :icon="Unicons.SearchGlass.name"
        :debounce="true"
        placeholder="Search Asset Library..."
        label="Search"
      />
      <div class="my-2 flex flex-row justify-left">
        <Dropdown
          v-model="query.limit"
          :options="[5, 10, 15, 20]"
          label="Items"
        />
        <Dropdown
          v-model="query.sort"
          :options="['Recently updated']"
          label="Sort"
        />
      </div>
      <div class="flex-grow"></div>
      <Pagination
        v-if="result?.Entities?.count > 0"
        v-model:skip="query.skip"
        :limit="query.limit"
        :loading="loading"
        :total-items="result.Entities.count"
      />
    </div>
    <ListContainer>
      <div v-if="loading">
        <ListItem
          v-for="n in query.limit"
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
  import { defineComponent, watch, reactive, ref } from 'vue';
  import { useQuery } from '@vue/apollo-composable';
  import ListContainer from '@/components/ListContainer.vue';
  import ListItem from '@/components/ListItem.vue';
  import BaseButton from '@/components/base/BaseButton.vue';
  import InputField from '@/components/base/InputField.vue';
  import Dropdown from '@/components/base/Dropdown.vue';
  import Pagination from '@/components/base/Pagination.vue';
  import { Unicons } from '@/types';
  import { useRouter } from 'vue-router';
  import { GetEntitiesDocument, GetEntitiesQueryVariables } from '@/queries';

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
      const searchQuery = ref('');
      const query = reactive({
        skip: 0,
        limit: 20,
      });

      const queryVariables = reactive({
        limit: query.limit,
        skip: query.skip,
        searchQuery: searchQuery,
      });

      const { result, loading, fetchMore } = useQuery(
        GetEntitiesDocument,
        queryVariables,
      );

      watch(searchQuery, (value: string) => {
        query.skip = 0;
      });

      watch(queryVariables, (value: GetEntitiesQueryVariables) => {
        fetchMore({
          variables: value,
          updateQuery: (prev, { fetchMoreResult: res }) => res || prev,
        });
      });

      return {
        result,
        loading,
        router,
        Unicons,
        query,
        searchQuery,
      };
    },
  });
</script>
