import {
  type BaseRelationValuesInput,
  EditStatus,
  Entitytyping,
  type HiddenField,
  InputFieldTypes,
  type InputField as InputFieldType,
} from "@/generated-types/queries";
import { auth } from "@/main";
import { useFormHelper } from "@/composables/useFormHelper";
import { computed, watch, type ComputedRef, type Ref } from "vue";

export const useHiddenField = (
  hiddenField: Ref<HiddenField | undefined> | ComputedRef<HiddenField | undefined>,
  field: Ref<InputFieldType> | ComputedRef<InputFieldType>,
  formId: Ref<string> | string,
  onUpdate: (value: BaseRelationValuesInput[] | string | undefined) => void,
) => {
  const { addMappedRelations } = useFormHelper();

  const getFormId = () => (typeof formId === "string" ? formId : formId.value);

  const isFieldHidden = computed(() => hiddenField.value?.hidden);

  const getIdForHiddenFieldFilter = (): string | undefined => {
    if (
      field.value.advancedFilterInputForSearchingOptions?.item_types?.[0] ===
        Entitytyping.User &&
      hiddenField.value?.searchValueForFilter === "email"
    ) {
      return auth?.user?.email;
    }
  };

  const populateInheritedHiddenField = () => {
    const relation: BaseRelationValuesInput = {
      editStatus: EditStatus.New,
      key: "",
      type: field.value.relationType!,
      value: "",
      inheritFrom: {
        entityType: hiddenField.value!.entityType!,
        relationKey: hiddenField.value!.relationToExtractKey!,
        valueKey: hiddenField.value!.keyToExtractValue!,
      },
    };
    addMappedRelations([relation], field.value.relationType!, getFormId());
  };

  const populateHiddenField = (): BaseRelationValuesInput[] | undefined => {
    const relations: BaseRelationValuesInput[] = [];

    if (field.value.type === InputFieldTypes.DropdownMultiselectRelations) {
      relations.push({
        editStatus: EditStatus.New,
        key: getIdForHiddenFieldFilter(),
        type: field.value.relationType,
        value: getIdForHiddenFieldFilter(),
      });
      return relations;
    }
  };

  watch(
    () => isFieldHidden.value,
    () => {
      if (!isFieldHidden.value) return;
      if (hiddenField.value?.inherited) return populateInheritedHiddenField();
      if (hiddenField.value?.value) return onUpdate(hiddenField.value.value);
      const newValue = populateHiddenField();
      onUpdate(newValue);
    },
    { immediate: true },
  );

  return { isFieldHidden };
};
