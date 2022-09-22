<template>
  <div class="p-6 bg-neutral-0 pb-20">
    <form v-if="form.fields" novalidate>
      <div
        v-for="field in form.fields"
        :key="field.__typename === 'MetadataField' ? field.key : 'no key'"
      >
        <!-- {{field}} -->
        <MetaEditDataField
          v-if="field && field.__typename === 'MetadataField'"
          :field-key="field.key"
          :label="field.label"
          :options="field.type === 'dropdown' ? field.options : []"
          :type="field.type"
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
    ReplaceRelationsAndMetaDataDocument,
    ReplaceRelationsAndMetaDataMutation,
  } from '@/queries';
  import { defineComponent, Prop, PropType, ref } from 'vue';
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
      
      const {values} = useForm<IntialValues>({
        initialValues: buildInitialValues(props.modelValue),
      });

      addSaveCallback(
        useSubmitForm<IntialValues>(async (values) => {

          //SEARCH ARRAYS AND COMBINED
          props.form.fields.forEach((field: any) => {
            if (values[field.label]) {
              if (Array.isArray(values.components) && Array.isArray(values[field.label])) {
                const arr: any = [...values[field.label]];
                // console.log('arr: ', arr);
                values.components = arr;
                delete values[field.label];
              }
            }
          });

          console.log('VALUES: ', values);
          console.log('serialzeFormToInput(values): ', serialzeFormToInput(values));
          await mutate({ id, form: serialzeFormToInput(values) });
        }), 'first'
      );

      return {
        values
      };
      
    },
  });
</script>
