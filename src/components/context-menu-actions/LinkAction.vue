<template>
  <base-context-menu-item
    :label="$t(label, [entityTypeLabel])"
    :icon="Unicons[icon].name"
    :as-button="asButton"
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
  asButton?: boolean;
  routeName?: string;
  openInNewTab?: boolean;
}>();

const entityTypeLabel = computed(() =>
  t(`entity-translations.singular.${props.entityType}`),
);
const urlType = computed(
  () => typeUrlMapping?.mapping?.[props.entityType] || props.entityType,
);

const openLink = () => {
  if (props.routeName) {
    const target = { name: props.routeName, params: { id: props.entityId } };
    if (props.openInNewTab) {
      window.open(router.resolve(target).href, "_blank");
    } else {
      router.push(target);
    }
    return;
  }
  const resolved = router.resolve({
    params: { id: props.entityId, type: urlType.value },
  });
  window.open(resolved.href, "_blank");
};
</script>
