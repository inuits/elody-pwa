<template>
  <component
    :is="requiredAuthForThisEntity ? 'p' : 'a'"
    :class="[{ underline: !requiredAuthForThisEntity }, 'text-sm']"
    :href="link"
    :style="{ color: requiredAuthForThisEntity ? '#000' : '#1d4ed8' }"
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
}>();

const config: any = inject("config");

const requiredAuthForThisEntity = computed(() => {
  const metaOfChildRoutes = getChildrenOfHomeRoutes(config).map(
    (route: any) => route.meta,
  );
  return requiresAuthForEntity(props.type, metaOfChildRoutes);
});
</script>
