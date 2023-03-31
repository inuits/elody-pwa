<template>
  <div>
    <InputField
      v-model:modelValue="inputField"
      :debounce="true"
      :placeholder="placeholderText"
      :bg-color="'neutral-20'"
    />
  </div>
</template>
<script lang="ts" setup>
import { computed, defineProps, defineEmits } from "vue";
import type { PropType } from "vue";
import InputField from "@/components/base/InputField.vue";
import { defaultReturnTextObject } from "../../composables/useFilterHelper";
import type { FilterInList } from "../../composables/useFilterHelper";
import type { AdvancedFilter } from "@/generated-types/queries";


const props = defineProps<{
  inputValue: {
    type:FilterInList
  }
  filter: {
    type: AdvancedFilter
    required:true
  }
  placeholderText:string,
}>();

  const emit = ["update:inputValue"],

  const emit = defineEmits<{
  (event: "update:inputValue", defaultReturnTextObject);
}>();


    emit("update:inputValue", defaultReturnTextObject(props.filter?.key));

    const inputField = computed<string | undefined | null>({
      get() {
        return props.inputValue && props.inputValue.input.textInput
          ? props.inputValue.input.textInput.value
          : undefined;
      },
      set(value) {
        emit(
          "update:inputValue",
          defaultReturnTextObject(props.filter?.key, value)
        );
      },
    });

    return { inputField };
  },
});
</script>
