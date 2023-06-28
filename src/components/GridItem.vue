<template>
  <li class="w-full h-auto bg-grey-200 rounded-md align-middle">
    <div class="absolute right-0 top-0 w-min h-min" data-test="action-slot">
      <slot name="actions"></slot>
    </div>
    <div
      class="flex items-center flex-col w-full"
      :class="{ 'flex-col': small && !thumbIcon }"
    >
      <div class="w-full">
        <div class="flex justify-center items-center">
          <img
            v-if="media"
            class="h-48 w-48 object-cover"
            :src="
              mediaIsLink
                ? media
                : `/api/iiif/3/${media}/square/500,/0/default.jpg`
            "
            @error="setNoImage()"
          />
          <div
            v-if="(thumbIcon && !media) || (imageSrcError && thumbIcon)"
            class="w-48 h-48 flex items-center justify-center flex-col bg-center bg-no-repeat bg-cover"
            style="background-image: url(.jpg)"
          >
            <unicon
              :name="thumbIcon"
              class="h-10 w-10 p-1 text-neutral-70 rounded-sm outline-none shadow-sm self-center"
            />
            <div class="text-neutral-70">No media</div>
          </div>
        </div>
        <div
          class="w-full mt-12 p-4 flex border-t-2 border-neutral-20 bg-neutral-white"
        >
          <div>
            <BaseInputCheckbox
              class="text-center"
              v-model="isChecked"
              :item="{ id: itemId, teaserMetadata: meta }"
              :bulk-operations-context="bulkOperationsContext"
              input-style="accentNormal"
            />
          </div>
          <div class="w-full">
            <div
              v-for="metaItem in only4Meta(meta as MetadataAndRelation[])"
              :key="metaItem ? metaItem.value : 'no-key'"
              class="w-full"
            >
              <template v-if="gridItemInfoKeys.includes(metaItem.key)">
                <div class="flex items-center w-full pl-5">
                  <div class="flex flex-col items-start w-full">
                    <span
                      class="text-neutral-70 w-full metaType handleOverflow"
                      data-test="meta-label"
                      >{{ metaItem.key }}</span
                    >
                    <span
                      class="text-black w-full metaType handleOverflow"
                      :class="{
                        metaTitle: metaItem.key === 'title' || hasFileName,
                      }"
                      data-test="meta-info"
                      >{{ metaItem.value }}</span
                    >
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<script lang="ts">
import type { Maybe, MetadataAndRelation } from "../generated-types/queries";
import { computed, defineComponent, inject, ref } from "vue";
import type { PropType } from "vue";
import { customSort, stringIsUrl } from "../helpers";
import type { Context } from "@/composables/useBulkOperations";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";

export default defineComponent({
  name: "GridItem",
  props: {
    itemId: { type: String, required: false },
    bulkOperationsContext: { type: String as PropType<Context> },
    loading: { type: Boolean, default: false },
    meta: {
      type: Array as PropType<Maybe<Maybe<MetadataAndRelation>[]>>,
      default: () => [],
    },
    media: { type: String, default: "" },
    thumbIcon: { type: String, default: "" },
    small: { type: Boolean, default: false },
    isChecked: { type: Boolean, default: false },
  },
  components: { BaseInputCheckbox },
  setup(props, { emit }) {
    const config: any = inject("config");
    let imageSrcError = false;
    const isChecked = ref(false);
    const setNoImage = () => {
      imageSrcError = true;
    };
    const gridItemInfoKeys: string[] = [
      "id",
      "title",
      "name",
      "type",
      "filename",
    ];
    const hasFileName = ref<boolean>(false);

    const mediaIsLink = computed<Boolean>(() => stringIsUrl(props.media || ""));

    function handleCheckboxChange(event) {
      event.preventDefault();
      isChecked.value = !isChecked.value;
      emit("update:checked", isChecked.value);
    }

    const only4Meta = (input: MetadataAndRelation[]) => {
      const sortOrder: string[] = ["object_number", "type", "title"];

      return customSort(
        sortOrder,
        input?.filter((value) => value?.value !== ""),
        "key"
      );
    };

    return {
      setNoImage,
      imageSrcError,
      only4Meta,
      config,
      hasFileName,
      mediaIsLink,
      gridItemInfoKeys,
      handleCheckboxChange,
      isChecked,
    };
  },
});
</script>

<style lang="postcss" scoped>
.row {
  @apply flex justify-between py-4;
  @apply bg-neutral-0 hover:bg-neutral-10;
  @apply border border-neutral-50 rounded cursor-pointer;
  @apply transition-colors duration-300 hover:shadow-sm;
}
.label {
  @apply rounded text-xs text-neutral-60;
}
.row.loading {
  @apply animate-pulse;
}

.metaTitle {
  @apply font-bold;
}

.handleOverflow {
  width: 95%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: inline-block;
}
</style>
