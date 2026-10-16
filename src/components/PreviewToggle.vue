<template>
  <base-tooltip position="top-right" :tooltip-offset="8">
    <template #activator="{ on }">
      <!-- The row's preview affordance (lists.card: PreviewEye): 22px eye,
           body ink, accent and filled while this row's preview is open. -->
      <button
        v-bind="$attrs"
        v-on="on"
        type="button"
        data-cy="preview-toggle"
        class="flex items-center justify-center size-5.5 mx-px p-0 cursor-pointer text-text-body"
        :class="{ '!text-accent-accent fill-current': active }"
        :aria-label="label"
        :aria-pressed="active ? 'true' : 'false'"
        @click.stop.prevent="emit('toggle')"
      >
        <unicon :name="Unicons.Eye.name" class="size-5.5" />
      </button>
    </template>
    <template #default>
      <span>{{ label }}</span>
    </template>
  </base-tooltip>
</template>

<script lang="ts" setup>
defineOptions({ inheritAttrs: false });
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { Unicons } from "@/types";

const props = defineProps<{ active: boolean }>();
const emit = defineEmits<{ (event: "toggle"): void }>();

const { t } = useI18n();

const label = computed(() =>
  t(props.active ? "preview-component.close" : "preview-component.open"),
);
</script>
