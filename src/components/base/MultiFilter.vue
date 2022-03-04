<template>
  <div class="mb-1 flex">
    <AndOrToggle
      v-model:AndOrValue="isMulti"
      texton="Multi"
      textoff="Fuzzy"
      class="mr-1"
    />
    <AndOrToggle v-if="isMulti" v-model:AndOrValue="isAnd" texton="En" textoff="Of" />
  </div>

  <div>
    <Multiselect
      v-if="isMulti"
      v-model="inputFieldMulti"
      mode="tags"
      :searchable="true"
      :close-on-select="false"
      :options="result?.FilterOptions"
      label="label"
      track-by="label"
      value-prop="label"
      placeholder="choose your filters"
      no-results-text="no filter with that name found"
    />
  </div>
  <div>
    <InputField
      v-if="!isMulti"
      v-model="inputField"
      :debounce="true"
      placeholder="Fuzzy Search..."
      :bg-color="'neutral-20'"
    />
  </div>
</template>

<script lang="ts">
  import { GetFilterOptionsDocument, Maybe } from '@/queries';
  import { useQuery } from '@vue/apollo-composable';
  import { ref, defineComponent, computed, PropType } from 'vue';
  import Multiselect from '@vueform/multiselect';
  import AndOrToggle from './AndOrToggle.vue';
  import InputField from '@/components/base/InputField.vue';
  import {
    defaultReturnMultiSelectObject,
    defaultReturnTextObject,
    FilterInList,
  } from '@/composables/useFilterHelper';

  export default defineComponent({
    name: 'MultiFilter',
    components: {
      Multiselect,
      AndOrToggle,
      InputField,
    },
    props: {
      multiSelectValue: {
        type: Object as PropType<FilterInList>,
        required: false,
        default: undefined,
      },
      filterkey: {
        type: [String],
        required: true,
      },
    },
    emits: ['update:multiSelectValue'],
    setup(props, { emit }) {
      emit('update:multiSelectValue', defaultReturnMultiSelectObject(props.filterkey));
      const andOr = ref<'and' | 'or'>('and');
      const isAnd = computed<boolean>({
        get() {
          return andOr.value === 'and';
        },
        set(newValue) {
          if (newValue) {
            andOr.value = 'and';
          } else {
            andOr.value = 'or';
          }
          props.multiSelectValue &&
            props.multiSelectValue.input.multiSelectInput &&
            emit(
              'update:multiSelectValue',
              defaultReturnMultiSelectObject(props.filterkey, {
                value: props.multiSelectValue.input.multiSelectInput.value,
                AndOrValue: newValue,
              }),
            );
        },
      });
      const multiOrFuzzy = ref<'multi' | 'fuzzy'>('multi');
      const isMulti = computed<boolean>({
        get() {
          return multiOrFuzzy.value === 'multi';
        },
        set(newValue) {
          if (newValue) {
            multiOrFuzzy.value = 'multi';
          } else {
            multiOrFuzzy.value = 'fuzzy';
          }
        },
      });

      const inputFieldMulti = computed<Maybe<Maybe<string>[]> | undefined>({
        get() {
          return props.multiSelectValue && props.multiSelectValue.input.multiSelectInput
            ? props.multiSelectValue.input.multiSelectInput.value
            : undefined;
        },
        set(value) {
          if (props.multiSelectValue) {
            emit(
              'update:multiSelectValue',
              defaultReturnMultiSelectObject(props.filterkey, {
                value: value,
                AndOrValue: isAnd.value,
              }),
            );
          }
        },
      });

      const inputField = computed<string | undefined | null>({
        get() {
          return props.multiSelectValue && props.multiSelectValue.input.textInput
            ? props.multiSelectValue.input.textInput.value
            : undefined;
        },
        set(value) {
          emit(
            'update:multiSelectValue',
            defaultReturnTextObject(props.filterkey, value),
          );
        },
      });

      const { result } = useQuery(GetFilterOptionsDocument, {
        key: props.filterkey,
      });

      return { result, isMulti, isAnd, inputFieldMulti, inputField };
    },
  });
</script>
<style src="@vueform/multiselect/themes/default.css"></style>
<style>
  :root {
    --ms-tag-bg: #0052cc;
    --ms-ring-color: white;
  }
</style>
