<template>
  <div
    v-if="!loading && mediafiles.length > 0"
    :class="[
      'flex h-auto' +
        {
          'animate-pulse bg-neutral-20 text-neutral-20': loading,
        },
    ]"
  >
    <div
      :class="[
        'flex flex-col w-full h-full items-center bg-neutral-0 border-neutral-30 border-solid border-2 rounded-t-md',
      ]"
    >
      <div class="w-full h-full px-2">
        <div class="flex items-center justify-between w-full">
          <h3 class="subtitle">Media</h3>
          <div class="cursor-pointer" @click="toggleIsCollapsed()">
            <unicon
              :name="
                !isCollapsed ? Unicons.AngleUp.name : Unicons.AngleDown.name
              "
            />
          </div>
        </div>
        <transition>
          <div
            v-if="!isCollapsed"
            class="flex flex-col w-full items-center mt-2 overflow-y-auto"
          >
            <!-- <draggable
        v-model="mediafiles"
        item-key="mediafiles-container"
        class="sortable"
        :disabled="!setDraggable()"
        @end="endDrag"
      > -->
            <div v-for="element in mediafiles" :key="element._id">
              <EntityImageSelectionItem
                v-if="mediafiles.length"
                :element="element"
                :selected-image="selectedImage"
              />
            </div>
          </div>
        </transition>
      </div>
      <div :class="editMode === 'edit' ? 'pb-20 pt-5' : ''">
        <plus-circle-icon
          v-if="editMode === 'edit'"
          @click="openUploadModalWrapper()"
        />
      </div>
    </div>
    <BaseExpandButton :is-hidden="isCollapsed" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, reactive } from "vue";
import type { PropType } from "vue";
import type { Entity, Media } from "../generated-types/queries";
import type { MediaFile } from "../generated-types/queries";
import PlusCircleIcon from "../components/base/PlusCircleIcon.vue";
import useDropzoneHelper from "../composables/useDropzoneHelper";
import useMetaDataHelper from "../composables/useMetaDataHelper";
import useMediafilesOrderHelpers from "../composables/useMediafilesOrderHelpers";
import useUploadModal, { modalChoices } from "@/composables/useUploadModal";
import BaseExpandButton from "./base/BaseExpandButton.vue";
import useEditMode from "@/composables/useEdit";
import { Unicons } from "@/types";
import EntityImageSelectionItem from "./EntityImageSelectionItem.vue";
import { useAvailableModals } from "@/composables/useAvailableModals";
// import draggable from "vuedraggable/src/vuedraggable";

export const toBeDeleted = ref<string[]>([]);

const { getModal } = useAvailableModals();

type MediafileSelectionState = {
  mediafiles: [MediaFile] | [];
  selectedMediafile: MediaFile | undefined;
};

const mediafileSelectionState = reactive<MediafileSelectionState>({
  mediafiles: [],
  selectedMediafile: undefined,
});

export const useEntityMediafileSelector = () => {
  const setEntityMediafiles = (mediafiles: [MediaFile]) => {
    mediafileSelectionState.mediafiles = mediafiles;
  };

  const updateSelectedEntityMediafile = (mediafile: MediaFile | undefined) => {
    mediafileSelectionState.selectedMediafile = mediafile;
  };

  const getCurrentlySelectedMediafileIndex = (): number | undefined => {
    let index = undefined;
    try {
      if (
        mediafileSelectionState.mediafiles.length == 0 ||
        !mediafileSelectionState.selectedMediafile
      ) {
        throw Error(
          "Mediafile array is empty or there is currently no mediafile selected"
        );
      }
      index = mediafileSelectionState.mediafiles.indexOf(
        mediafileSelectionState.selectedMediafile
      );
    } catch (e) {
      console.log(e);
    }
    return index;
  };

  const selectMediafileByIndex = (index: number): MediaFile | undefined => {
    try {
      if (mediafileSelectionState.mediafiles.length < index || index < 0) {
        throw Error("This index does not exist");
      }
      mediafileSelectionState.selectedMediafile =
        mediafileSelectionState.mediafiles[index];
    } catch (e) {
      console.log(e);
    }
    return mediafileSelectionState.selectedMediafile;
  };

  const selectNextMediafile = () => {
    try {
      const currentIndex = getCurrentlySelectedMediafileIndex();
      if (!currentIndex) {
        throw Error("Currently no mediafile selected");
      }

      const nextIndex = currentIndex + 1;
      if (nextIndex > mediafileSelectionState.mediafiles.length) {
        selectMediafileByIndex(0);
      } else {
        selectMediafileByIndex(nextIndex);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const selectPreviousMediafile = () => {
    try {
      const currentIndex = getCurrentlySelectedMediafileIndex();
      if (!currentIndex) {
        throw Error("Currently no mediafile selected");
      }

      const previousIndex = currentIndex - 1;
      if (previousIndex < 0) {
        selectMediafileByIndex(mediafileSelectionState.mediafiles.length);
      } else {
        selectMediafileByIndex(previousIndex);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const mustShowEntityMediafileSelector = (entity: Entity): boolean => {
    let show = true;
    return show;
  };

  return {
    mediafileSelectionState,
    setEntityMediafiles,
    updateSelectedEntityMediafile,
    getCurrentlySelectedMediafileIndex,
    selectMediafileByIndex,
    selectNextMediafile,
    selectPreviousMediafile,
    mustShowEntityMediafileSelector,
  };
};

export default defineComponent({
  name: "EntityImageSelection",
  components: {
    PlusCircleIcon,
    // draggable,
    BaseExpandButton,
    EntityImageSelectionItem,
  },
  props: {
    selectedImage: {
      type: Object as PropType<MediaFile | null>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["expandMedialist"],
  setup(props, { emit }) {
    const { selectedFiles } = useDropzoneHelper();
    const { mediafiles, beingAdded } = useMetaDataHelper();
    const { updateSelectedEntityMediafile } = useEntityMediafileSelector();
    const { openUploadModal } = useUploadModal();
    const { editMode } = useEditMode();
    const isCollapsed = ref<boolean>(false);

    const { compareMediafileOrder } = useMediafilesOrderHelpers();

    const toggleIsCollapsed = () => {
      isCollapsed.value = !isCollapsed.value;
    };

    onMounted(() => {
      if (props.selectedImage) {
        updateSelectedEntityMediafile(props.selectedImage);
      }
    });

    const endDrag = () => {
      compareMediafileOrder(mediafiles.value);
    };

    const setDraggable = (): boolean => {
      if (editMode.value === "edit") {
        return true;
      } else {
        return false;
      }
    };

    const openUploadModalWrapper = () => {
      beingAdded.value = "mediafile";
      openUploadModal(modalChoices.DROPZONE);
    };

    return {
      toggleIsCollapsed,
      openUploadModalWrapper,
      modalChoices,
      selectedFiles,
      endDrag,
      setDraggable,
      mediafiles,
      Unicons,
      isCollapsed,
      editMode,
    };
  },
});
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  overflow: hidden;
  transition: transform 0.2s linear;
  transform-origin: top;
}

.v-enter-from,
.v-leave-to {
  transform: scaleY(0);
}

.sortable-drag {
  opacity: 0;
}
</style>
