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
              modal.openModal();
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
              BulkOperationsContextEnum.EntityElementList
            "
            :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
            :enable-advanced-filters="false"
            :enable-bulk-operations="true"
            :enable-navigation="false"
            :parent-entity-identifiers="identifiers"
            :filter-type="types[0]"
            list-item-route-name="SingleEntity"
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
  type Entitytyping,
  type Entity,
} from "@/generated-types/queries";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import useEditMode from "@/composables/useEdit";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
import { Unicons } from "@/types";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { useI18n } from "vue-i18n";

withDefaults(
  defineProps<{
    isCollapsed: Boolean;
    types: string[];
    label: string;
    entityList: Entity[];
    identifiers: string[];
  }>(),
  {
    types: () => [],
  }
);

const { setAcceptedTypes } = useEntityPickerModal();
const { getModal } = useAvailableModals();
const { isEdit } = useEditMode();
const { t } = useI18n();

const modal = getModal(TypeModals.EntityPicker);
</script>
