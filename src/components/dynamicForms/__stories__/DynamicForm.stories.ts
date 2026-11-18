import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted, provide, ref } from "vue";
import { useRouter } from "vue-router";
import DynamicForm from "../DynamicForm.vue";
import DynamicFormSkeleton from "../DynamicFormSkeleton.vue";
import BaseTabs from "@/components/BaseTabs.vue";
import BaseTab from "@/components/BaseTab.vue";
import {
  ActionType,
  DamsIcons,
  InputFieldTypes,
  ValidationRules,
} from "@/generated-types/queries";

const meta: Meta<typeof DynamicForm> = {
  title: "RepetitiveForm/DynamicForm",
  component: DynamicForm,
  parameters: {
    docs: {
      description: {
        component:
          "A form built from configuration: the fields in configured order, " +
          "then the action button. The stories pass the fields directly " +
          "(modalFormFields), so no form query is fetched.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DynamicForm>;

const field = (
  key: string,
  label: string,
  type: InputFieldTypes,
  required = false,
) => ({
  __typename: "PanelMetaData",
  key,
  label,
  inputField: {
    __typename: "InputField",
    type,
    validation: required
      ? { __typename: "Validation", value: [ValidationRules.Required] }
      : undefined,
  },
});

const action = (label: string, actionType: ActionType, icon?: DamsIcons) => ({
  __typename: "FormAction",
  label,
  icon,
  actionType,
  actionQuery: "CreateEntity",
  creationType: "asset",
});

const createFields = {
  title: field("title", "Title", InputFieldTypes.Text, true),
  description: field("description", "Description", InputFieldTypes.Textarea),
  date: field("date", "Date", InputFieldTypes.Date),
  create: action("Create", ActionType.Submit, DamsIcons.Create),
};

const setup = (pressSubmit = false) => {
  provide("config", { features: {} });
  const root = ref<HTMLElement>();
  onMounted(() => {
    if (!pressSubmit) return;
    setTimeout(
      () =>
        root.value
          ?.querySelector<HTMLButtonElement>("button:not([disabled])")
          ?.click(),
      300,
    );
  });
  return { root, router: useRouter(), fields: createFields };
};

export const Default: Story = {
  render: () => ({
    components: { DynamicForm },
    setup: () => setup(),
    template: `
      <div ref="root" style="max-width:480px;background:var(--color-surface)">
        <dynamic-form
          dynamic-form-query="StoryCreateForm"
          :router="router"
          :modal-form-fields="fields"
          :show-form-title="false"
        />
      </div>`,
  }),
};

export const Steps: Story = {
  render: () => ({
    components: { DynamicForm, BaseTabs, BaseTab },
    setup() {
      provide("config", { features: {} });
      return {
        router: useRouter(),
        work: {
          title: field("title", "Title", InputFieldTypes.Text, true),
          next: action("Next", ActionType.NextFormTab, DamsIcons.AngleRight),
        },
        expression: {
          language: field("language", "Language", InputFieldTypes.Text),
          create: action("Create", ActionType.SubmitAllFormTabs),
        },
      };
    },
    template: `
      <div style="max-width:560px;background:var(--color-surface);padding-top:16px">
        <base-tabs :tabs="['Work', 'Expression']" :tab-navigation-disabled="true" step-strip>
          <base-tab>
            <dynamic-form dynamic-form-query="StoryWorkForm" form-key="work" :router="router" :modal-form-fields="work" :show-form-title="false" />
          </base-tab>
          <base-tab>
            <dynamic-form dynamic-form-query="StoryExpressionForm" form-key="expression" :router="router" :modal-form-fields="expression" :show-form-title="false" />
          </base-tab>
        </base-tabs>
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    components: { DynamicForm, DynamicFormSkeleton },
    setup: () => setup(true),
    template: `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start">
        <div>
          <code style="font-size:var(--text-label)">loading</code>
          <div style="position:relative;min-height:220px;background:var(--color-surface);padding:16px">
            <dynamic-form-skeleton form-key="StoryCreateForm" />
          </div>
        </div>
        <div>
          <code style="font-size:var(--text-label)">submitted with errors</code>
          <div ref="root" style="background:var(--color-surface)">
            <dynamic-form
              dynamic-form-query="StoryCreateFormErrors"
              :router="router"
              :modal-form-fields="fields"
              :show-form-title="false"
            />
          </div>
        </div>
      </div>`,
  }),
};
