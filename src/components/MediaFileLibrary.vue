<template>
  <div class="lg:flex">
    <FilterSideBar
      v-show="!showDrawer"
      v-model:activeFilters="queryVariables.advancedSearchValue"
      :accepted-entity-types="acceptedEntityTypes ? acceptedEntityTypes : []"
    />
    <div class="p-6 w-full">
      <div class="flex flex-row flex-wrap gap-y-4">
        <div v-show="acceptedEntityTypes.length === 0" class="mt-8 mr-4">
          <IconToggle
            v-model:checked="showDrawer"
            :icon-on="Unicons.SearchGlass.name"
            :icon-off="Unicons.Filter.name"
          />
        </div>
        <div
          v-show="acceptedEntityTypes.length === 0"
          class="pl-4 my-2 flex flex-row justify-left"
        >
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
            :media="entity.media ? entity.media.primaryMediafile : null"
            :thumb-icon="Unicons.NoImage.name"
            @click="
              !enableSelection &&
                router.push({ name: 'SingleEntity', params: { id: entity.id } })
            "
          >
            <template #actions>
              {{entity}}
              <BaseButton
                v-if="enableSelection"
                :loading="loading"
                class="ml-2"
                :icon="Unicons.PlusCircle.name"
                @click="addSelection(entity)"
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
  import Pagination, { paginationLimits } from '@/components/base/Pagination.vue';
  import { defineComponent, watch, reactive, ref, PropType } from 'vue';
  import ListContainer from '@/components/ListContainer.vue';
  import BaseButton from '@/components/base/BaseButton.vue';
  import Dropdown from '@/components/base/Dropdown.vue';
  import { useQuery } from '@vue/apollo-composable';
  import ListItem from '@/components/ListItem.vue';
  import { useRouter } from 'vue-router';
  import { Unicons } from '@/types';
  import {
    GetEntitiesDocument,
    SearchInputType,
    GetEntitiesQueryVariables,
  } from '@/queries';
  import FilterSideBar from '@/components/FilterSideBar.vue';
  import IconToggle from '@/components/base/IconToggle.vue';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'MediaFileLibrary',
    components: {
      ListContainer,
      ListItem,
      Pagination,
      BaseButton,
      Dropdown,
      FilterSideBar,
      IconToggle,
    },
    props: {
      enableSelection: {
        type: Boolean,
        default: false,
      },
      acceptedEntityTypes: {
        type: Array as PropType<string[]>,
        default: () => [],
        required: false,
      },
    },
    emits: ['addSelection'],
    setup: (props, { emit }) => {
      const { t } = useI18n();
      const router = useRouter();
      const paginationInfo = reactive({
        limit: 20,
        skip: 1,
      });

      const showDrawer = ref(props.acceptedEntityTypes.length === 0 ? true : false);

      const queryVariables = reactive<GetEntitiesQueryVariables>({
        limit: paginationInfo.limit,
        skip: paginationInfo.skip,
        searchValue: {
          value: '',
          isAsc: false,
          key: 'title',
        },
        advancedSearchValue: [],
        searchInputType: showDrawer.value
          ? SearchInputType.AdvancedInputMediaFilesType
          : SearchInputType.AdvancedInputMediaFilesType,
      });

      watch(showDrawer, () => {
        queryVariables.searchInputType = showDrawer.value
          ? SearchInputType.AdvancedInputMediaFilesType
          : SearchInputType.AdvancedInputMediaFilesType;
      });

      const { result, loading } = useQuery(GetEntitiesDocument, queryVariables, {
        notifyOnNetworkStatusChange: true,
      });

      const addSelection = (id: string) => {
        emit('addSelection', id);
      };

      return {
        paginationLimits,
        queryVariables,
        addSelection,
        showDrawer,
        loading,
        Unicons,
        router,
        result,
        t,
      };
    },
  });
</script>
