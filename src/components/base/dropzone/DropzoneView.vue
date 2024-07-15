<template>
  <div
    ref="dropzoneView"
    class="bg-neutral-white w-full inline-block border-dashed border-[3px] border-text-light rounded-xl"
    :class="[
      fileCount === 0 ? 'flex justify-center items-center cursor-pointer' : '',
      `${style}`,
    ]"
  >
    <div v-show="fileCount === 0" class="inline-block w-9/12 text-center">
      <div class="dz-message" data-dz-message>
        <div class="text-body">
          {{ $t(dropzoneLabel) }}
        </div>
        <div v-if="isValidation" @click.stop>
          <a
            class="underline text-accent-accent"
            :href="`/upload-csv-template-${selectedItem}.csv`"
            download
            >{{ $t("upload-fields.csv-template-link") }}
          </a>
          <select
            v-if="entityTypesForUpload"
            v-model="selectedItem"
            class="inline-block min-w-0 max-w-full pl-2 pr-8 border-none border-b underline text-accent-accent"
          >
            <option
              v-for="entityType in entityTypesForUpload"
              :key="entityType"
              :value="entityType"
            >
              {{ entityType }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

const dropzoneView = ref<HTMLDivElement>();

const props = withDefaults(
  defineProps<{
    modelValue: HTMLDivElement | undefined;
    dropzoneLabel: string;
    isValidation: boolean;
    fileCount: number;
    style: string;
    entityTypesForUpload?: string | undefined;
  }>(),
  {
    style: "",
    isValidation: false,
    entityTypesForUpload: undefined,
  }
);

const selectedItem = ref<string | undefined>(props.entityTypesForUpload ? props.entityTypesForUpload[0] : undefined);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: HTMLDivElement | undefined): void;
}>();

onMounted(() => {
  emit("update:modelValue", dropzoneView.value);
});
</script>

<style></style>
