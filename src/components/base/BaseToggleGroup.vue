<template>
  <div class="flex w-fit h-fit rounded bg-background-light select-none">
    <BaseToggle
      class="m-0.5"
      v-for="(toggle, index) in toggles"
      :key="index"
      v-model="toggle.isOn"
      :icon-on="toggle.iconOn"
      :icon-off="toggle.iconOff"
      :is-part-of-toggle-group="true"
      @turn-all-toggles-in-group-off="turnAllTogglesOff"
    />
  </div>
</template>

<script lang="ts" setup>
import type { DamsIcons } from "@/generated-types/queries";
import BaseToggle from "@/components/base/BaseToggle.vue";
import { onMounted, ref, watch, type Ref } from "vue";

const props = defineProps<{
  toggles: { isOn: Ref<boolean>; iconOn: DamsIcons; iconOff: DamsIcons }[];
}>();

const toggles = ref(props.toggles);

const turnAllTogglesOff = () => {
  for (const toggle of toggles.value) toggle.isOn = false;
};

const onlyHaveOneToggleTurnedOn = () => {
  const togglesTurnedOn = toggles.value.filter((toggle) => toggle.isOn).length;
  if (togglesTurnedOn === 0) toggles.value[0].isOn = true;
  else if (togglesTurnedOn > 1) toggles.value[0].isOn = false;
};

onMounted(() => onlyHaveOneToggleTurnedOn());
watch(toggles, () => onlyHaveOneToggleTurnedOn());
watch(
  () => props.toggles, 
  () => { 
    toggles.value = props.toggles 
  }, 
  { deep: true }
);
</script>
