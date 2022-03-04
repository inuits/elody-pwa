<template>
  <span v-if="label" class="ml-1 text-neutral-700 text-sm">{{ label }}</span>
  <div>
    <div v-for="({ value, key }, idx) in fields" :key="key" class="my-2">
      <div :class="[inputContainerStyle, ' input-container p-4 gap-3 flex-col']">
        <div
          v-for="{ label: metadataLabel, key: metadataKey } in structure.metadata"
          :key="`${idx}-${metadataKey}`"
        >
          <MetaEditDataField
            :label="metadataLabel"
            :field-key="`${structure.relationType}[${idx}].metadata.${metadataKey}`"
          />
        </div>
        <ListItem
          v-if="value.linkedEntity && value.linkedEntity.teaserMetadata"
          :meta="value.linkedEntity.teaserMetadata"
          :thumb-icon="Unicons.NoImage.name"
        />
        <div class="delete">
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
  <MetaAdd @addMetadata="addRelation" />
</template>

<script lang="ts">
  import {
    RelationField,
    ReplaceRelationsAndMetaDataMutation,
    ReplaceRelationsAndMetaDataMutationVariables,
  } from '@/queries';
  import { defineComponent, PropType } from 'vue';
  import MetaEditDataField from './MetaEditDataField.vue';
  import { useFieldArray } from 'vee-validate';
  import { inputContainerStyle, lableStyle } from './base/InputField.vue';
  import { Unicons } from '@/types';
  import BaseButton from './base/BaseButton.vue';
  import MetaAdd from '@/components/MetaAdd.vue';
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
      const emptyObject = getEmptyMetadatRelationObject(props.structure);
      const addRelation = () => {
        push(emptyObject);
      };

      return {
        push,
        update,
        remove,
        fields,
        Unicons,
        lableStyle,
        addRelation,
        inputContainerStyle,
      };
    },
  });
</script>
