<template>
  <base-context-menu-item
    :label="$t(label, [entityTypeLabel])"
    :icon="Unicons[icon].name"
    @clicked="openLink"
  />
</template>

<script setup lang="ts">
import type { Entitytyping } from "@/generated-types/queries";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { typeUrlMapping } from "@/main";
import { Unicons } from "@/types";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();

const props = defineProps<{
  label: string;
  icon: string;
  entityId: string;
  entityType: Entitytyping;
}>();

const entityTypeLabel = computed(() =>
  t(`entity-translations.singular.${props.entityType}`),
);
const urlType = computed(
  () => typeUrlMapping?.reverseMapping?.[props.entityType] || props.entityType,
);

const openLink = () => {
  const resolved = router.resolve({
    params: { id: props.entityId, type: urlType.value },
  });
  window.open(resolved.href, "_blank");
};
</script>
