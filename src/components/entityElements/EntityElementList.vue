<template>
  <div>
    <entity-element-wrapper :label="label" :isCollapsed="isCollapsed">
      <template v-slot:actions>
        <div
          v-if="isEdit"
          class="flex items-center text-text-subtitle cursor-pointer"
        >
          <unicon height="16" :name="Unicons.PlusCircle.name" />
          <p
            class="underline"
            @click="() => {
              setAcceptedTypes(types as Entitytyping[]);
              setRelationType(relationType);
              openModal(TypeModals.EntityPicker, undefined, 'right')
            }"
          >
            {{ t("library.add") }}
          </p>
        </div>
      </template>
      <template v-slot:content>
        <div v-if="!isCollapsed" class="ml-1 bg-neutral-lightest">
          <BaseLibrary
            class="flex-1"
            :bulk-operations-context="
              createCustomContext(
                BulkOperationsContextEnum.EntityElementList + relationType
              )
            "
            :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
            :enable-advanced-filters="false"
            :enable-bulk-operations="true"
            :enable-navigation="false"
            :parent-entity-identifiers="identifiers"
            :filter-type="types[0]"
            list-item-route-name="SingleEntity"
            :relation-type="relationType"
            :has-sticky-bars="false"
          />
        </div>
      </template>
    </entity-element-wrapper>
  </div>
</template>

<script lang="ts" setup>
import {
  SearchInputType,
  TypeModals,
  EntityListViewMode,
  type Entitytyping,
  type Entity,
} from "@/generated-types/queries";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import useEditMode from "@/composables/useEdit";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
  type InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import { Unicons } from "@/types";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";
import { watch } from "vue";
import { useFormHelper } from "@/composables/useFormHelper";

const { addRelations } = useFormHelper();
const { createCustomContext } = useBulkOperations();

const props = withDefaults(
  defineProps<{
    isCollapsed: Boolean;
    types: string[];
    label: string;
    entityList: Entity[];
    identifiers: string[];
    relationType: string;
    viewMode?: EntityListViewMode;
  }>(),
  {
    types: () => [],
    viewMode: EntityListViewMode.Library,
  }
);

watch(
  () => props.entityList,
  () => {
    if (props.entityList.length > 0) {
      updateRelationForm(props.entityList);
    }
  }
);

const updateRelationForm = (newTags: String[]) => {
  if (typeof newTags == "string") {
    return;
  }
  const InBulkProcessableItems: InBulkProcessableItem = newTags.map((str) => ({
    id: str,
  }));
  setRelationType(props.relationType);
  addRelations(InBulkProcessableItems);
};

const { setAcceptedTypes, setRelationType } = useEntityPickerModal();
const { openModal } = useBaseModal();
const { isEdit } = useEditMode();
const { t } = useI18n();
</script>
