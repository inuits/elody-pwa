<template>
  <div
    class="absolute w-full bg-neutral-0 z-[5] p-2 shadow-sm flex justify-between items-center h-10"
  >
    <div class="pt-[10px]">
      <button ref="fullPageRef" class="mr-2 ml-2">
        <unicon
          :name="Unicons.Desktop.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </button>
      <button ref="zoomInRef" class="mr-2">
        <unicon
          :name="Unicons.SearchPlus.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </button>
      <button ref="zoomOutRef">
        <unicon
          :name="Unicons.SearchMinus.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </button>
      <button v-if="mediafileId" @click="downloadImage">
        <unicon
          :name="Unicons.Download.name"
          height="20"
          class="text-neutral-700 cursor-pointer ml-1"
        />
      </button>
    </div>
    <div v-if="viewerContainsMultipleMediafiles">
      <button
        @click="
          () => {
            const id = selectPreviousMediafile(mediafileViewerContext);
            if (id) togglePreviewComponent(id);
          }
        "
      >
        <unicon
          :name="Unicons.ArrowCircleLeft.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </button>
      <button
        @click="
          () => {
            const id = selectNextMediafile(mediafileViewerContext);
            if (id) togglePreviewComponent(id);
          }
        "
      >
        <unicon
          :name="Unicons.ArrowCircleRight.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </button>
    </div>
    <div>
      <button class="mr-2 pt-[10px]" @click="openIiifOperationsModal">
        <unicon
          :name="Unicons.ImageResizeLandscape.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </button>
      <button
        ref="homeRef"
        class="text-sm mr-2 text-neutral-700 cursor-pointer"
      >
        {{ $t("entity.reset-viewer") }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  inject,
  onMounted,
  type PropType,
  ref,
} from "vue";
import { Unicons } from "../types";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useBaseModal } from "@/composables/useBaseModal";
import { ModalStyle, TypeModals } from "@/generated-types/queries";

export default defineComponent({
  name: "ViewerToolbar",
  components: {},
  props: {
    zoomIn: {
      type: Object as PropType<HTMLDivElement | string | null>,
      default: null,
    },
    zoomOut: {
      type: Object as PropType<HTMLDivElement | string | null>,
      default: null,
    },
    fullPage: {
      type: Object as PropType<HTMLDivElement | string | null>,
      default: null,
    },
    home: {
      type: Object as PropType<HTMLDivElement | string | null>,
      default: null,
    },
    originalFilename: {
      type: String,
      default: "",
    },
    mediafileId: {
      type: String,
      default: "",
    },
  },
  emits: [
    "update:zoomIn",
    "update:zoomOut",
    "update:fullPage",
    "update:home",
    "togglePreviewComponent:entityId",
  ],
  setup: (_props, { emit }) => {
    const zoomInRef = ref<HTMLDivElement | undefined>(undefined);
    const zoomOutRef = ref<HTMLDivElement | undefined>(undefined);
    const fullPageRef = ref<HTMLDivElement | undefined>(undefined);
    const homeRef = ref<HTMLDivElement | undefined>(undefined);
    const {
      mediafileSelectionState,
      selectNextMediafile,
      selectPreviousMediafile,
    } = useEntityMediafileSelector();
    const mediafileViewerContext: any = inject("mediafileViewerContext");
    const { openModal } = useBaseModal();

    onMounted(() => {
      emit("update:zoomIn", zoomInRef.value);
      emit("update:zoomOut", zoomOutRef.value);
      emit("update:fullPage", fullPageRef.value);
      emit("update:home", homeRef.value);
    });

    const viewerContainsMultipleMediafiles = computed(
      () =>
        mediafileSelectionState.value[mediafileViewerContext].mediafiles
          .length > 1,
    );

    const downloadImage = async () => {
      if (!_props.mediafileId)
        throw Error(
          `Could not download madiafile with id "${_props.mediafileId}"`,
        );

      const imageUrl = await fetch(
        `/api/mediafiles/${_props.mediafileId}/download`,
        {
          headers: {
            Accept: "image/jpeg",
          },
        },
      );
      const image = await fetch(await imageUrl.text());
      const blob = await image.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${_props.originalFilename}`;
      link.click();
      URL.revokeObjectURL(url);
    };

    const togglePreviewComponent = (id: string): void => {
      emit("togglePreviewComponent:entityId", id);
    };

    const openIiifOperationsModal = () => {
      openModal(TypeModals.IiifOperationsModal, ModalStyle.Center);
    };

    return {
      Unicons,
      zoomInRef,
      zoomOutRef,
      fullPageRef,
      homeRef,
      mediafileViewerContext,
      downloadImage,
      viewerContainsMultipleMediafiles,
      selectNextMediafile,
      selectPreviousMediafile,
      togglePreviewComponent,
      openIiifOperationsModal,
    };
  },
});
</script>
