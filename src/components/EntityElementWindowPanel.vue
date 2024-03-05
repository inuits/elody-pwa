<template>
  <div class="border-solid border-neutral-30 border-b-2 p-2">
    <div
      @click="toggleIsCollapsed()"
      class="flex items-center justify-between cursor-pointer"
    >
      <h2>{{ t(panel.label) }}</h2>
      <div>
        <unicon :name="!isCollapsed ? Unicons.Minus.name : Unicons.Plus.name" />
      </div>
    </div>
    <transition>
      <div v-show="!isCollapsed">
        <div v-if="panelType === PanelType.Relation && relationArray.length">
          <div class="pl-2 rounded-sm bg-accent-light">
            <p class="text-sm text-text-body">{{ t("entity.belongs-to") }}</p>
            <div class="rounded-sm border-solid border-neutral-30 border-2">
              <div
                v-for="(relation, index) in relationArray"
                :key="index"
                class="bg-neutral-white py-2"
              >
                <entity-element-relation :relation="relation" />
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div
            v-for="(metadata, index) in metadatafields"
            v-show="itemMustBeShown(metadata.value)"
            :key="index"
            class="py-2 px-2"
          >
            <metadata-wrapper
              v-if="
                metadata.__typename !== 'EntityListElement' ||
                metadata.basicBaseLibrary
              "
              :form-id="formId"
              :is-edit="isEdit"
              v-model:metadata="metadata as MetadataField"
              :basic-base-library-as-value="metadata.basicBaseLibrary"
            />
            <entity-element-list
              v-if="metadata.__typename === 'EntityListElement'"
              :label="(metadata.label as string)"
              :isCollapsed="metadata.isCollapsed"
              :types="metadata.entityTypes as string[]"
              :entity-list="(metadata.entityList as Entity[]) ?? []"
              :identifiers="identifiers"
              :relationType="metadata.relationType"
              :viewMode="metadata.viewMode"
              :custom-query="metadata.customQuery"
              :custom-query-relation-type="metadata.customQueryRelationType"
              :custom-query-filters="metadata.customQueryFilters"
              :search-input-type="metadata.searchInputType"
              :basic-base-library="metadata.basicBaseLibrary"
              class="pt-2"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import type {
  PanelRelation,
  WindowElementPanel,
  Entity,
  MetadataField,
} from "@/generated-types/queries";
import EntityElementRelation from "@/components/EntityElementRelation.vue";
import EntityElementList from "@/components/entityElements/EntityElementList.vue";
import { computed, inject, ref } from "vue";
import { getMetadataFields } from "@/helpers";
import { PanelType } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";

const props = defineProps<{
  panel: WindowElementPanel;
  identifiers: string[];
  isEdit: boolean;
  formId: string;
}>();

const { t } = useI18n();
const panelType = ref<PanelType>(props.panel.panelType);
const isCollapsed = ref<boolean>(props.panel.isCollapsed);
const config = inject("config") as any;

const itemMustBeShown = (value: any): boolean => {
  if (config.customization.hideEmptyFields === true && !value) return false;
  return true;
};

const toggleIsCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};

const relationArray = computed((): PanelRelation[] => {
  let returnArray: PanelRelation[] = [];
  Object.values(props.panel).forEach((value) => {
    if (typeof value === "object") {
      const relationList = value as [PanelRelation];
      try {
        if (!relationList.length) {
          throw Error("Value can not be spread");
        }
        returnArray.push(...relationList);
      } catch (e) {
        returnArray = relationList;
      }
    }
  });
  return returnArray;
});

const metadatafields = computed(() => {
  return getMetadataFields(props.panel, panelType.value, props.formId);
});
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: transform 0.5s ease;
  transform-origin: top;
}

.v-enter-from,
.v-leave-to {
  transform: scaleY(0%);
  transform-origin: top;
}
</style>
