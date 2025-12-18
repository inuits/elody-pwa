import { describe, expect, it, vi } from "vitest";

vi.mock("@/main", () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
  typeUrlMapping: {
    mapping: {},
    reverseMapping: {},
  },
}));

import { useMetadataWrapper } from "../useMetadataWrapper";
import { useForm, defineRule } from "vee-validate";
import { defineComponent, nextTick } from "vue";
import { mount } from "@vue/test-utils";

const metadataWrapperProps = {
  formId: "M-KYY3IE440Q",
  metadata: {
    key: "title",
    label: "metadata.labels.headtitle-manifestation",
    value: "Willem Frederik Hermans",
    __typename: "PanelMetaData",
  },
  isEdit: false,
  baseLibraryMode: "normalBaseLibrary",
  formFlow: "edit",
  showErrors: false,
};

describe("useMetadataWrapper", () => {
  it("should initialize the field in veevalidate", async () => {
    let capturedFieldValueProxy: any;

    const TestComponent = defineComponent({
      setup() {
        useForm();
        defineRule("no_xss", () => true);

        const { fieldValueProxy } = useMetadataWrapper(
          metadataWrapperProps,
          () => undefined,
        );

        capturedFieldValueProxy = fieldValueProxy;

        return () => null;
      },
    });

    mount(TestComponent);

    await nextTick();

    expect(capturedFieldValueProxy.value).toBe("Willem Frederik Hermans");
  });
});
