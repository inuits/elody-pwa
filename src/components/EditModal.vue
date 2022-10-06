<template>
  <div class="w-full absolute pl-20 bottom-0 z-20">
    <div
      v-if="isEdit"
      class="flex flex-column rounded gap-x-2 bg-neutral-0 shadow-2xl px-4 py-2"
    >
      <BaseButton
        :bg-color="'blue-400'"
        :txt-color="'neutral-0'"
        label="Save"
        @click="save()"
      />
      <BaseButton
        label="Discard"
        bg-color="'neutral-0'"
        :border-color="'red-default'"
        :txt-color="'red-default'"
        @click="discard()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useEditMode } from "@/composables/useEdit";
import BaseButton from "@/components/base/BaseButton.vue";

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
    };
  },
});
</script>
