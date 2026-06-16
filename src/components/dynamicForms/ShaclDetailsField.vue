<template>
  <div
    class="border border-[rgba(0,58,82,0.3)] rounded-lg p-3 bg-background-light"
  >
    <button
      type="button"
      class="flex items-center gap-2 w-full text-left font-semibold text-text-body"
      @click="open = !open"
    >
      <span
        class="inline-block transition-transform text-xs"
        :class="{ 'rotate-90': open }"
        >▶</span
      >
      {{ t(field.label) }}
    </button>
    <div
      v-show="open"
      class="mt-3 pl-3 border-l border-l-[rgba(0,58,82,0.15)] space-y-2"
    >
      <template v-for="sub in subFields" :key="sub.key">
        <!-- nested shui:DetailsEditor -> recurse -->
        <ShaclDetailsField
          v-if="isDetails(sub)"
          :field="toPanel(sub)"
          :form-id="formId"
          :show-errors="showErrors"
        />
        <!-- leaf -> native Elody metadata field (binds to intialValues.<dotted.key>) -->
        <metadata-wrapper
          v-else
          :form-id="formId"
          :metadata="toPanel(sub)"
          :is-edit="true"
          form-flow="create"
          :show-errors="showErrors"
          :is-used-in-modal="true"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";

// Renders a SHACL 1.2 UI shui:DetailsEditor as a collapsible nested sub-form.
// Leaf properties reuse the native metadata-wrapper; nested details recurse.
defineOptions({ name: "ShaclDetailsField" });

const props = defineProps<{
  field: any;
  formId: string;
  showErrors?: boolean;
}>();

const { t } = useI18n();
const open = ref(true);

const subFields = computed<any[]>(() => props.field?.inputField?.subFields ?? []);

const isDetails = (sub: any): boolean =>
  sub?.inputField?.isDetailsEditor === true;

// SubField -> PanelMetaData shape so metadata-wrapper / recursion can consume it
const toPanel = (sub: any) => ({ ...sub, __typename: "PanelMetaData" });
</script>
