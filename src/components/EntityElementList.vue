<template>
  <div>
    <entity-element-wrapper :label="label" :isCollapsed="isCollapsed">
      <template v-slot:actions>
        <div
          v-if="isEdit"
          class="flex items-center text-accent-normal cursor-pointer"
        >
          <unicon height="16" :name="Unicons.PlusCircle.name" />
          <p
            class="underline"
            @click="openPickEntityModal([Entitytyping.Asset])"
          >
            Voeg assets toe
          </p>
        </div>
      </template>
      <template v-slot:content>
        <div v-if="!isCollapsed" class="ml-1 bg-neutral-lightest">
          <base-library
            list-item-route-name="SingleAsset"
            :is-hide-filters="true"
            :predefined-entities="entitiesObject"
            :enable-selection="true"
            bulk-operations-context="entitiesPage"
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
import { ref, watch } from "vue";
import {
  Entitytyping,
  type Asset,
  type Entity,
  type RelationValues,
} from "@/generated-types/queries";
import { useFieldArray, type FieldEntry } from "vee-validate";
import EntityElementWrapper from "./base/EntityElementWrapper.vue";
import { usePickEntityModal } from "./PickEntityModal.vue";
import type { PickEntityModalType } from "./PickEntityModal.vue";
import useEditMode from "@/composables/useEdit";
import { useRouter } from "vue-router";
import { Unicons } from "@/types";
import BaseLibrary, { type PredefinedEntities } from "./base/BaseLibrary.vue";
import { useEntityElementCollapseHelper } from "@/composables/useResizeHelper";

const router = useRouter();
const props = defineProps<{
  label: string;
  RelationKey: string;
  isCollapsed: Boolean;
}>();
const { isEdit } = useEditMode();
const { toggleElementCollapse } = useEntityElementCollapseHelper();

const { fields, push, update, remove } = useFieldArray<Asset>(
  props.RelationKey
);

let entitiesObject = ref<PredefinedEntities>({
  usePredefinedEntities: true,
  entities: [],
});

// const remove = (idx: number, field: FieldEntry<RelationValues>) => {
//   update(idx, { ...field.value, toBeDeleted: true });
// };

// const revertRemove = (idx: number, field: FieldEntry<RelationValues>) => {
//   update(idx, { ...field.value, toBeDeleted: false });
// };

const syncFieldWithObject = (fields: any) => {
  entitiesObject.value.entities = fields.value.map(
    (field: FieldEntry<Asset>) => field.value
  );
};

const { openPickEntityModal, pickEntityModalState } = usePickEntityModal();

//Picke entity modal needs to be refactored
watch(pickEntityModalState, (value: PickEntityModalType) => {
  //@ts-ignore
  if (value.pickedEntity && value.pickedEntity.teaserMetadata) {
    const entity = JSON.parse(JSON.stringify(value.pickedEntity));
    push(entity);
    syncFieldWithObject(fields);

    if (props.isCollapsed) {
      toggleElementCollapse(props.label);
    }
  }
});

document.addEventListener("discard", () => {
  // TODO: Refetch related assets
  fields.value.forEach((field: FieldEntry<Asset>, idx: number) => {
    remove(idx);
    syncFieldWithObject(fields);
  });
});
</script>
