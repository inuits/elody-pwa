<template>
  <span v-if="label" class="ml-1 text-neutral-700 text-sm">{{ label }}</span>
  <div>
    <div
      v-if="!fields || fields.length === 0"
      class="ml-1 text-neutral-100 text-sm italic pb-2"
    >
      {{ $t("partials.no") }} {{ label }} {{ $t("partials.available") }}.
    </div>
    <div v-for="({ value, key }, idx) in fields" :key="key" class="my-2">
      <div
        :class="[inputContainerStyle, ' input-container p-4 gap-3 flex-col']"
      >
        <div
          v-for="s in structure.metadata"
          :key="`${idx}-${s ? s.key : 'empty'}`"
        >
          <MetaEditDataField
            v-if="s"
            @onChange="onChangeMetaEditDataField(value)"
            :label="s.label"
            :field-key="`${structure.label}[${idx}].metadata.${s.key}`"
            :type="s.type"
          />
        </div>
        <ListItem
          v-if="value.linkedEntity && value.linkedEntity.teaserMetadata"
          :meta="value.linkedEntity.teaserMetadata"
          :media="
            value.linkedEntity.media
              ? value.linkedEntity.media.primary_transcode
              : undefined
          "
          :thumb-icon="getThumbnail(value)"
        />
        <div v-if="!structure.disabled" class="delete">
          <BaseButton
            :icon="Unicons.Trash.name"
            class="h-full"
            bg-color="neutral-30 "
            @click="removeRelation(value, idx)"
          />
        </div>
      </div>
    </div>
  </div>
  <MetaAdd
    v-if="!structure.disabled"
    :label="label"
    @addMetadata="openModal(structure.acceptedEntityTypes)"
  />
</template>

<script lang="ts">
import type {
  RelationField,
  Maybe,
  BaseEntity,
} from "@/generated-types/queries";
import { defineComponent, watch } from "vue";
import type { PropType } from "vue";
import MetaEditDataField from "./MetaEditDataField.vue";
import { useFieldArray } from "vee-validate";
import { inputContainerStyle, lableStyle } from "./base/InputField.vue";
import { Unicons } from "@/types";
import BaseButton from "./base/BaseButton.vue";
import MetaAdd from "@/components/MetaAdd.vue";
import { usePickEntityModal } from "./PickEntityModal.vue";
import type { PickEntityModalType } from "./PickEntityModal.vue";
import {
  selectedRelationField,
  getEmptyMetadatRelationObject,
} from "@/composables/useOldFormHelpers";
import type { relationValues } from "@/composables/useOldFormHelpers";
import useMetaDataHelper from "@/composables/useMetaDataHelper";
import ListItem from "@/components/ListItem.vue";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import useRouteHelpers from "@/composables/useRouteHelpers";
import useMediaAssetLinkHelper from "../composables/useMediaAssetLinkHelper";

export default defineComponent({
  name: "MetaEditRelationField",
  components: {
    MetaEditDataField,
    BaseButton,
    MetaAdd,
    ListItem,
  },
  props: {
    structure: { type: Object as PropType<RelationField>, required: true },
    label: {
      type: Object as PropType<Maybe<string | undefined>>,
      required: false,
      default: undefined,
    },
  },
  setup: (props) => {
    const { remove, push, fields, update } = useFieldArray<relationValues>(
      props.label ? props.label : props.structure.relationType //MAKING UNIQUE ARRAY FOR EACH COMPONENT DEPENDING ON THE LABEL...
    );
    const { getParam } = useRouteHelpers();
    const {
      selectedRelationFieldMetadata,
      beingAdded,
      relationsToBeDeleted,
      metadataToBePatched,
      addTowardsMetadataToBePatched,
    } = useMetaDataHelper();
    const { getThumbnail } = useThumbnailHelper();
    const id = getParam("id");

    const addRelation = (value: BaseEntity) => {
      push(
        getEmptyMetadatRelationObject(props.structure, value.uuid, {
          //@ts-ignore  Error when passing value object in vee-validate
          media: value.media
            ? JSON.parse(JSON.stringify(value.media))
            : undefined,
          //@ts-ignore  Error when passing value object in vee-validate
          teaserMetadata: [...value.teaserMetadata],
        })
      );
    };

    const openModal = (acceptedEntityTypes: Maybe<string>[]) => {
      selectedRelationField.value = props.structure;
      fields.value.forEach((field) => {
        selectedRelationFieldMetadata.value.push(field.value);
      });
      beingAdded.value = "metadata";
      openPickEntityModal(acceptedEntityTypes);
    };

    const { openPickEntityModal, closePickEntityModal, pickEntityModalState } =
      usePickEntityModal();

    const removeRelation = (relation: relationValues, idx: number) => {
      remove(idx);
      relationsToBeDeleted.value.entityId = id;
      relationsToBeDeleted.value.relations.push({
        key: relation.key,
        type: relation.relationType,
      });
    };

    const onChangeMetaEditDataField = (fieldValue: any) => {
      addTowardsMetadataToBePatched(id, fieldValue.linkedEntity.uuid);
    };

    watch(pickEntityModalState, (value: PickEntityModalType) => {
      if (value.pickedEntity && value.pickedEntity) {
        if (
          selectedRelationField.value &&
          props.structure.label === selectedRelationField.value.label
        ) {
          addTowardsMetadataToBePatched(id, value.pickedEntity.uuid);
          addRelation(value.pickedEntity);
          openModal(props.structure.acceptedEntityTypes);
        }
      }
    });

    return {
      push,
      update,
      remove,
      fields,
      Unicons,
      lableStyle,
      openPickEntityModal,
      inputContainerStyle,
      openModal,
      getThumbnail,
      removeRelation,
      onChangeMetaEditDataField,
    };
  },
});
</script>
