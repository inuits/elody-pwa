<template>
  <div class="p-6 bg-neutral-0">
    <form v-if="form.fields" novalidate>
      <div
        v-for="field in form.fields"
        :key="field?.__typename === 'MetadataField' ? field.key : 'no key'"
      >
        <MetaEditDataField
          v-if="field && field.__typename === 'MetadataField'"
          :field-key="field.key"
          :label="field.label"
        />
        <MetaEditRelationField
          v-else-if="field && field.__typename === 'RelationField'"
          :structure="field"
          :label="field.label"
        />
      </div>
    </form>
  </div>
</template>

<script lang="ts">
  import {
    Form,
    MetadataAndRelation,
    MetadataFormInput,
    ReplaceRelationsAndMetaDataDocument,
    ReplaceRelationsAndMetaDataMutationVariables,
  } from '@/queries';
  import { defineComponent, PropType, ref } from 'vue';
  import { useForm, useSubmitForm } from 'vee-validate';

  import { useMutation } from '@vue/apollo-composable';
  import useRouteHelpers from '@/composables/useRouteHelpers';
  import { useEditMode } from './EditToggle.vue';
  import MetaEditRelationField from './MetaEditRelationField.vue';
  import MetaEditDataField from './MetaEditDataField.vue';
  import useFormHelper, {
    IntialValues,
    relationValues,
  } from '@/composables/useFormHelpers';

  export default defineComponent({
    name: 'MetaEdit',
    components: { MetaEditDataField, MetaEditRelationField },
    props: {
      entityTitle: { type: String, required: true },
      metadata: { type: Array as PropType<MetadataAndRelation[]>, required: true },
      form: { type: Object as PropType<Form>, required: true },
    },
    emits: ['updatedMetadata'],
    setup(props) {
      const { getParam } = useRouteHelpers();
      const id = getParam('id');
      const { addSaveCallback } = useEditMode();
      const { buildInitialValues } = useFormHelper(props.form, props.entityTitle);
      const { mutate } = useMutation<ReplaceRelationsAndMetaDataMutationVariables>(
        ReplaceRelationsAndMetaDataDocument,
      );

      const {} = useForm<IntialValues>({
        initialValues: buildInitialValues(props.metadata),
      });

      addSaveCallback(
        useSubmitForm<IntialValues>(async (values) => {
          const input: MetadataFormInput = {
            Metadata: [],
            relations: [],
          };
          Object.entries(values).forEach((value: [string, string | relationValues[]]) => {
            if (typeof value[1] === 'string') {
              input.Metadata?.push({ key: value[0], value: value[1] });
            }
            if (typeof value[1] === 'object') {
              value[1].forEach((relationValue) => {
                input.relations?.push({
                  relationType: value[0],
                  linkedEntityId: relationValue.linkedEntity?.id,
                  metadata: Object.entries(values).map((value) => {
                    if (typeof value[1] === 'string') {
                      return { key: value[0], value: value[1] };
                    }
                    return { key: '', value: '' };
                  }),
                });
              });
            }
          });

          mutate({ form: input });
        }),
      );
    },
  });
</script>
