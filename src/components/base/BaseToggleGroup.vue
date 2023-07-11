<template>
  <div class="flex w-fit h-fit rounded bg-neutral-white select-none">
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
import { onMounted, reactive, watch, type Ref } from "vue";

const props = defineProps<{
  toggles: { isOn: Ref<boolean>; iconOn: DamsIcons; iconOff: DamsIcons }[];
}>();

const toggles = reactive(props.toggles);

const turnAllTogglesOff = () => {
  for (const toggle of toggles) toggle.isOn = false;
};

const onlyHaveOneToggleTurnedOn = () => {
  const togglesTurnedOn = toggles.filter((toggle) => toggle.isOn).length;
  if (togglesTurnedOn === 0) toggles[0].isOn = true;
  else if (togglesTurnedOn > 1) toggles[0].isOn = false;
};

onMounted(() => onlyHaveOneToggleTurnedOn());
watch(toggles, () => onlyHaveOneToggleTurnedOn());
</script>
