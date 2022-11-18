<template>
  <div class="fixed w-full h-full top-0 left-0 z-[51]">
    <div class="fixed w-full h-full bg-tag-selected top-0 left-0 opacity-50" />
    <div
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-neutral-30 p-4 rounded"
    >
      <p class="m-2">{{ $t("confirmation.sure-message") }}</p>
      <div class="m-2 flex justify-around">
        <BaseButton
          bg-color="neutral-900"
          bg-hover-color="neutral-200"
          txt-color="neutral-0"
          :label="$t('confirmation.cancel')"
          @click="cancel"
        />
        <BaseButton
          bg-color="red-default"
          bg-hover-color="red-dark"
          txt-color="neutral-0"
          :label="$t('confirmation.confirm')"
          @click="confirm"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import BaseButton from "./BaseButton.vue";

export default defineComponent({
  name: "ConfirmationModal",
  components: {
    BaseButton,
  },
  props: {
    function: {
      type: Function,
      required: true,
    },
  },
  emits: ["update:confirmState"],
  setup(props, { emit }) {
    const confirm = () => {
      emit("update:confirmState", "hidden");
      props.function();
    };

    const cancel = () => {
      emit("update:confirmState", "hidden");
    };

    return { confirm, cancel };
  },
});
</script>
