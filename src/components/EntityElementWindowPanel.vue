<template>
  <div class="border-solid border-neutral-30 border-b-2 p-2">
    <div class="flex items-center justify-between">
      <h2>{{ t(panel.label) }}</h2>
      <div @click="toggleIsCollapsed()" class="cursor-pointer">
        <unicon :name="!isCollapsed ? Unicons.Minus.name : Unicons.Plus.name" />
      </div>
    </div>
    <transition>
      <div v-if="!isCollapsed">
        <div v-if="panelType === PanelType.Relation && relationArray.length">
          <div class="pl-2 rounded-sm bg-accent-light">
            <p class="text-sm text-text-body">Behoort tot</p>
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
            v-for="(metadata, index) in metadatfields"
            v-show="itemMustBeShown(metadata.value)"
            :key="index"
            class="py-2 px-2"
          >
            <entity-element-list
              v-if="metadata.__typename === 'EntityListElement'"
              :label="(metadata.label as string)"
              :isCollapsed="metadata.isCollapsed"
              :types="metadata.entityTypes as string[]"
              :metaKey="metadata.metaKey"
              :entity-list="(metadata.entityList as Entity[]) ?? []"
              :identifiers="identifiers"
              :relationType="metadata.relationType"
              :viewMode="metadata.viewMode"
            />
            <entity-element-metadata-edit
              v-else
              :fieldKey="metadata.key"
              :label="metadata.label as string"
              v-model:value="metadata.value"
              :field="metadata.field"
              :formId="formId"
              :is-edit="isEdit"
              :unit="metadata.unit"
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
} from "@/generated-types/queries";
// import EntityElementMetadata from "@/components/EntityElementMetadata.vue";
import EntityElementMetadataEdit from "@/components/EntityElementMetadataEdit.vue";
import EntityElementRelation from "@/components/EntityElementRelation.vue";
import EntityElementList from "@/components/entityElements/EntityElementList.vue";
import { computed, inject, ref } from "vue";
import { getMetadataFields } from "@/helpers";
import { PanelType } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

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
const { params: routeParams } = useRoute();

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

const metadatfields = computed(() => {
  return getMetadataFields(
    props.panel,
    panelType.value,
    routeParams.id as string
  );
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
