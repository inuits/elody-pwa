<template>
  <div
    v-if="
      isEditToggleVisible === 'edit' || isEditToggleVisible === 'edit-delete'
    "
    class="mx-4"
  >
    <icon-toggle
      v-show="isSingle"
      v-model:checked="toggleBoolean"
      :icon-on="Unicons.Edit.name"
      :icon-off="Unicons.Eye.name"
    />
  </div>
  <BaseButton
    v-if="editMode === 'edit' && isEditToggleVisible === 'edit-delete'"
    :label="$t('buttons.delete')"
    bg-color="red-default"
    bg-hover-color="red-dark"
    txt-color="neutral-0"
    @click="showConfirmation()"
  />
  <ConfirmationModal
    v-show="confirmState === 'show'"
    v-model:confirmState="confirmState"
    :function="deleteAsset"
  />
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import IconToggle from "./toggles/IconToggle.vue";
import useRouteHelpers from "../composables/useRouteHelpers";
import { Unicons } from "../types";
import BaseButton from "./base/BaseButton.vue";
import { useRoute, useRouter } from "vue-router";
import { asString } from "../helpers";
import { useMutation } from "@vue/apollo-composable";
import { DeleteDataDocument, Collection } from "../generated-types/queries";
import type { DeleteDataMutation } from "../generated-types/queries";
import ConfirmationModal from "./base/ConfirmationModal.vue";
import useEditMode from "../composables/useEdit";
import { usePageInfo } from "../composables/usePageInfo";

export default defineComponent({
  name: "EditToggle",
  components: { IconToggle, BaseButton, ConfirmationModal },
  setup() {
    const toggleBoolean = ref<boolean>(false);
    const {
      editMode,
      disableEditMode,
      setEditMode,
      isEdit,
      hideEditToggle,
      isEditToggleVisible,
    } = useEditMode();
    const { isSingle } = useRouteHelpers();
    const { pageInfo } = usePageInfo();

    watch(toggleBoolean, (value: boolean) => {
      if (value) {
        setEditMode();
      } else {
        disableEditMode();
      }
    });

    watch(isEdit, (value: boolean) => {
      if (value) {
        toggleBoolean.value = true;
      } else {
        toggleBoolean.value = false;
      }
    });

    watch(isSingle, (value: boolean) => {
      if (value === false) {
        hideEditToggle();
      }
    });

    const route = useRoute();
    const router = useRouter();
    const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);
    const deleteAsset = async () => {
      const id = asString(route.params["id"]);
      const collection: Collection = pageInfo.value.routeType as Collection;
      await mutate({ id, path: collection });
      disableEditMode();
      router.push({ name: pageInfo.value.parentRouteName });
    };
    const confirmState = ref<"hidden" | "show">("hidden");

    const showConfirmation = () => {
      confirmState.value = confirmState.value === "show" ? "hidden" : "show";
    };

    return {
      isEdit,
      Unicons,
      isSingle,
      editMode,
      deleteAsset,
      confirmState,
      toggleBoolean,
      showConfirmation,
      isEditToggleVisible,
    };
  },
});
</script>
