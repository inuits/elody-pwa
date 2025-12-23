<template>
  <component
    :is="requiredAuthForThisEntity ? 'p' : 'a'"
    :class="[{ underline: !requiredAuthForThisEntity }, 'text-sm']"
    :href="requiredAuthForThisEntity ? undefined : link"
    :target="shouldOpenInNewTab ? '_blank' : undefined"
    :rel="shouldOpenInNewTab ? 'noopener noreferrer' : undefined"
    :style="{
      color: requiredAuthForThisEntity ? '#000' : 'var(--color-text-link)',
    }"
    @click.stop
  >
    {{ label }}
  </component>
</template>

<script lang="ts" setup>
import { computed, inject } from "vue";
import { getChildrenOfHomeRoutes, requiresAuthForEntity } from "@/helpers";

const props = defineProps<{
  label: string;
  link: string;
  type: string;
  openInNewTab: boolean;
}>();

const config: any = inject("config");

const requiredAuthForThisEntity = computed(() => {
  const metaOfChildRoutes = getChildrenOfHomeRoutes(config).map(
    (route: any) => route.meta,
  );
  return requiresAuthForEntity(props.type, metaOfChildRoutes);
});

const shouldOpenInNewTab = computed(() => {
  return !requiredAuthForThisEntity.value && props.openInNewTab;
});
</script>
