<template>
  <div class="bg-neutral-0 rounded-lg">
    <div
      v-if="label"
      class="flex items-center px-4 py-3 cursor-pointer select-none"
      @click="collapsed = !collapsed"
    >
      <unicon
        :name="collapsed ? Unicons.AngleRight.name : Unicons.AngleDown.name"
        :height="20"
      />
      <h2 class="text-lg font-bold ml-1">{{ t(label) }}</h2>
    </div>

    <div v-if="!collapsed" class="px-2 pb-3">
      <p v-if="!fields.length" class="px-2 py-2 text-sm text-neutral-60">
        {{ t("shacl-shape.no-fields") }}
      </p>
      <metadata-wrapper
        v-for="field in fields"
        :key="field.key"
        class="py-2 px-2"
        :form-id="formId"
        :is-edit="false"
        :metadata="field"
        :show-errors="false"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
// Renders a field set derived from a SHACL shape, read-only.
//
// The fields are not declared in the query: `fieldsKey` names a JSON field on
// the entity holding the shape-derived field set with values already merged in,
// so a view can be generated from a shape rather than listing its properties
// one by one. Adding a property to the shape makes it appear here.
//
// Leaves reuse MetadataWrapper -- the same renderer the ordinary metadata
// panels use -- so a shape-driven view looks like every other detail view.
// Nested shui:DetailsEditor fields are handled by MetadataWrapper's own
// dispatch, keeping this component free of shape semantics.
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import { getMetadataFields } from "@/helpers";
import { PanelType } from "@/generated-types/queries";
import { Unicons } from "@/types";

defineOptions({ name: "EntityElementShaclShape" });

const props = withDefaults(
  defineProps<{
    element: any;
    entity?: any;
    formId: string;
  }>(),
  { entity: undefined },
);

const { t } = useI18n();
const collapsed = ref<boolean>(props.element?.isCollapsed ?? false);
const label = computed<string>(() => props.element?.label ?? "");

const fields = computed<any[]>(() => {
  const key = props.element?.fieldsKey;
  if (!key) return [];
  const fieldSet = props.entity?.[key];
  if (!fieldSet) return [];
  // getMetadataFields accepts a PanelMetaData list and already prefers a value
  // carried on the field over the form store, which is how these render without
  // the query declaring intialValues for each one.
  return getMetadataFields(
    fieldSet,
    PanelType.Metadata,
    props.formId,
  ) as any[];
});
</script>
