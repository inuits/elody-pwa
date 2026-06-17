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
              :key="scale"
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
        <div>
          <div class="w-full">
            <h4 class="text-md font-bold">
              {{ t("iiif-operations-modal.format") }}
            </h4>
          </div>
          <div class="flex justify-center p-4">
            <button
              v-for="format in availableFormats"
              :key="format"
              :class="[
                'p-2 mx-2 w-[60px] h-[40px] rounded-lg text-white cursor-pointer',
                { 'bg-accent-accent': format === currentFormat },
                { 'bg-neutral-100': format !== currentFormat },
              ]"
              @click="currentFormat = format"
            >
              {{ format }}
            </button>
          </div>
        </div>
      </div>
      <div>
        <base-button-new
          :label="t('iiif-operations-modal.get-resized-image')"
          button-style="accentAccent"
          :loading="isDownloading"
          @click="downLoadImage"
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
import { computed, ref, watch } from "vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

const { closeModal, getModalInfo } = useBaseModal();
const { t } = useI18n();

const modalInfo = computed(() => getModalInfo(TypeModals.IiifOperationsModal));
const fileName = computed<string>(() => modalInfo.value.fileName || "");
const originalFilename = computed<string>(
  () => modalInfo.value.originalFilename || "",
);
const dimensions = computed<{ width: number; height: number } | undefined>(
  () => modalInfo.value.dimensions,
);

const availableScales = [0.25, 0.5, 1.0];
const availableFormats = ["png", "jpg", "tif"];
const currentScale = ref(1.0);
const currentFormat = ref("jpg");
const isDownloading = ref(false);

const originalWidth = computed<number>(() => dimensions.value?.width || 1920);
const originalHeight = computed<number>(() => dimensions.value?.height || 1080);

const scaledWidth = ref(originalWidth.value);
const scaledHeight = ref(originalHeight.value);

const downLoadImage = async (): Promise<void> => {
  if (isDownloading.value) return;
  isDownloading.value = true;

  const filenameWithoutExtension =
    originalFilename.value?.replace(/\.[^/.]*$/, "") || "";
  const url = `/api/iiif/3/${fileName.value}/full/^!${scaledWidth.value},${scaledHeight.value}/0/default.${currentFormat.value}`;
  const downloadName = `${filenameWithoutExtension}_${scaledWidth.value}x${scaledHeight.value}.${currentFormat.value}`;

  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Image generation failed (${response.status})`);

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error("Failed to download resized image", error);
  } finally {
    isDownloading.value = false;
  }
};

const scaleDimensions = (scale: number): { width: number; height: number } => {
  if (!originalWidth.value || !originalHeight.value)
    return { width: 0, height: 0 };
  return {
    width: Math.floor(originalWidth.value * scale),
    height: Math.floor(originalHeight.value * scale),
  };
};

watch(
  () => currentScale.value,
  (newValue: number) => {
    const scaledDimensions = scaleDimensions(newValue);
    scaledWidth.value = scaledDimensions.width;
    scaledHeight.value = scaledDimensions.height;
  },
);

watch(
  () => modalInfo.value.open,
  (isOpen: boolean) => {
    if (!isOpen) return;
    currentScale.value = 1.0;
    currentFormat.value = "jpg";
    scaledWidth.value = originalWidth.value;
    scaledHeight.value = originalHeight.value;
  },
);
</script>

<style scoped></style>
