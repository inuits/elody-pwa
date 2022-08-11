<template>
  <div class="p-6 bg-neutral-0 pb-20">
    <form v-if="form.fields" novalidate>
      <div
        v-for="field in form.fields"
        :key="field.__typename === 'MetadataField' ? field.key : 'no key'"
      >
        <MetaEditDataField
          v-if="field && field.__typename === 'MetadataField'"
          :field-key="field.key"
          :label="field.label"
          :options="field.type === 'dropdown' ? field.options : []"
          :type="field.type"
        />
      </div>
    </form>
  </div>
</template>

<script lang="ts">
  import {
    Form,
    MediaFileMetadata,
    PatchMediaFileMetadataMutation,
    PatchMediaFileMetadataDocument,
    MetadataAndRelation,
  } from '@/queries';
  import { defineComponent, PropType } from 'vue';
  import { useForm, useSubmitForm } from 'vee-validate';

  import { useMutation } from '@vue/apollo-composable';
  import { useEditMode } from '../EditToggle.vue';
  import MetaEditDataField from '../MetaEditDataField.vue';
  import useFormHelper, { IntialValues } from '@/composables/useFormHelpers';
  import { useEntityMediafileSelector } from '../EntityImageSelection.vue';

  export default defineComponent({
    name: 'MetaEditMedia',
    components: { MetaEditDataField },
    props: {
      modelValue: { type: Array as PropType<MetadataAndRelation[]>, required: true },
      form: { type: Object as PropType<Form>, required: true },
      entityTitle: { type: String, required: true },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const { addSaveCallback } = useEditMode();
      const { mediafileSelectionState } = useEntityMediafileSelector();
      const { buildInitialValues, serialzeFormToInput } = useFormHelper(
        props.form,
        props.entityTitle,
      );
      const { mutate, onDone } = useMutation<PatchMediaFileMetadataMutation>(
        PatchMediaFileMetadataDocument,
      );

      //onDone((value) => {
      //   emit('update:modelValue', value.data?.patchMediaFileMetadata?.metadata);
      //});
      const {} = useForm<IntialValues>({
        initialValues: buildInitialValues(props.modelValue),
      });

      addSaveCallback(
        useSubmitForm<IntialValues>(async (values) => {
          await mutate({
            mediafileId: mediafileSelectionState.value.selectedMediafile?._id.replace(
              'mediafiles/',
              '',
            ),
            mediaFileInput: serialzeFormToInput(values).Metadata,
          });
        }),
      );
    },
  });
</script>
