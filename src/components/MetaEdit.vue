<template>
  <div class="p-6 bg-neutral-0">
    <Form
      v-slot="{ handleSubmit }"
      :initial-values="{ metadata: formMetadata }"
      @submit="onSubmit"
    >
      <FieldArray v-slot="{ fields, push, remove }" name="metadata">
        <fieldset v-for="(field, idx) in fields" :key="field.key" class="my-2">
          <label :class="[lableStyle]" :for="`value_${idx}`">{{ field.value.key }}</label>
          <div :class="[inputContainerStyle, ' input-container']">
            <Field
              :id="`value_${idx}`"
              :disabled="`metadata[${idx}].immutable`"
              :as="editFieldType[field.value.key]"
              :name="`metadata[${idx}].value`"
              :class="[`bg-neutral-0`, inputStyle]"
            />
            <div class="delete">
              <BaseButton
                v-show="!`metadata[${idx}].immutable`"
                :icon="Unicons.Trash.name"
                class="h-full"
                bg-color="neutral-30 "
                @click="remove(idx)"
              />
            </div>
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
  import { Field, Form, FieldArray } from 'vee-validate';
  import { Unicons } from '@/types';
  import MetaAdd from '@/components/MetaAdd.vue';
  import { useMutation } from '@vue/apollo-composable';
  import { inputStyle, inputContainerStyle, lableStyle } from './base/InputField.vue';
  import AddSaveCallback from './base/addSaveCallback.vue';
  import BaseButton from './base/BaseButton.vue';
  import useRouteHelpers from '@/composables/useRouteHelpers';

  const editFieldType: Record<MetaKey, string> = {
    title: 'input',
    type: 'input',
    collection: 'input',
    description: 'textarea',
    material: 'input',
  };

  export default defineComponent({
    name: 'MetaEdit',
    components: { MetaAdd, Form, FieldArray, Field, AddSaveCallback, BaseButton },
    props: {
      entityTitle: { type: String, required: true },
      metadata: { type: Array as PropType<Metadata[]>, required: true },
    },
    emits: ['updatedMetadata'],
    setup(props) {
      const { getParam } = useRouteHelpers();
      let formMetadata = ref<Metadata[]>([
        {
          key: MetaKey.Title,
          value: props.entityTitle,
        },
      ]);

      props.metadata.forEach((meta: Metadata) => {
        formMetadata.value.push({
          key: meta.key,
          value: meta.value,
        });
      });
      const { mutate } = useMutation(EditMetadataDocument);

      const id = getParam('id');
      const onSubmit = () => {
        if (id === 'NOID') {
          console.error('no valid id');
        } else {
          async (input: { metadata: Metadata[] }) => {
            await mutate({ id, metadata: input.metadata });
          };
        }
      };

      return {
        Unicons,
        onSubmit,
        formMetadata,
        inputStyle,
        lableStyle,
        editFieldType,
        inputContainerStyle,
      };
    },
  });
</script>

<style lang="postcss">
  .input-container .delete {
    display: none;
  }
  .input-container:hover .delete {
    display: block;
  }
</style>
