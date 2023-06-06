<template>
  <div>
    <div v-if="isEdit" class="flex justify-center relative w-full p-5 z-20">
      <div
        class="flex justify-between w-full rounded-full gap-x-2 bg-neutral-white px-4 py-2"
      >
        <div class="flex">
          <BaseButton
            :icon="Unicons.Save.name"
            icon-color="neutral-white"
            :bg-color="'accent-normal'"
            :txt-color="'neutral-white'"
            :label="$t('buttons.save')"
            @click="save()"
          />
          <BaseButton
            :label="$t('buttons.discard')"
            bg-color="'neutral-0'"
            :border-color="'red-default'"
            :txt-color="'body'"
            @click="discard"
          />
        </div>
        <BaseButton
          :icon="Unicons.Trash.name"
          icon-color="text-subtitle"
          :label="$t('buttons.delete')"
          bg-color="red-default"
          border-color="red-default"
          :txt-color="'neutral-white'"
          @click="showConfirmation"
        />
      </div>
    </div>
    <ConfirmationModal
      v-show="confirmState === 'show'"
      v-model:confirmState="confirmState"
      :function="deleteAsset"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useEditMode } from "../composables/useEdit";
import BaseButton from "../components/base/BaseButton.vue";
import { Unicons } from "@/types";
import { useMutation } from "@vue/apollo-composable";
import { asString } from "@/helpers";
import { useRoute, useRouter } from "vue-router";
import { usePageInfo } from "@/composables/usePageInfo";
import {
  DeleteDataDocument,
  type Collection,
  type DeleteDataMutation,
} from "@/generated-types/queries";
import ConfirmationModal from "./base/ConfirmationModal.vue";

export default defineComponent({
  name: "EditModal",
  components: {
    BaseButton,
    ConfirmationModal,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { pageInfo } = usePageInfo();
    const { isEdit, save, discard, disableEditMode } = useEditMode();
    const confirmState = ref<"hidden" | "show">("hidden");

    const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);
    const deleteAsset = async () => {
      const id = asString(route.params["id"]);
      const collection: Collection = pageInfo.value.routeType as Collection;
      await mutate({ id, path: collection });
      disableEditMode();
      router.push({ name: pageInfo.value.parentRouteName });
    };

    const showConfirmation = () => {
      confirmState.value = confirmState.value === "show" ? "hidden" : "show";
    };

    return {
      save,
      isEdit,
      discard,
      Unicons,
      confirmState,
      deleteAsset,
      showConfirmation,
    };
  },
});
</script>
