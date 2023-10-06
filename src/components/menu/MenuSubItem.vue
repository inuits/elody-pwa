<template>
  <div
    v-if="show === true"
    :class="[
      'flex flex-column items-center cursor-pointer ml-9 mt-1 origin-top-center hover:text-accent-accent',
      { 'text-accent-accent': isActive },
    ]"
    @click="checkIfRouteOrModal(subMenuItem)"
  >
    <p class="overflow-hidden px-4 cursor-pointer">
      {{ t(subMenuItem.label || "") }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, type PropType } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import useMenuHelper from "@/composables/useMenuHelper";
import type { MenuItem } from "@/generated-types/queries";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  subMenuItem: { type: Object as PropType<MenuItem>, required: true },
});
const { t } = useI18n();
const route = useRoute();
const isActive = computed(
  () =>
    route.path.replace("/", "") ===
    (props.subMenuItem.typeLink?.route?.destination as string)
);
const { checkIfRouteOrModal } = useMenuHelper();
</script>
<style></style>
