<template>
  <div v-if="SearchSavedSearchesModalState.state === 'show'">
    <BaseModal
      :modal-state="SearchSavedSearchesModalState.state"
      modal-position="left"
      modal-width-style="w-8/12"
      @hide-modal="closeSearchSavedSearchesModal"
    >
      <div class="bg-neutral-20 w-full h-full flex flex-col overflow-auto">
        <SavedSearchesLibrary />
      </div>
    </BaseModal>
  </div>
</template>
<script lang="ts">
import BaseModal from "./base/BaseModal.vue";
import { defineComponent } from "vue";
import SavedSearchesLibrary from "@/components/SavedSearchesLibrary.vue";
import { useSavedSearchHelper } from "../composables/useSavedSearchHelper";

export default defineComponent({
  name: "PickEntityModal",
  components: {
    BaseModal,
    SavedSearchesLibrary,
  },
  setup() {
    const { closeSearchSavedSearchesModal, SearchSavedSearchesModalState } =
      useSavedSearchHelper();

    return {
      SearchSavedSearchesModalState,
      closeSearchSavedSearchesModal,
    };
  },
});
</script>
