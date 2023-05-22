<template>
  <div>
    <SearchBar v-model="searchText" @input="handleSearchInput" />
    <BaseLibrary 
      :has-simple-search="false" 
      :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
      :list-item-route-name="'SingleEntity'"
      :enable-selection="enableSelection" 
      :accepted-entity-types="acceptedEntityTypes"
      :is-hide-filters="true"
      bulk-operations-context="entitiesPage" 
      @add-selection="addSelection" />
  </div>
</template>

<script lang="ts">
import BaseLibrary from "@/components/base/BaseLibrary.vue";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import { SearchInputType, type Maybe } from "@/generated-types/queries";
import SearchBar from "./SearchBar.vue";

export default defineComponent({
  name: "AssetLibrary",
  components: { BaseLibrary, SearchBar },
  props: {
    enableSelection: {
      type: Boolean,
      default: false,
    },
    acceptedEntityTypes: {
      type: Array as PropType<Maybe<string>[]>,
      default: () => ["Asset"],
      required: false,
    },
  },
  emits: ["addSelection"],
  data() {
    return {
      searchText: '',
    };
  },
  setup: (props, { emit }) => {
    const addSelection = (id: string) => {
      emit("addSelection", id, props.searchText);
    };

    const handleSearchInput = (value: string) => {
      props.searchText = value;
    };

    return {
      SearchInputType,
      addSelection,
      handleSearchInput,
    };
  },
});
</script>
