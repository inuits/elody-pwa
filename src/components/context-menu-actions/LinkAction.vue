<template>
  <router-link
    :to="{ params: { id: entityId, type: typeUrlMapping?.mapping[entityType] || entityType } }"
    target="_blank"
    @click.stop
  >
    <base-context-menu-item :label="$t(label, [entityTypeLabel])" :icon="Unicons[icon].name" />
  </router-link>
</template>

<script setup lang="ts">
import type { Entitytyping } from "@/generated-types/queries";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { typeUrlMapping } from "@/main";
import { Unicons } from "@/types";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  label: String;
  icon: String;
  entityId: String;
  entityType: Entitytyping;
}>();

const entityTypeLabel = computed(() => t(`entity-translations.singular.${props.entityType}`));

</script>
