<template>
  <base-modal
    class="md:!min-w-0 md:!w-[30rem]"
    :modal-type="TypeModals.IiifOperationsModal"
    :title="t('iiif-operations-modal.title')"
    @hide-modal="closeModal(TypeModals.IiifOperationsModal)"
  >
    <div class="flex flex-col w-full text-ui">
      <div class="flex flex-col gap-5 px-6 py-5">
        <p
          v-if="dimensions"
          data-cy="iiif-original"
          class="m-0 -mt-1 text-text-secondary"
        >
          {{
            t("iiif-operations-modal.original", {
              filename: originalFilename || fileName,
              width: originalWidth,
              height: originalHeight,
            })
          }}
        </p>

        <div class="flex flex-col gap-2">
          <span class="font-bold text-text-link">{{
            t("iiif-operations-modal.size")
          }}</span>
          <div role="group" :class="segmentedClasses" class="grid-cols-4">
            <button
              v-for="scale in availableScales"
              :key="scale"
              type="button"
              data-cy="iiif-scale"
              :class="segmentClasses(scale === currentScale)"
              :aria-pressed="scale === currentScale ? 'true' : 'false'"
              @click="pickScale(scale)"
            >
              {{
                scale === "custom"
                  ? t("iiif-operations-modal.custom")
                  : `${scale * 100}%`
              }}
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex items-end gap-2">
            <label
              v-for="side in ['width', 'height'] as const"
              :key="side"
              class="flex flex-col gap-1.5 flex-1 min-w-0"
              :class="{ 'order-last': side === 'height' }"
            >
              <span class="font-bold text-text-field-label"
                >{{ t(`iiif-operations-modal.${side}`) }} (px)</span
              >
              <base-input-text-number-datetime
                :data-cy="`iiif-${side}`"
                :model-value="side === 'width' ? scaledWidth : scaledHeight"
                input-style="defaultWithBorder"
                type="number"
                :min="0"
                :invalid="isMissingDimensions"
                :described-by="sizeMessage ? sizeMessageId : undefined"
                @update:model-value="
                  (value: number | string) => setDimension(side, value)
                "
              />
            </label>
            <button
              type="button"
              data-cy="iiif-lock"
              class="flex items-center justify-center shrink-0 size-10 border rounded-input cursor-pointer"
              :class="
                isRatioLocked
                  ? 'bg-accent-wash text-accent-ink border-accent'
                  : 'bg-surface text-text-secondary border-border-default'
              "
              :aria-label="t('iiif-operations-modal.lock-ratio')"
              :title="t('iiif-operations-modal.lock-ratio')"
              :aria-pressed="isRatioLocked ? 'true' : 'false'"
              @click="toggleRatioLock"
            >
              <unicon
                :name="isRatioLocked ? Unicons.Link.name : 'link-broken'"
                height="18"
              />
            </button>
          </div>
          <span
            v-if="sizeMessage"
            :id="sizeMessageId"
            data-cy="iiif-size-message"
            :role="isMissingDimensions ? 'alert' : 'status'"
            class="flex items-center gap-1.5 font-bold"
            :class="
              isMissingDimensions ? 'text-danger-ink' : 'text-text-secondary'
            "
          >
            <unicon
              :name="
                isMissingDimensions
                  ? 'exclamation-circle'
                  : Unicons.InfoCircle.name
              "
              height="16"
            />{{ sizeMessage }}
          </span>
        </div>

        <div class="flex flex-col gap-2">
          <span class="font-bold text-text-link">{{
            t("iiif-operations-modal.format")
          }}</span>
          <div role="group" :class="segmentedClasses" class="grid-cols-3">
            <button
              v-for="format in availableFormats"
              :key="format"
              type="button"
              data-cy="iiif-format"
              :class="segmentClasses(format === currentFormat)"
              :aria-pressed="format === currentFormat ? 'true' : 'false'"
              @click="currentFormat = format"
            >
              {{ format.toUpperCase() }}
            </button>
          </div>
          <span data-cy="iiif-format-hint" class="text-text-secondary">{{
            t(`iiif-operations-modal.format-hint-${currentFormat}`)
          }}</span>
        </div>
      </div>

      <div
        class="flex items-center gap-2 px-6 pt-3.5 pb-4.5 border-t border-border-subtle"
      >
        <span
          class="flex items-center gap-1 flex-1 min-w-0 text-text-secondary"
          :title="outputFilename"
        >
          <unicon :name="Unicons.FileAlt.name" height="16" class="shrink-0" />
          <span data-cy="iiif-output-name" class="truncate">{{
            outputFilename
          }}</span>
        </span>
        <base-button-new
          class="!w-auto"
          :label="t('iiif-operations-modal.cancel')"
          button-style="secondary"
          @click="closeModal(TypeModals.IiifOperationsModal)"
        />
        <base-button-new
          class="!w-auto"
          :label="t('iiif-operations-modal.download')"
          :icon="DamsIcons.DownloadAlt"
          button-style="commit"
          :disabled="isMissingDimensions"
          :loading="isDownloading"
          @click="downLoadImage"
        />
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import BaseModal from "@/components/base/BaseModal.vue";
import { DamsIcons, TypeModals } from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";
import { computed, ref, useId, watch } from "vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { Unicons } from "@/types";

