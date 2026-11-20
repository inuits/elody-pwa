<template>
  <div
    class="flex items-center gap-3 px-3 py-2 bg-warning-bg border-t border-border-subtle text-table"
    data-cy="duplicate-mediafile-choice"
  >
    <unicon
      :name="Unicons.Copy.name"
      height="16"
      class="fill-warning shrink-0"
    />
    <div class="flex flex-col min-w-0 grow">
      <span class="font-bold text-text-body">
        {{ $t("upload-fields.duplicate.exists") }}
      </span>
      <span class="flex flex-wrap gap-x-3 text-text-light">
        <span class="break-all">{{ duplicate.existingName }}</span>
        <a
          :href="existingHref"
          target="_blank"
          class="inline-flex items-center gap-1 underline text-text-link hover:text-text-link-hover"
        >
          {{ $t("upload-fields.duplicate.open") }}
          <unicon :name="Unicons.ExternalLinkAlt.name" height="12" />
        </a>
      </span>
    </div>
    <div
      role="radiogroup"
      :aria-label="$t('upload-fields.duplicate.exists')"
      class="flex shrink-0 border border-border-default rounded-button overflow-hidden"
    >
      <button
        v-for="option in options"
        :key="option.label"
        type="button"
        role="radio"
        :aria-checked="link === option.link"
        class="flex items-center gap-1 h-8 px-3 cursor-pointer text-text-body"
        :class="
          link === option.link
            ? 'bg-surface font-bold'
            : 'hover:bg-surface-row-hover'
        "
        @click="link = option.link"
      >
        <unicon
          v-if="option.link"
          :name="Unicons.Link.name"
          height="14"
          class="fill-current"
        />
        {{ $t(option.label) }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { Unicons } from "@/types";
import { router } from "@/main";
import type { DuplicateMediafile } from "@/composables/upload/types";

const props = defineProps<{ duplicate: DuplicateMediafile }>();
const link = defineModel<boolean>("link", { required: true });

const options = [
  { link: true, label: "upload-fields.duplicate.link" },
  { link: false, label: "upload-fields.duplicate.skip" },
];

const existingHref = computed(
  () =>
    router.resolve({ path: `/mediafile/${props.duplicate.existingId}` }).href,
);
</script>
