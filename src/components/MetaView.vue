<template>
  <div v-if="metadata.length != 0" class="p-6 bg-neutral-0">
    <meta-view-line :metadata="metadata" :loading="loading" />
  </div>
  <div
    v-if="metadata.length == 0"
    class="justify-center items-center flex mt-4 text-neutral-700 font-bold"
  >
    No metadata available
  </div>
</template>

<script lang="ts">
import { MetadataAndRelation } from "@/queries";
import { defineComponent, PropType } from "vue";
import MetaViewLine from "./MetaViewLine.vue";

export default defineComponent({
  name: "MetaView",
  components: { MetaViewLine },
  props: {
    loading: { type: Boolean, default: false },
    metadata: {
      type: Array as PropType<MetadataAndRelation[]>,
      required: true,
    },
  },
  setup() {},
});
</script>

<style lang="postcss" scoped>
.label {
  @apply rounded font-body text-xs text-neutral-60;
}
.value {
  @apply rounded font-body text-sm text-neutral-700 mt-0.5;
}
.label.loading,
.value.loading {
  @apply bg-neutral-20 text-neutral-20;
}
</style>