type Scale = number | "custom";
type Dimension = number | "";

const { closeModal, getModalInfo } = useBaseModal();
const { t } = useI18n();

const modalInfo = computed(() => getModalInfo(TypeModals.IiifOperationsModal));
const { displayErrorNotification, displaySuccessNotification } =
  useBaseNotification();
const fileName = computed<string>(() => modalInfo.value.fileName || "");
const originalFilename = computed<string>(
  () => modalInfo.value.originalFilename || "",
);
const dimensions = computed<{ width: number; height: number } | undefined>(
  () => modalInfo.value.dimensions,
);

const availableScales: Scale[] = [0.25, 0.5, 1.0, "custom"];
const availableFormats = ["jpg", "png", "tif"];
const currentScale = ref<Scale>(1.0);
const currentFormat = ref("jpg");
const isDownloading = ref(false);
const isRatioLocked = ref(true);
const sizeMessageId = useId();

const originalWidth = computed<number>(() => dimensions.value?.width || 1920);
const originalHeight = computed<number>(() => dimensions.value?.height || 1080);

const scaledWidth = ref<Dimension>(originalWidth.value);
const scaledHeight = ref<Dimension>(originalHeight.value);

const segmentedClasses =
  "grid h-10 border border-border-default rounded-input overflow-hidden";
const segmentClasses = (isSelected: boolean) => [
  "font-bold cursor-pointer not-first:border-l not-first:border-border-subtle",
  isSelected
    ? "bg-surface-inverted text-text-on-inverted"
    : "bg-surface text-text-body hover:bg-surface-row-hover",
];

const isMissingDimensions = computed<boolean>(
  () => !scaledWidth.value && !scaledHeight.value,
);

const outputDimensions = computed<{ width: number; height: number }>(() => {
  const width = Number(scaledWidth.value) || 0;
  const height = Number(scaledHeight.value) || 0;
  return {
    width:
      width ||
      Math.floor((originalWidth.value * height) / originalHeight.value),
    height:
      height ||
      Math.floor((originalHeight.value * width) / originalWidth.value),
  };
});

const sizeMessage = computed<string>(() => {
  const { width, height } = outputDimensions.value;
  if (isMissingDimensions.value)
    return t("iiif-operations-modal.missing-dimensions-description");
  if (width > originalWidth.value || height > originalHeight.value)
    return t("iiif-operations-modal.upscaled");
  if (!scaledWidth.value || !scaledHeight.value)
    return t("iiif-operations-modal.calculated", { width, height });
  return "";
});

const outputFilename = computed<string>(() => {
  const filenameWithoutExtension =
    originalFilename.value?.replace(/\.[^/.]*$/, "") || "";
  const { width, height } = outputDimensions.value;
  return `${filenameWithoutExtension}_${width}x${height}.${currentFormat.value}`;
});

const pickScale = (scale: Scale) => {
  currentScale.value = scale;
  if (scale === "custom") return;
  scaledWidth.value = Math.floor(originalWidth.value * scale);
  scaledHeight.value = Math.floor(originalHeight.value * scale);
};

const setDimension = (side: "width" | "height", input: number | string) => {
  const value: Dimension =
    input === "" ? "" : Math.max(0, Math.floor(Number(input)) || 0);
  currentScale.value = "custom";
  if (side === "width") scaledWidth.value = value;
  else scaledHeight.value = value;
  if (!isRatioLocked.value || value === "") return;
  if (side === "width")
    scaledHeight.value = Math.round(
      (value * originalHeight.value) / originalWidth.value,
    );
  else
    scaledWidth.value = Math.round(
      (value * originalWidth.value) / originalHeight.value,
    );
};

const toggleRatioLock = () => {
  isRatioLocked.value = !isRatioLocked.value;
  if (isRatioLocked.value && scaledWidth.value)
    setDimension("width", scaledWidth.value);
};

const downLoadImage = async (): Promise<void> => {
  if (isDownloading.value) return;
  isDownloading.value = true;

  if (isMissingDimensions.value) {
    displayErrorNotification(
      "iiif-operations-modal.missing-dimensions-title",
      "iiif-operations-modal.missing-dimensions-description",
    );
    isDownloading.value = false;
    return;
  }
  const { width, height } = outputDimensions.value;
  scaledWidth.value = width;
  scaledHeight.value = height;

  const url = `/api/iiif/3/${fileName.value}/full/^!${width},${height}/0/default.${currentFormat.value}`;
  const downloadName = outputFilename.value;

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
    displaySuccessNotification(
      t("iiif-operations-modal.downloaded", { filename: downloadName }),
      "",
    );
  } catch (error) {
    console.error("Failed to download resized image", error);
  } finally {
    isDownloading.value = false;
  }
};

watch(
  () => modalInfo.value.open,
  (isOpen: boolean) => {
    if (!isOpen) return;
    currentFormat.value = "jpg";
    isRatioLocked.value = true;
    pickScale(1.0);
  },
);
</script>
