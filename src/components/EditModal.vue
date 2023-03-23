<template>
  <div v-if="isEdit" class="flex justify-center relative w-full p-5 z-20">
    <div
      class="flex flex-column w-full rounded-full gap-x-2 bg-neutral-white px-4 py-2"
    >
      <BaseButton
        :icon="Unicons.Save.name"
        :icon-color="'neutral-white'"
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
        @click="discard()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useEditMode } from "../composables/useEdit";
import BaseButton from "../components/base/BaseButton.vue";
import { Unicons } from "@/types";

export default defineComponent({
  name: "EditModal",
  components: {
    BaseButton,
  },
  setup() {
    const { isEdit, save, discard } = useEditMode();

    return {
      save,
      isEdit,
      discard,
      Unicons,
    };
  },
});
</script>
