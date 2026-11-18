<template>
  <div class="flex flex-col [&_.button:last-of-type]:mb-0">
    <div
      v-if="components.length === 0"
      class="absolute block top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl text-gray-700"
    >
      <spinner-loader theme="accent" />
    </div>

    <template v-for="(component, idx) in components" :key="idx">
      <div
        v-if="component === SkeletonComponentType.Title"
        class="animate-pulse h-13 bg-gray-300 rounded-[3px] max-w-95 mb-4"
      />

      <div
        v-if="component === SkeletonComponentType.Subtitle"
        class="animate-pulse h-9 bg-gray-300 rounded-[3px] w-full mb-4"
      />

      <div
        v-else-if="component === SkeletonComponentType.EntityPicker"
        class="animate-pulse h-full bg-gray-300 min-h-[80vh] rounded-[3px] w-full"
      />

      <div
        v-else-if="component === SkeletonComponentType.UploadInfoLink"
        class="animate-pulse h-11 w-full bg-gray-300 rounded-[3px] mb-2"
      />

      <div
        v-else-if="component === SkeletonComponentType.UploadCsvTemplates"
        class="animate-pulse h-15.5 w-full bg-gray-300 rounded-[3px] mb-4"
      />

      <div
        v-else-if="component === SkeletonComponentType.DropzoneInfo"
        class="animate-pulse h-[1.1875rem] w-full bg-gray-300 rounded-[3px] mb-2"
      />

      <div v-else-if="component === SkeletonComponentType.Dropdown">
        <div
          class="animate-pulse h-[1.1875rem] bg-gray-300 rounded-[3px] max-w-25 mb-px"
        />
        <div
          class="animate-pulse h-9 bg-gray-300 rounded-[3px] w-full mb-2"
        />
      </div>

      <div v-else-if="component === SkeletonComponentType.RelationDropdown">
        <div
          class="animate-pulse h-[1.1875rem] bg-gray-300 rounded-[3px] max-w-25 mb-px"
        />
        <div
          class="animate-pulse h-10 bg-gray-300 rounded-[3px] w-full mb-2"
        />
      </div>

      <div
        v-else-if="component.startsWith('Dropzone')"
        :class="[
          'animate-pulse w-full h-full bg-gray-300 rounded-[3px] mb-4',
          getDropzoneHeightClass(component),
        ]"
      />

      <div
        v-else-if="component === SkeletonComponentType.Button"
        class="button animate-pulse h-10.5 bg-gray-300 rounded-[3px] w-full mb-2 mt-5"
      />

      <div
        v-else-if="component === SkeletonComponentType.DisabledButton"
        class="button animate-pulse h-8.5 bg-gray-300 rounded-[3px] w-full mb-2"
      />

      <div v-else-if="component === SkeletonComponentType.ButtonWithProgress">
        <div
          class="animate-pulse h-8.5 bg-gray-300 rounded-[3px] w-full mb-2"
        />
        <div class="animate-pulse h-12 bg-gray-300 rounded-[3px] w-full" />
      </div>

      <div
        v-else-if="component === SkeletonComponentType.Progress"
        class="animate-pulse h-12 bg-gray-300 rounded-[3px] w-full p-2"
      />

      <div v-else-if="component === SkeletonComponentType.Textarea">
        <div
          class="animate-pulse h-[1.1875rem] bg-gray-300 rounded-[3px] max-w-25 mb-px"
        />
        <div
          class="animate-pulse h-22.5 bg-gray-300 rounded-[3px] w-full mb-2"
        />
      </div>

      <div v-else-if="component === SkeletonComponentType.Input">
        <div
          class="animate-pulse h-[1.1875rem] bg-gray-300 rounded-[3px] max-w-25 mb-px"
        />
        <div
          class="animate-pulse h-9 bg-gray-300 rounded-[3px] w-full mb-2"
        />
      </div>

      <div v-else-if="component === SkeletonComponentType.Checkbox">
        <div
          class="animate-pulse h-[1.1875rem] bg-gray-300 rounded-[3px] max-w-25 mb-px"
        />
        <div
          class="animate-pulse h-6 w-[2.1875rem] bg-gray-300 rounded-[3px] mb-2"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { inject, computed } from "vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { SkeletonComponentType } from "@/generated-types/queries";

interface SkeletonConfig {
  skeletonLayouts?: Record<string, SkeletonComponentType[]>;
}

const config = inject<SkeletonConfig>("config", {});

const props = withDefaults(
  defineProps<{
    formKey: string;
  }>(),
  { formKey: "" },
);

const getDropzoneHeightClass = (componentName: string): string => {
  switch (componentName) {
    case SkeletonComponentType.DropzoneSmall:
      return "min-h-[15vh]";
    case SkeletonComponentType.DropzoneMedium:
      return "min-h-[50vh]";
    case SkeletonComponentType.DropzoneBig:
      return "min-h-[85vh]";
    default:
      return "min-h-[15vh]";
  }
};

const components = computed<SkeletonComponentType[]>(() => {
  return config.skeletonLayouts?.[props.formKey] || [];
});
</script>

<style scoped></style>
