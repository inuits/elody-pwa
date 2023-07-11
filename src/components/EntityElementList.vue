<template>
  <div>
    <entity-element-wrapper :label="label" :isCollapsed="isCollapsed">
      <template v-slot:actions>
        <div
          v-if="isEdit"
          class="flex items-center text-text-subtitle cursor-pointer"
        >
          <unicon height="16" :name="Unicons.PlusCircle.name" />
          <p class="underline" @click="openPickEntityModal(types, metaKey)">
            {{ t("library.add") }}
          </p>
        </div>
      </template>
      <template v-slot:content>
        <div v-if="!isCollapsed" class="ml-1 bg-neutral-lightest">
          <base-library
            :enable-advanced-filters="false"
            list-item-route-name="SingleEntity"
            :is-hide-filters="true"
            :predefined-entities="entitiesObject"
            :enable-bulk-operations="false"
            :bulk-operations-context="route.name as Context"
          />
        </div>
        <!-- <div v-for="(field, idx) in fields" :key="field.key">
          <span
            @click="
              router.push({
                name: 'SingleEntity',
                params: { id: field.value.id },
              })
            "
            >{{ field.value.teaserMetadata[0]?.value }}</span
          >
          <span
            v-if="isEdit && !field.value.toBeDeleted"
            class="underline ml-2"
            @click="remove(idx, field)"
            >delete</span
          >
          <span
            v-if="isEdit && field.value.toBeDeleted"
            class="underline ml-2"
            @click="revertRemove(idx, field)"
            >undo delete</span
          >
        </div> -->
      </template>
    </entity-element-wrapper>
  </div>
</template>

<script lang="ts" setup>
import type { Context } from "@/composables/useBulkOperations";
import type { Entity } from "@/generated-types/queries";
import BaseLibrary from "@/components/base/BaseLibrary.vue";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import useEditMode from "@/composables/useEdit";
import { computed } from "vue";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import { usePickEntityModal } from "@/components/PickEntityModal.vue";
import { useRoute } from "vue-router";

const route = useRoute();
const props = defineProps<{
  label: string;
  RelationKey: string;
  isCollapsed: Boolean;
  types: String[];
  metaKey: String;
  entityList: Entity[];
}>();
const { isEdit } = useEditMode();
const { t } = useI18n();

const entitiesObject = computed(() => {
  return { usePredefinedEntities: true, entities: props.entityList || [] };
});

const { openPickEntityModal } = usePickEntityModal();
</script>
