import { computed, unref, type MaybeRef, type ComputedRef } from "vue";
import {
  type PanelMetaData,
  type PanelStatus,
  CustomFormatterTypes,
} from "@/generated-types/queries";
import { useFormHelper } from "@/composables/useFormHelper";

export const usePanelStatus = (
  panelStatus: MaybeRef<PanelStatus | null | undefined>,
  formId: MaybeRef<string>,
  isEdit: MaybeRef<boolean> = false,
) => {
  const { getForm, addEditableMetadataKeys } = useFormHelper();

  const statusValue = computed(() => {
    const status = unref(panelStatus);
    if (!status) return undefined;
    return getForm(unref(formId))?.values.intialValues?.[
      status.statusMetadataKey
    ];
  });

  const statusMetadata: ComputedRef<PanelMetaData> = computed(() => {
    const status = unref(panelStatus)!;
    const raw = statusValue.value;

    const matchingOption = raw.label
      ? status.statusInputField?.options?.find(
          (opt: any) => opt.value === raw.label,
        )
      : undefined;

    return {
      key: status.statusMetadataKey,
      inputField: status.statusInputField,
      value: raw,
      valueTranslationKey: matchingOption?.label,
    } as PanelMetaData;
  });

  const getStatusMetadata = (): PanelMetaData => statusMetadata.value;

  const registerEditableKey = (): void => {
    const status = unref(panelStatus);
    if (!status) return;
    addEditableMetadataKeys([status.statusMetadataKey], unref(formId));
  };

  return {
    statusValue,
    statusMetadata,
    getStatusMetadata,
    registerEditableKey,
  };
};
