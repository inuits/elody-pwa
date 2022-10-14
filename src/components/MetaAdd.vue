<template>
  <div class="p-6 bg-neutral-20 w-full">
    <h2>Add {{ label }}</h2>
    <BaseButton
      :label="$t('buttons.add')"
      :icon="Unicons.PlusCircle.name"
      :icon-color="'var(--color-neutral-10)'"
      :bg-color="'blue-400'"
      :txt-color="'neutral-0'"
      @click="add"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseButton from "@/components/base/BaseButton.vue";
import { Unicons } from "@/types";

export default defineComponent({
  name: "MetaAdd",
  components: { BaseButton },
  props: {
    label: {
      type: String,
      required: false,
    },
  },
  emits: ["addMetadata"],
  setup(props, { emit }) {
    const add = () => {
      emit("addMetadata");
    };

    return {
      add,
      Unicons,
    };
  },
});
</script>
