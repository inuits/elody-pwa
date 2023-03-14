<template>
  <div>
    <entity-element-wrapper label="Assets">
      <template v-slot:actions>
        <div
          v-if="isEdit"
          class="flex items-center text-accent-normal cursor-pointer"
        >
          <unicon height="16" :name="Unicons.PlusCircle.name" />
          <p
            class="underline ml-2"
            @click="openPickEntityModal([Entitytyping.Asset])"
          >
            Voeg assets toe
          </p>
        </div>
      </template>
      <template v-slot:content>
        <div v-for="(field, idx) in fields" :key="field.key">
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
        </div>
      </template>
    </entity-element-wrapper>
  </div>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import { Entitytyping, type RelationValues } from "@/generated-types/queries";
import { useFieldArray, type FieldEntry } from "vee-validate";
import EntityElementWrapper from "./base/EntityElementWrapper.vue";
import { usePickEntityModal } from "./PickEntityModal.vue";
import type { PickEntityModalType } from "./PickEntityModal.vue";
import useEditMode from "@/composables/useEdit";
import { useRouter } from "vue-router";
import { Unicons } from "@/types";

const router = useRouter();
const props = defineProps<{
  RelationKey: string;
}>();
const { isEdit } = useEditMode();

const { fields, push, update } = useFieldArray<RelationValues>(
  props.RelationKey
);

const remove = (idx: number, field: FieldEntry<RelationValues>) => {
  update(idx, { ...field.value, toBeDeleted: true });
};

const revertRemove = (idx: number, field: FieldEntry<RelationValues>) => {
  update(idx, { ...field.value, toBeDeleted: false });
};

const { openPickEntityModal, pickEntityModalState } = usePickEntityModal();

//Picke entity modal needs to be refactored
watch(pickEntityModalState, (value: PickEntityModalType) => {
  //@ts-ignore
  if (value.pickedEntity && value.pickedEntity.teaserMetadata) {
    push({
      id: value.pickedEntity.id,
      //@ts-ignore
      teaserMetadata: [...value.pickedEntity.teaserMetadata],
      relationType: "components",
      toBeDeleted: false,
    });
  }
});
</script>
