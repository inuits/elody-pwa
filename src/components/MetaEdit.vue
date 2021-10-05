<template>
  <div class="p-6 bg-neutral-0">
    <Form
      v-slot="{ handleSubmit }"
      :initial-values="{ metadata: formMetadata }"
      @submit="onSubmit"
    >
      <FieldArray v-slot="{ fields, push }" name="metadata">
        <fieldset v-for="(field, idx) in fields" :key="field.key" class="my-2">
          <label :class="[lableStyle]" :for="`value_${idx}`">{{ field.value.key }}</label>
          <div :class="[inputContainerStyle]">
            <Field
              :id="`value_${idx}`"
              :name="`metadata[${idx}].value`"
              :class="[`bg-neutral-0`, inputStyle]"
            />
          </div>
        </fieldset>
        <MetaAdd @addMetadata="push" />
      </FieldArray>
      <add-save-callback
        :callback="
          async () => {
            await handleSubmit(onSubmit);
          }
        "
      />
    </Form>
  </div>
</template>

<script lang="ts">
  import { EditMetadataDocument, Metadata, MetaKey } from '@/queries';
  import { defineComponent, PropType, ref } from 'vue';
  import { Field, Form, ErrorMessage, FieldArray } from 'vee-validate';
  import { Unicons } from '@/types';
  import MetaAdd from '@/components/MetaAdd.vue';
  import { useMutation } from '@vue/apollo-composable';
  import { useRoute } from 'vue-router';
  import { inputStyle, inputContainerStyle, lableStyle } from './base/InputField.vue';
  import AddSaveCallback from './base/addSaveCallback.vue';

  const asString = (x: string | string[]) => (Array.isArray(x) ? x[0] : x);

  export default defineComponent({
    name: 'MetaEdit',
    components: { MetaAdd, Form, FieldArray, Field, AddSaveCallback },
    props: {
      error: { type: String, default: '' },
      loading: { type: Boolean, default: false },
      entityTitle: { type: String, required: true },
      metadata: { type: Array as PropType<Metadata[]>, required: true },
      discard: { type: Function as PropType<() => void>, required: true },
      save: {
        type: Function as PropType<(x: Metadata[]) => void>,
        required: true,
      },
    },
    emits: ['updatedMetadata'],
    setup(props, { emit }) {
      let formMetadata = ref<Metadata[]>([
        {
          key: MetaKey.Title,
          value: props.entityTitle,
        },
      ]);

      const id = asString(useRoute().params['id']);
      props.metadata.forEach((meta: Metadata) => {
        formMetadata.value.push({
          key: meta.key,
          value: meta.value,
        });
      });
      const { mutate } = useMutation(EditMetadataDocument);

      const onSubmit = async (input: { metadata: Metadata[] }) => {
        await mutate({ id, metadata: input.metadata });
      };

      return {
        Unicons,
        onSubmit,
        formMetadata,
        inputStyle,
        lableStyle,
        inputContainerStyle,
      };
    },
  });
</script>

<style lang="postcss" scoped></style>
