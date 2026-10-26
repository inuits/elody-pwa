<template>
  <!-- View switch: one segmented capsule like the band's other controls;
       the active view in accent wash. -->
  <div
    role="group"
    :aria-label="$t('library.view-mode')"
    class="flex w-fit h-fit border border-border-default rounded-input bg-surface overflow-hidden select-none"
  >
    <BaseTooltip
      v-for="(toggle, index) in toggles"
      :key="index"
      position="bottom"
      :tooltip-offset="8"
    >
      <template #activator="{ on, describedBy }">
        <button
          v-on="on"
          type="button"
          class="flex items-center justify-center size-(--view-switch-size) cursor-pointer"
          :class="
            toggle.isOn
              ? 'bg-accent-wash text-accent-ink'
              : 'text-text-secondary hover:bg-surface-row-hover'
          "
          :aria-label="toggle.label ? $t(toggle.label) : undefined"
          :aria-describedby="describedBy"
          :aria-pressed="toggle.isOn ? 'true' : 'false'"
          @click="select(index)"
        >
          <unicon
            :name="Unicons[toggle.isOn ? toggle.iconOn : toggle.iconOff].name"
            height="18"
          />
        </button>
      </template>
      <span v-if="toggle.label">{{ $t(toggle.label) }}</span>
    </BaseTooltip>
  </div>
</template>

<script lang="ts" setup>
import type { DamsIcons } from "@/generated-types/queries";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { Unicons } from "@/types";
import { onMounted, ref, watch, type Ref } from "vue";

type Toggle = {
  viewMode?: string;
  isOn: Ref<boolean>;
  iconOn: DamsIcons;
  iconOff: DamsIcons;
  label?: string;
};

const props = defineProps<{
  toggles: Toggle[];
}>();

// a toggle the user turned on: a click, not a change the page made
const emit = defineEmits<{ (event: "selected", toggle: Toggle): void }>();

const toggles = ref(props.toggles);

const select = (index: number) => {
  toggles.value.forEach((toggle, i) => (toggle.isOn = i === index));
  emit("selected", props.toggles[index]);
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
    toggles.value = props.toggles;
  },
  { deep: true },
);
</script>
