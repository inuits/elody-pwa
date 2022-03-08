<template>
  <div class="lg:flex">
    <FilterSideBar
      v-show="!showDrawer"
      v-model:activeFilters="queryVariables.advancedSearchValue"
    />
    <div class="p-6 w-full">
      <div class="flex flex-row flex-wrap gap-y-4">
        <div class="mt-8 mr-4">
          <IconToggle
            v-model:checked="showDrawer"
            :icon-on="Unicons.SearchGlass.name"
            :icon-off="Unicons.Filter.name"
          />
        </div>
        <InputField
          v-model="queryVariables.searchValue.value"
          :debounce="true"
          placeholder="Search Asset Library..."
          label="Search"
          :is-disabled="loading"
          :bg-color="'neutral-20'"
          :disabled="!showDrawer"
        />
        <div class="pl-4 my-2 flex flex-row justify-left">
          <Dropdown
            v-if="result?.Entities.count > 0"
            v-model="queryVariables.limit"
            :options="paginationLimits"
            label="Items"
          />
          <Dropdown
            v-if="result?.Entities.count > 1 && queryVariables.searchValue.value != ''"
            v-model="queryVariables.sort"
            :options="['Title', 'object_number']"
            label="Sort"
          />
        </div>
        <div class="flex-grow"></div>
        <Pagination
          v-if="result?.Entities.count > 0"
          v-model:skip="queryVariables.skip"
          v-model:limit="queryVariables.limit"
          :loading="loading"
          :total-items="result?.Entities.count"
        />
      </div>
      <ListContainer>
        <div v-if="loading">
          <ListItem
            v-for="n in queryVariables.limit"
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
  import Pagination, { paginationLimits } from '@/components/base/Pagination.vue';
  import { Unicons } from '@/types';
  import { useRouter } from 'vue-router';
  import {
    GetEntitiesDocument,
    SearchInputType,
    GetEntitiesQueryVariables,
  } from '@/queries';
  import useRouteHelpers from '@/composables/useRouteHelpers';
  import FilterSideBar from '@/components/FilterSideBar.vue';
  import IconToggle from '@/components/base/IconToggle.vue';
  import { useI18n } from 'vue-i18n';

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
      const routeHelper = useRouteHelpers();
      const paginationInfo = reactive({
        limit: 20,
        skip: 1,
      });
      routeHelper.getPaginationInfoFromUrl(paginationInfo);
      const { t } = useI18n();

      const queryVariables = reactive<GetEntitiesQueryVariables>({
        limit: paginationInfo.limit,
        skip: paginationInfo.skip - 1,
        searchValue: {
          value: '',
          isAsc: false,
          key: 'title',
        },
        advancedSearchValue: {},
        searchInputType: SearchInputType.SimpleInputtype,
      });

      const { result, loading } = useQuery(GetEntitiesDocument, queryVariables, {
        notifyOnNetworkStatusChange: true,
      });

      const addSelection = (id: string) => {
        emit('addSelection', id);
      };

      const showDrawer = ref(true);

      return {
        t,
        loading,
        router,
        Unicons,
        queryVariables,
        addSelection,
        paginationLimits,
        showDrawer,
        result,
      };
    },
  });
</script>
