<template>
  <div class="lg:flex">
    <FilterSideBar v-show="showDrawer" v-model:activeFilters="activeFilters" />
    <div class="p-6 w-full">
      <div class="flex flex-row flex-wrap gap-y-4">
        <div class="mt-8 mr-4">
          <IconToggle
            v-model:checked="showDrawer"
            :icon-on="Unicons.Filter.name"
            :icon-off="Unicons.SearchGlass.name"
          />
        </div>
        <InputField
          v-model="searchQuery"
          :debounce="true"
          placeholder="Search Asset Library..."
          label="Search"
          :is-disabled="loading"
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
            :options="['Title', 'object_number']"
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
            :meta="entity.teaserMetadata"
            :media="entity.media.primaryMediafile"
            :thumb-icon="Unicons.NoImage.name"
            @click="
              !enableSelection &&
                router.push({ name: 'SingleEntity', params: { id: entity.id } })
            "
          >
            <template #actions>
              <BaseButton
                v-if="enableSelection"
                :loading="loading"
                class="ml-2"
                :icon="Unicons.PlusCircle.name"
                @click="addSelection(entity.id)"
              />
              <BaseButton
                v-else
                :loading="loading"
                class="ml-2"
                :icon="Unicons.Eye.name"
                @click="router.push({ name: 'SingleEntity', params: { id: entity.id } })"
              />
            </template>
          </ListItem>
          <div v-if="result?.Entities.results.length === 0" class="p-4">
            {{ t('search.noresult') }}
          </div>
        </div>
      </ListContainer>
    </div>
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
  import {
    GetEntitiesDocument,
    GetAdvancedEntitiesDocument,
    AdvancedSearchInput,
    AdvancedInputType,
    GetJobDocument,
  } from '@/queries';
  import useRouteHelpers from '@/composables/useRouteHelpers';
  import FilterSideBar from '@/components/FilterSideBar.vue';
  import IconToggle from '@/components/base/IconToggle.vue';
  import { useI18n } from 'vue-i18n';

  type QueryVariables = {
    pagination: PaginationInfo;
    searchQuery: string;
    sort: string;
  };

  type advancedQueryVariables = {
    pagination: PaginationInfo;
    advancedSearchQuery: AdvancedInputType[];
    sort: string;
  };
  type filterObject = {
    key: string;
    value: object | string | string[] | undefined;
  };
  export default defineComponent({
    name: 'AssetLibrary',
    components: {
      ListContainer,
      ListItem,
      Pagination,
      BaseButton,
      InputField,
      Dropdown,
      FilterSideBar,
      IconToggle,
    },
    props: {
      enableSelection: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['addSelection'],
    setup: (props, { emit }) => {
      const router = useRouter();
      const searchQuery = ref<string>('');
      const advancedSearchQuery = ref<AdvancedInputType[]>([]);
      const activeFilters = ref<AdvancedInputType[]>([]);
      const routeHelper = useRouteHelpers();
      const paginationInfo = reactive({
        limit: 20,
        skip: 1,
      });
      routeHelper.getPaginationInfoFromUrl(paginationInfo);
      const { t } = useI18n();

      watch(activeFilters, () => {
        console.log('assetlibrary');
        console.log(activeFilters.value);
        console.log(JSON.stringify(activeFilters.value));
      });

      const queryVariables = reactive<QueryVariables>({
        pagination: paginationInfo,
        searchQuery: searchQuery.value,
        sort: 'Title',
      });

      //advanced queryvariables
      const advancedQueryvariables = reactive<advancedQueryVariables>({
        pagination: paginationInfo,
        advancedSearchQuery: advancedSearchQuery.value,
        sort: 'Title',
      });

      //gewone zoek query
      const { result, loading, fetchMore } = useQuery(
        GetEntitiesDocument,
        {
          limit: queryVariables.pagination.limit,
          skip: queryVariables.pagination.skip - 1,
          searchValue: {
            value: queryVariables.searchQuery,
            isAsc: false,
            key: queryVariables.sort.toLowerCase(),
            relation_filter: [],
          },
        },
        {
          notifyOnNetworkStatusChange: true,
        },
      );

      // advanced query
      const { result: advancedFilterResult, fetchMore: appliedFilters } = useQuery(
        GetAdvancedEntitiesDocument,
        {
          limit: advancedQueryvariables.pagination.limit,
          skip: advancedQueryvariables.pagination.skip,
          advancedSearchValue: {
            value: advancedQueryvariables.advancedSearchQuery,
            isAsc: false,
            key: advancedQueryvariables.sort.toLowerCase(),
            relation_filter: [],
          },
        },
        {
          notifyOnNetworkStatusChange: true,
        },
      );

      // gewone data
      const getData = () => {
        fetchMore({
          variables: {
            limit: Number(queryVariables.pagination.limit),
            skip:
              Number(queryVariables.pagination.skip - 1) *
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

      //advanced data
      const getAdvancedData = () => {
        appliedFilters({
          variables: {
            limit: Number(advancedQueryvariables.pagination.limit),
            skip:
              Number(advancedQueryvariables.pagination.skip - 1) *
              Number(advancedQueryvariables.pagination.limit),
            advancedSearchValue: {
              value: advancedSearchQuery.value,
              isAsc: false,
              key: advancedQueryvariables.sort.toLowerCase(),
              relation_filter: [],
            },
          },
          updateQuery: (prev, { fetchMoreResult: res }) => res || prev,
        });
      };

      // gewone search query
      watch(searchQuery, (value: string) => {
        queryVariables.pagination.skip = 1;
        getData();
      });

      watch(queryVariables, () => {
        routeHelper.updatePaginationInfoQueryParams(queryVariables.pagination);
        getData();
      });

      //advanced search query
      watch(advancedSearchQuery, (value: AdvancedInputType[]) => {
        advancedQueryvariables.pagination.skip = 1;
        getAdvancedData();
      });

      watch(advancedQueryvariables, () => {
        routeHelper.updatePaginationInfoQueryParams(advancedQueryvariables.pagination);
        getAdvancedData();
      });

      const addSelection = (id: string) => {
        emit('addSelection', id);
      };

      const showDrawer = ref(false);

      return {
        t,
        advancedFilterResult,
        loading,
        router,
        Unicons,
        queryVariables,
        searchQuery,
        advancedSearchQuery,
        addSelection,
        paginationLimits,
        showDrawer,
        activeFilters,
        result,
      };
    },
  });
</script>
