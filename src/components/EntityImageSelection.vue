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
import type { Entity } from "../generated-types/queries";
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
// import draggable from "vuedraggable/src/vuedraggable";

export const toBeDeleted = ref<string[]>([]);

const { getModal } = useAvailableModals();

type MediafileSelectionState = {
  selectedMediafile: MediaFile | undefined;
};

const mediafileSelectionState = reactive<MediafileSelectionState>({
  selectedMediafile: undefined,
});

export const useEntityMediafileSelector = () => {
  const updateSelectedEntityMediafile = (mediafile: MediaFile | undefined) => {
    mediafileSelectionState.selectedMediafile = mediafile;
  };

  const mustShowEntityMediafileSelector = (entity: Entity): boolean => {
    let show = true;
    return show;
  };

  return {
    mediafileSelectionState,
    updateSelectedEntityMediafile,
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
