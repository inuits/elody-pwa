<template>
  <div class="lg:flex">
    <FilterSideBar v-show="showDrawer" />
    <div class="p-6 w-full">
      <div class="flex flex-row flex-wrap gap-y-4">
        <div>
          <button
            class="
              rounded-md
              bg-neutral-60
              text-white
              font-medium
              text-xs
              leading-tight
              uppercase
              hover:bg-neutral-40
              focus:bg-neutral-0 focus:outline-none focus:ring-10
              active:bg-neutral-400 active:text-blue-300
              transition
              duration-150
              ease-in-out
              m-0
            "
            @click="toggleDrawer()"
          >
            <unicon :name="Unicons.Filter.name"></unicon>
          </button>
          <button
            class="
              rounded-md
              bg-neutral-60
              text-white
              font-medium
              text-xs
              leading-tight
              uppercase
              hover:bg-neutral-40
              focus:bg-neutral-0 focus:outline-none focus:ring-10
              active:bg-neutral-400 active:text-blue-300
              transition
              duration-150
              ease-in-out
              m-0
            "
            @click="closeDrawer()"
          >
            <unicon :name="Unicons.SearchGlass.name"></unicon>
          </button>
        </div>
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
            :meta="entity.metadata"
            :media="entity.primary_mediafile"
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
        </div>
      </ListContainer>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, watch, reactive, ref, computed } from 'vue';
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
  import useRouteHelpers from '@/composables/useRouteHelpers';
  import FilterSideBar from '@/components/FilterSideBar.vue';

  type QueryVariables = {
    pagination: PaginationInfo;
    searchQuery: string;
    sort: string;
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

      watch(searchQuery, (value: string) => {
        queryVariables.pagination.skip = 1;
        getData();
      });

      watch(queryVariables, () => {
        routeHelper.updatePaginationInfoQueryParams(queryVariables.pagination);
        getData();
      });

      const addSelection = (id: string) => {
        emit('addSelection', id);
      };

      //let showDrawer: boolean = false;
      const showDrawer = ref(false);

      const toggleDrawer = () => {
        showDrawer.value = true;
        console.log(showDrawer);
      };

      const closeDrawer = () => {
        showDrawer.value = false;
        console.log(showDrawer);
      };

      return {
        result,
        loading,
        router,
        Unicons,
        queryVariables,
        searchQuery,
        addSelection,
        paginationLimits,
        FilterSideBar,
        toggleDrawer,
        closeDrawer,
        showDrawer,
      };
    },
  });
</script>
