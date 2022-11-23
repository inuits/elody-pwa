<template>
  <div
    v-for="item in metadata"
    :key="item.label"
    class="flex flex-col mb-2 mt-2"
  >
    <div
      v-if="item.label"
      class="label"
      :class="{ loading }"
      data-test="meta-label"
    >
      {{ checkTranslationForlabel(item.label) }}
    </div>
    <div v-else-if="item.label != item.key" class="label" :class="{ loading }">
      {{ $t("meta.no-label") }}
    </div>

    <meta-viewline-relation v-if="item.linkedEntity" :metadata="item" />

    <div
      v-if="!item.linkedEntity"
      class="value"
      :class="{ loading }"
      data-test="meta-info"
    >
      <p v-if="item.value && !stringIsUrl(item.value)">{{ item.value }}</p>
      <a
        v-else-if="item.value && stringIsUrl(item.value)"
        :href="item.value"
        target="_blank"
        class="underline"
        >{{ item.value }}</a
      >
      <p v-else>{{ $t("meta.no-data") }}</p>
    </div>
  </div>
  <div
    v-if="metadata.length == 0"
    class="justify-left items-center flex text-sm text-red-default"
  ></div>
</template>

<script lang="ts">
import type { MetadataAndRelation, MetadataRelation } from "../queries";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { Unicons } from "../types";
import MetaViewlineRelation from "./MetaViewlineRelation.vue";
import { stringIsUrl } from "@/helpers";

export default defineComponent({
  name: "MetaViewLine",
  components: { MetaViewlineRelation },
  props: {
    loading: { type: Boolean, default: false },
    metadata: {
      type: Array as PropType<MetadataAndRelation[]>,
      required: false,
      default: () => [],
    },
  },
  setup() {
    const router = useRouter();
    const { t } = useI18n();

    const checkTranslationForlabel = (input: string) => {
      const translationKey = `metadata.${input}`;
      const translation = t(translationKey);

      return translation === translationKey ? input : translation;
    };

    return {
      t,
      router,
      Unicons,
      checkTranslationForlabel,
      stringIsUrl,
    };
  },
});
</script>

<style lang="postcss" scoped>
.label {
  @apply rounded text-xs text-neutral-60;
}
.value {
  @apply rounded text-sm text-neutral-700 mt-0.5;
}
.label.loading,
.value.loading {
  @apply bg-neutral-20 text-neutral-20;
}
</style>
