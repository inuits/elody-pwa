<template>
  <div
    v-if="!loading && mediafileSelectionState.mediafiles.length > 0"
    class="flex h-auto"
    :class="{ 'animate-pulse bg-neutral-20 text-neutral-20': loading }"
  >
    <div
      class="flex flex-col w-full h-full items-center bg-neutral-0 border-neutral-30 border-solid border-2 rounded-t-md"
    >
      <div class="w-full h-full px-2">
        <div class="flex items-center justify-between w-full my-1">
          <h3 class="subtitle text-text-body">Media</h3>
          <div
            class="flex items-center cursor-pointer"
            @click="toggleIsCollapsed()"
          >
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
            <div
              v-for="mediafile in mediafileSelectionState.mediafiles"
              :key="mediafile.id"
            >
              <EntityImageSelectionItem :mediafile="mediafile" />
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import EntityImageSelectionItem from "@/components/EntityImageSelectionItem.vue";
import { ref } from "vue";
import { Unicons } from "@/types";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

defineProps<{
  loading: boolean;
}>();

const { mediafileSelectionState } = useEntityMediafileSelector();
const isCollapsed = ref<boolean>(false);

const toggleIsCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>
