<template>
  <div class="p-6 bg-neutral-0 pb-20">
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
    ReplaceRelationsAndMetaDataMutation,
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
      modelValue: { type: Array as PropType<MetadataAndRelation[]>, required: true },
      form: { type: Object as PropType<Form>, required: true },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const { getParam } = useRouteHelpers();
      const id = getParam('id');
      const { addSaveCallback } = useEditMode();
      const { buildInitialValues, serialzeFormToInput } = useFormHelper(
        props.form,
        props.entityTitle,
      );
      const { mutate, onDone } = useMutation<ReplaceRelationsAndMetaDataMutation>(
        ReplaceRelationsAndMetaDataDocument,
      );

      onDone((value) => {
        emit('update:modelValue', value.data?.replaceRelationsAndMetaData?.metadata);
      });

      const {} = useForm<IntialValues>({
        initialValues: buildInitialValues(props.modelValue),
      });

      addSaveCallback(
        useSubmitForm<IntialValues>(async (values) => {
          await mutate({ id, form: serialzeFormToInput(values) });
        }),
      );
    },
  });
</script>
