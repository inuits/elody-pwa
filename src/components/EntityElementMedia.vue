<template>
  <entity-element-wrapper
    :isCollapsed="isCollapsed"
    :label="label"
    class="flex flex-col h-full"
  >
    <template v-slot:actions>
      <div
        v-if="isEdit"
        class="flex items-center text-accent-normal cursor-pointer"
      >
        <unicon height="16" :name="Unicons.PlusCircle.name" />
        <p class="underline ml-2" @click="openPickEntityModal([])">
          Voeg bestand toe
        </p>
      </div>
    </template>
    <template v-slot:content>
      <!-- Not yet refactored old component -->
      <media-viewer
        v-if="!isCollapsed"
        :loading="false"
        entityType="MediaFile"
        class="flex-1"
      />
    </template>
  </entity-element-wrapper>
</template>
<script lang="ts" setup>
import EntityElementWrapper from "./base/EntityElementWrapper.vue";
import MediaViewer from "./base/Mediaviewer.vue";
import useEditMode from "@/composables/useEdit";
import { Unicons } from "@/types";
import { usePickEntityModal } from "./PickEntityModal.vue";

const props = defineProps<{
  label: string;
  isCollapsed: boolean;
}>();

const { isEdit } = useEditMode();
const { openPickEntityModal } = usePickEntityModal();
</script>
