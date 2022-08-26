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
          :type="field.type"
          :active="field.active"
          :options="field.options"
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
  import { defineComponent, PropType, watch } from 'vue';
  import { useForm, useSubmitForm } from 'vee-validate';

  import { useMutation } from '@vue/apollo-composable';
  import { useEditMode } from '../EditToggle.vue';
  import MetaEditDataField from '../MetaEditDataField.vue';
  import useFormHelper, { IntialValues } from '@/composables/useFormHelpers';
  import useMetaDataHelper from '@/composables/useMetaDataHelper';
  import { useEntityMediafileSelector } from '../EntityImageSelection.vue';

  export default defineComponent({
    name: 'MetaEditMedia',
    components: { MetaEditDataField },
    props: {
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
      const { addOrUpdateList, metaDataPatchList, clearMediaFilesToPatch } = useMetaDataHelper();
      const { setValues, values: metadata } = useForm<IntialValues>({});
      const { mutate } = useMutation<PatchMediaFileMetadataMutation>(
        PatchMediaFileMetadataDocument,
      );

      //onDone((value) => {
      //   emit('update:modelValue', value.data?.patchMediaFileMetadata?.metadata);
      //});

      watch(
        mediafileSelectionState,
        () => {
          if (mediafileSelectionState.selectedMediafile?.metadata) {
            setValues(
              buildInitialValues(
                //@ts-ignore
                mediafileSelectionState.selectedMediafile.metadata,
              ),
            );
          }
        },
        { immediate: true, deep: true },
      );

      watch(() => metadata, () => {
        if (mediafileSelectionState.selectedMediafile) {
          addOrUpdateList( mediafileSelectionState.selectedMediafile._id.replace('mediafiles/','',), serialzeFormToInput(metadata).Metadata);
        }
      }, { deep: true });

      addSaveCallback(
        useSubmitForm<IntialValues>(async () => {
          for (const metaData in metaDataPatchList.value) {
              await mutate(metaDataPatchList.value[metaData]);
          }
          clearMediaFilesToPatch();
        }),
      );
    },
  });
</script>
