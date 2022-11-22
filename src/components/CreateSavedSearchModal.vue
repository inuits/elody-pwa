<template>
  <base-modal
    :scroll="true"
    :modal-state="createModalState.state"
    @hide-modal="closeCreateModal"
  >
    <div class="bg-neutral-0 w-full">
      <div class="p-6">
        <h1>Search title</h1>

        <input
          v-model="searchTitle"
          type="text"
          class="bg-neutral-0 py-2 pl-4 w-full rounded min-w-48 text-neutral-700 text-sm focus:outline-none"
        />

        <BaseButton
          :class="
            searchTitle.length > 0 ? 'mt-2 opacity-100' : 'mt-2 opacity-40'
          "
          style="margin-left: -1px"
          :label="
            createModalState.action === 'create' ? $t('form.create') : 'Edit'
          "
          @click="create"
        />
      </div>
    </div>
  </base-modal>
</template>
<script lang="ts">
import BaseModal from "@/components/base/BaseModal.vue";
import { Entitytyping } from "@/queries";
import { defineComponent, ref, PropType, watch } from "vue";
import BaseButton from "./base/BaseButton.vue";
import { useSavedSearchHelper } from "../composables/useSavedSearchHelper";
import { FilterInList } from "@/composables/useFilterHelper";
import { useMutation } from "@vue/apollo-composable";
import {
  CreateSavedSearchDocument,
  PatchSavedSearchTitleDocument,
} from "@/queries";
import type {
  CreateSavedSearchMutation,
  PatchSavedSearchTitleMutation,
} from "@/queries";
export default defineComponent({
  name: "CreateEntity",
  components: { BaseButton, BaseModal },
  props: {
    initialFilters: {
      type: Array as PropType<Array<FilterInList>>,
    },
  },
  emits: ["refetchSavedSearches"],
  setup(props, { emit }) {
    const { closeCreateModal, createModalState, pickedSavedSearch } =
      useSavedSearchHelper();
    const searchTitle = ref<string>("");
    const savedSearch = ref<any>();

    watch(
      () => createModalState.value.action,
      () => {
        if (createModalState.value.action === "edit") {
          searchTitle.value = pickedSavedSearch.value.metadata[0].value;
        } else {
          searchTitle.value = "";
        }
      }
    );

    const initSavedSearch = () => {
      savedSearch.value = {
        definition: [],
        metadata: [
          {
            key: "title",
            value: "",
            lang: "nl",
          },
        ],
        private: true,
        type: "saved_search",
      };
    };

    initSavedSearch();

    const { mutate, onDone } = useMutation<CreateSavedSearchMutation>(
      CreateSavedSearchDocument
    );

    const { mutate: mutatePatchTitle, onDone: onDonePatchTitle } =
      useMutation<PatchSavedSearchTitleMutation>(PatchSavedSearchTitleDocument);

    const create = () => {
      if (createModalState.value.action === "create") {
        initSavedSearch();
        savedSearch.value.metadata[0].value = searchTitle.value;
        props.initialFilters.forEach((filter: FilterInList) => {
          if (filter.isActive) {
            savedSearch.value.definition.push(filter.input);
          }
        });
        if (searchTitle.value.length > 0) {
          mutate({ savedSearchInput: savedSearch.value });
          onDone((res: any) => {
            pickedSavedSearch.value = res.data.createSavedSearch;
            emit("refetchSavedSearches", true);
            searchTitle.value = "";
            closeCreateModal();
          });
        }
      }

      if (
        createModalState.value.action === "edit" &&
        searchTitle.value.length > 0
      ) {
        mutatePatchTitle({
          uuid: pickedSavedSearch.value._key,
          title: searchTitle.value,
        });
        onDonePatchTitle((res) => {
          pickedSavedSearch.value.metadata[0].value =
            res.data.patchSavedSearchTitle.metadata[0].value;
          emit("refetchSavedSearches", true);
          searchTitle.value = "";
          closeCreateModal();
        });
      }
    };

    return {
      pickedSavedSearch,
      create,
      searchTitle,
      Entitytyping,
      closeCreateModal,
      createModalState,
    };
  },
});
</script>
