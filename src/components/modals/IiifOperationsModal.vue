<template>
  <base-modal
    :modal-type="TypeModals.IiifOperationsModal"
    @hide-modal="closeModal(TypeModals.IiifOperationsModal)"
  >
    <div class="p-4">
      <h2 class="text-xl font-bold pb-4">
        {{ t("iiif-operations-modal.title") }}
      </h2>
      <div class="flex flex-col justify-center">
        <h4 class="text-md font-bold">
          {{ t("iiif-operations-modal.dimensions") }}
        </h4>

        <div class="flex justify-evenly p-4 mb-6">
          <div class="max-w-1/4">
            <p>{{ t("iiif-operations-modal.width") }}</p>
            <base-input-text-number-datetime
              :model-value="scaledWidth"
              input-style="defaultWithBorder"
              type="number"
              @update:model-value="(value: number) => (scaledWidth = value)"
            />
          </div>
          <div class="max-w-1/4">
            <p>{{ t("iiif-operations-modal.height") }}</p>
            <base-input-text-number-datetime
              :model-value="scaledHeight"
              input-style="defaultWithBorder"
              type="number"
              @update:model-value="(value: number) => (scaledHeight = value)"
            />
          </div>
        </div>
        <div>
          <div class="w-full">
            <h4 class="text-md font-bold">
              {{ t("iiif-operations-modal.scale") }}
            </h4>
          </div>
          <div class="flex justify-center p-4">
            <button
              v-for="scale in availableScales"
              :class="[
                'p-2 mx-2 w-[60px] h-[40px] rounded-lg text-white cursor-pointer',
                { 'bg-accent-accent': scale === currentScale },
                { 'bg-neutral-100': scale !== currentScale },
              ]"
              @click="currentScale = scale"
            >
              {{ scale }}
            </button>
          </div>
        </div>
      </div>
      <div>
        <base-button-new
          :label="t('iiif-operations-modal.get-resized-image')"
          button-style="accentAccent"
          @click="getImage"
        />
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import BaseModal from "@/components/base/BaseModal.vue";
import { TypeModals } from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";
import { ref, watch } from "vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

const props = defineProps<{
  fileName: string;
  dimensions: { width: number; height: number } | undefined;
}>();

const { closeModal } = useBaseModal();
const { t } = useI18n();

const availableScales = [0.25, 0.5, 1.0];
const currentScale = ref(1.0);
const originalWidth = props.dimensions?.width || 1920;
const originalHeight = props.dimensions?.height || 1080;
const scaledWidth = ref(originalWidth);
const scaledHeight = ref(originalHeight);

const getImage = () => {
  window.open(
    `/api/iiif/3/${props.fileName}/full/${scaledWidth.value},${scaledHeight.value}/0/default.jpg`,
    "_blank",
  );
};

const scaleDimensions = (scale: number): { width: number; height: number } => {
  if (!originalWidth || !originalHeight) return { width: 0, height: 0 };
  return { width: originalWidth * scale, height: originalHeight * scale };
};

watch(
  () => currentScale.value,
  (newValue: number) => {
    const scaledDimensions = scaleDimensions(newValue);
    scaledWidth.value = scaledDimensions.width;
    scaledHeight.value = scaledDimensions.height;
  },
);
</script>

<style scoped></style>
