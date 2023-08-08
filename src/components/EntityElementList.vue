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
            :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
            :parent-entity-id="entityId"
            :enable-bulk-operations="true"
            :bulk-operations-context="
              BulkOperationsContextEnum.EntityElementList
            "
            :enable-advanced-filters="false"
            :enable-navigation="false"
            list-item-route-name="SingleEntity"
            :predefined-entities="entityList"
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
import useEntitySingle from "@/composables/useEntitySingle";
import { asString } from "@/helpers";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
import { computed } from "vue";
import { Unicons } from "@/types";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

withDefaults(
  defineProps<{
    isCollapsed: Boolean;
    types: string[];
    label: string;
    entityList: Entity[];
  }>(),
  {
    types: () => [],
  }
);

const { setAcceptedTypes } = useEntityPickerModal();
const { getEntityUuid } = useEntitySingle();
const { getModal } = useAvailableModals();
const { isEdit } = useEditMode();
const { t } = useI18n();

const modal = getModal(TypeModals.EntityPicker);
const entityId = computed(
  () => getEntityUuid() || asString(useRoute().params["id"])
);
</script>
