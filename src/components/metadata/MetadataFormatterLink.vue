<template>
  <component
    :is="requiredAuthForThisEntity ? 'p' : 'a'"
    :class="linkClasses"
    :href="requiredAuthForThisEntity ? undefined : link"
    :target="shouldOpenInNewTab ? '_blank' : undefined"
    :rel="shouldOpenInNewTab ? 'noopener noreferrer' : undefined"
    :style="{
      background: settings?.background,
      color: requiredAuthForThisEntity
        ? '#000'
        : settings?.text || 'var(--color-text-link)',
    }"
    @click.stop
  >
    <unicon v-if="icon" :name="icon.name" height="14" width="14" />
    {{ label }}
  </component>
</template>

<script lang="ts" setup>
import { computed, inject } from "vue";
import { getChildrenOfHomeRoutes, requiresAuthForEntity } from "@/helpers";
import { formattersSettings } from "@/main";
import { type DamsIcons } from "@/generated-types/queries";
import { Unicons } from "@/types";

const props = defineProps<{
  formatter: string;
  label: string;
  link: string;
  type: string;
  openInNewTab: boolean;
}>();

const config: any = inject("config");

const settings = computed<any>(() => {
  const [formatterType, linkType] = props.formatter.split("|");
  return formattersSettings?.[formatterType]?.[linkType];
});

const icon = computed(() =>
  settings.value?.icon ? Unicons[settings.value.icon as DamsIcons] : undefined,
);

const requiredAuthForThisEntity = computed(() => {
  const metaOfChildRoutes = getChildrenOfHomeRoutes(config).map(
    (route: any) => route.meta,
  );
  return requiresAuthForEntity(props.type, metaOfChildRoutes);
});

const shouldOpenInNewTab = computed(() => {
  return !requiredAuthForThisEntity.value && props.openInNewTab;
});

const PLAIN_LINK = "text-sm underline";
const CHIP =
  "text-sm inline-flex items-center gap-1 rounded-md py-1 px-2 font-medium";
const CHIP_HOVER =
  "transition hover:brightness-95 hover:ring-1 hover:ring-current";

// A link the viewer may not open renders as a <p>, so it gets neither the
// underline nor the hover affordance.
const linkClasses = computed<string>(() => {
  const isChip = Boolean(settings.value?.background);
  const isClickable = !requiredAuthForThisEntity.value;

  if (!isChip) return isClickable ? PLAIN_LINK : "text-sm";
  return isClickable ? `${CHIP} ${CHIP_HOVER}` : CHIP;
});
</script>
