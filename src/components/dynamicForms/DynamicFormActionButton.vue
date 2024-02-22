<template>
  <div class="rounded-md pb-2">
    <div class="flex pb-2">
      <div v-if="errors.length" class="w-full bg-red-light p-2">
        <ul>
          <li
            v-for="error in errors"
            class="text-red-default flex items-center"
          >
            - {{ t(error) }}
          </li>
        </ul>
      </div>
      <button
        type="button"
        :disabled="disabled"
        class="flex justify-center items-center w-full rounded-md outline-none transition-colors duration-300 disabled:cursor-auto text-neutral-white bg-accent-accent hover:text-accent-accent hover:bg-neutral-lightest active:text-accent-accent active:bg-accent-light disabled:text-text-disabled disabled:bg-neutral-lightest"
      >
        <unicon
          v-if="props.icon !== DamsIcons.NoIcon"
          :class="{ '-ml-1': label }"
          :name="Unicons[props.icon].name"
          :height="18"
        />
        <span v-if="label" class="ml-0.5 leading-4">{{ label }}</span>
      </button>
    </div>
    <div
      v-if="
        progressIndicator &&
        progressIndicator.type === ActionProgressIndicatorType.ProgressSteps
      "
      class="w-full flex items-center p-2 bg-neutral-white h-[48px]"
    >
      <div
        v-for="progressStep in uploadProgress"
        :key="progressStep.label"
        class="flex"
      >
        <base-progress-step
          :label="progressStep.label"
          :step-type="progressStep.status"
        />
        <unicon
          :name="Unicons.EllipsisH.name"
          fill="text-neutral-black"
          :height="18"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ActionProgress,
  ActionProgressIndicatorType,
  DamsIcons,
} from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import BaseProgressStep from "@/components/base/BaseProgressStep.vue";
import useUpload from "@/composables/useUpload";

const props = withDefaults(
  defineProps<{
    label: string;
    icon: DamsIcons;
    disabled: boolean;
    errors?: string[];
    progressIndicator?: ActionProgress;
  }>(),
  {
    errors: [],
  }
);

const { t } = useI18n();
const { uploadProgress } = useUpload();
</script>

<style scoped></style>
