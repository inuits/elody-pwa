<template>
  <div
    class="absolute w-full bg-neutral-0 z-[5] p-2 shadow-sm flex justify-between h-10"
  >
    <div>
      <a ref="fullPageRef" class="mr-2 ml-2">
        <unicon
          :name="Unicons.Desktop.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </a>
      <a ref="zoomInRef" class="mr-2"
        ><unicon
          :name="Unicons.SearchPlus.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
      /></a>
      <a ref="zoomOutRef">
        <unicon
          :name="Unicons.SearchMinus.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </a>
      <a v-if="mediafileId" @click="downloadImage" :download="true">
        <unicon
          :name="Unicons.Download.name"
          height="20"
          class="text-neutral-700 cursor-pointer ml-1"
        />
      </a>
    </div>
    <div>
      <a @click="() => {
        const id = selectPreviousMediafile(mediafileViewerContext);
        if (id) togglePreviewComponent(id);
      }">
        <unicon
          :name="Unicons.ArrowCircleLeft.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </a>
      <a @click="() => {
        const id = selectNextMediafile(mediafileViewerContext);
        if (id) togglePreviewComponent(id);
      }">
        <unicon
          :name="Unicons.ArrowCircleRight.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </a>
    </div>
    <a ref="homeRef" class="text-sm mr-2 text-neutral-700 cursor-pointer">{{
      $t("entity.reset-viewer")
    }}</a>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { type PropType, inject } from "vue";
import { Unicons } from "../types";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

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
  emits: ["update:zoomIn", "update:zoomOut", "update:fullPage", "update:home", "togglePreviewComponent:entityId"],
  setup: (_props, { emit }) => {
    const zoomInRef = ref<HTMLDivElement | undefined>(undefined);
    const zoomOutRef = ref<HTMLDivElement | undefined>(undefined);
    const fullPageRef = ref<HTMLDivElement | undefined>(undefined);
    const homeRef = ref<HTMLDivElement | undefined>(undefined);
    const { selectNextMediafile, selectPreviousMediafile } =
      useEntityMediafileSelector();
    const mediafileViewerContext: any = inject("mediafileViewerContext");

    onMounted(() => {
      emit("update:zoomIn", zoomInRef.value);
      emit("update:zoomOut", zoomOutRef.value);
      emit("update:fullPage", fullPageRef.value);
      emit("update:home", homeRef.value);
    });

    const downloadImage = async () => {
      if (!_props.mediafileId)
        throw Error(
          `Could not download madiafile with id "${_props.mediafileId}"`
        );

      const imageUrl = await fetch(
        `/api/mediafiles/${_props.mediafileId}/download`, {
          headers: {
            'Accept': 'image/jpeg'
          }
        }
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
    }

    return {
      Unicons,
      zoomInRef,
      zoomOutRef,
      fullPageRef,
      homeRef,
      mediafileViewerContext,
      downloadImage,
      selectNextMediafile,
      selectPreviousMediafile,
      togglePreviewComponent,
    };
  },
});
</script>
