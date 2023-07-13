<template>
  <div
    class="absolute w-11/12 bg-neutral-0 z-[5] mx-4 mt-7 p-2 shadow-sm flex justify-between h-10"
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
      <a v-if="downloadLocation" @click="downloadImage">
        <unicon
          :name="Unicons.Download.name"
          height="20"
          class="text-neutral-700 cursor-pointer ml-1"
        />
      </a>
    </div>
    <div>
      <a @click="selectPreviousMediafile()">
        <unicon
          :name="Unicons.ArrowCircleLeft.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </a>
      <a @click="selectNextMediafile()">
        <unicon
          :name="Unicons.ArrowCircleRight.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </a>
    </div>
    <a ref="homeRef" class="text-sm mr-2 text-neutral-700 cursor-pointer">{{
      $t("upload.reset")
    }}</a>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import type { PropType } from "vue";
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
    downloadLocation: {
      type: String,
      default: "",
    },
  },
  emits: ["update:zoomIn", "update:zoomOut", "update:fullPage", "update:home"],
  setup: (_props, { emit }) => {
    const zoomInRef = ref<HTMLDivElement | undefined>(undefined);
    const zoomOutRef = ref<HTMLDivElement | undefined>(undefined);
    const fullPageRef = ref<HTMLDivElement | undefined>(undefined);
    const homeRef = ref<HTMLDivElement | undefined>(undefined);
    const { selectNextMediafile, selectPreviousMediafile } =
      useEntityMediafileSelector();

    onMounted(() => {
      emit("update:zoomIn", zoomInRef.value);
      emit("update:zoomOut", zoomOutRef.value);
      emit("update:fullPage", fullPageRef.value);
      emit("update:home", homeRef.value);
    });

    const downloadImage = () => {
      if (_props.downloadLocation) {
        window.open(_props.downloadLocation, "_blank");
      }
    };

    return {
      Unicons,
      zoomInRef,
      zoomOutRef,
      fullPageRef,
      homeRef,
      downloadImage,
      selectNextMediafile,
      selectPreviousMediafile,
    };
  },
});
</script>
