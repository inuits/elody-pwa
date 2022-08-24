<template>
  <span v-if="label" class="ml-1 text-neutral-700 text-sm">{{ label }}</span>
  <div>
    <div v-for="({ value, key }, idx) in fields" :key="key" class="my-2">
      <div :class="[inputContainerStyle, ' input-container p-4 gap-3 flex-col']">
        <div
          v-for="{
            label: metadataLabel,
            key: metadataKey,
            type: metadataType,
          } in structure.metadata"
          :key="`${idx}-${metadataKey}`"
        >
          <MetaEditDataField
            :label="metadataLabel"
            :field-key="`${structure.relationType}[${idx}].metadata.${metadataKey}`"
            :type="metadataType"
          />
        </div>
        <ListItem
          v-if="value.linkedEntity && value.linkedEntity.teaserMetadata"
          :meta="value.linkedEntity.teaserMetadata"
          :thumb-icon="Unicons.NoImage.name"
        />
        <div v-if="!structure.disabled" class="delete">
          <BaseButton
            :icon="Unicons.Trash.name"
            class="h-full"
            bg-color="neutral-30 "
            @click="remove(idx)"
          />
        </div>
      </div>
    </div>
  </div>
  <MetaAdd
    v-if="!structure.disabled"
    :label="label"
    @addMetadata="openPickAssetModal(structure.acceptedEntityTypes)"
  />
</template>

<script lang="ts">
  import { Entity, MetadataFragment, RelationField } from '@/queries';
  import { defineComponent, PropType, watch } from 'vue';
  import MetaEditDataField from './MetaEditDataField.vue';
  import { useFieldArray } from 'vee-validate';
  import { inputContainerStyle, lableStyle } from './base/InputField.vue';
  import { Unicons } from '@/types';
  import BaseButton from './base/BaseButton.vue';
  import MetaAdd from '@/components/MetaAdd.vue';
  import { PickAssetModalType, usePickAssetModal } from './PickAssetModal.vue';

  import {
    getEmptyMetadatRelationObject,
    relationValues,
  } from '@/composables/useFormHelpers';
  import ListItem from '@/components/ListItem.vue';

  export default defineComponent({
    name: 'MetaEditRelationField',
    components: { MetaEditDataField, BaseButton, MetaAdd, ListItem },
    props: {
      structure: { type: Object as PropType<RelationField>, required: true },
      label: {
        type: String,
        required: false,
        default: undefined,
      },
    },
    setup: (props) => {
      const { remove, push, fields, update } = useFieldArray<relationValues>(
        props.structure.relationType,
      );
      const addRelation = (value: Entity) => {
        push(
          getEmptyMetadatRelationObject(props.structure, value.uuid, {
            //@ts-ignore  Error when passing value object in vee-validate
            teaserMetadata: [
              {
                // @ts-ignore Possible undefined
                value: getTeaserMetaDataByKey(value.teaserMetadata, 'title').value,
                key: 'titel',
              },
            ],
          }),
        );
      };

      const getTeaserMetaDataByKey = (
        teaserMetaData: MetadataFragment[],
        key: string,
      ): MetadataFragment | undefined => {
        return teaserMetaData.find((x: MetadataFragment) => x.key === key);
      };

      const { openPickAssetModal, closePickAssetModal, pickAssetModalState } =
        usePickAssetModal(addRelation);

      watch(pickAssetModalState, (value: PickAssetModalType) => {
        if (value.pickedAsset) {
          addRelation(value.pickedAsset);
          closePickAssetModal();
        }
      });

      return {
        push,
        update,
        remove,
        fields,
        Unicons,
        lableStyle,
        addRelation,
        openPickAssetModal,
        inputContainerStyle,
      };
    },
  });
</script>
