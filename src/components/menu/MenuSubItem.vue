<template>
  <router-link
    v-if="(isPermitted && show)"
    :class="[
      'flex flex-column items-center cursor-pointer ml-9 mt-1 origin-top-center hover:text-accent-accent',
      { 'text-accent-accent': isActive },
    ]"
    :to="menuAction?.action"
  >
    <p class="overflow-hidden px-4 cursor-pointer">
      {{ t(subMenuItem.label || "") }}
    </p>
  </router-link>
</template>

<script lang="ts" setup>
import { computed, defineProps, type PropType } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import useMenuHelper from "@/composables/useMenuHelper";
import { usePermissions } from "@/composables/usePermissions";
import { Permission, type MenuItem } from "@/generated-types/queries";
import { ref } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  subMenuItem: { type: Object as PropType<MenuItem>, required: true },
});
const { t } = useI18n();
const route = useRoute();
const { can } = usePermissions();
const isActive = computed(
  () =>
    route.path.replace("/", "") ===
    (props.subMenuItem.typeLink?.route?.destination as string)
);
const { checkIfRouteOrModal } = useMenuHelper();
const menuAction = computed(() => checkIfRouteOrModal(props.subMenuItem));
const isPermitted = ref<boolean>();

if (props.subMenuItem.requiresAuth === false) isPermitted.value = true;
else isPermitted.value = can(Permission.Canread, props.subMenuItem.entityType);
</script>
<style></style>
