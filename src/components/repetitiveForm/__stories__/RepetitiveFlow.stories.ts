import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide, watch } from "vue";
import RepetitiveFlow from "../RepetitiveFlow.vue";
import RepetitiveOverview from "../RepetitiveOverview.vue";
import { useRepetitiveForm } from "@/composables/useRepetitiveForm";
import { useDynamicForm } from "@/components/dynamicForms/useDynamicForm";
import { registerQueryFixture } from "@/main";
import { registerLibraryFixtures } from "@/components/library/__stories__/libraryFixtures";
import { registerFilterFixtures } from "@/components/filters/__stories__/filterFixtures";
import {
  ActionType,
  DamsIcons,
  InputFieldTypes,
  ValidationRules,
  type RepetitiveForm,
} from "@/generated-types/queries";

const meta: Meta<typeof RepetitiveFlow> = {
  title: "RepetitiveForm/GuidedFlow",
  component: RepetitiveFlow,
  parameters: {
    docs: {
      description: {
        component:
          "The guided flow dialog: a step strip in the header, the current " +
          "step's form, the records added this session and Save and close. " +
          "The step form's fields are set directly, not fetched.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RepetitiveFlow>;

const CREATE_FORM = "GetTagCreateForm";

const config = {
  label: "Add authors",
  repeatable: true,
  steps: [
    { key: "person", label: "Person", entityType: "person", createForm: CREATE_FORM },
    { key: "role", label: "Role", entityType: "role", createForm: CREATE_FORM },
  ],
} as unknown as RepetitiveForm;

const savedChain = (name: string, role: string, isNew = true) => ({
  entities: {
    person: [{ key: "person", id: `p-${name}`, type: "person", label: name, isNew }],
    role: [{ key: "role", id: `r-${name}`, type: "role", label: role, isNew }],
  },
  pendingHostRelations: [],
});

const formFor = (label: string, key: string) => ({
  GetDynamicForm: {
    __typename: "Form",
    form: {
      __typename: "FormTab",
      formFields: {
        __typename: "FormFields",
        [key]: {
          __typename: "PanelMetaData",
          key,
          label,
          inputField: {
            __typename: "InputField",
            type: InputFieldTypes.Text,
            validation: {
              __typename: "Validation",
              value: [ValidationRules.Required],
            },
          },
        },
        create: {
          __typename: "FormAction",
          label: "Create",
          icon: DamsIcons.Create,
          actionType: ActionType.Submit,
          actionQuery: "CreateEntity",
        },
      },
    },
  },
});

const pickerConfig = {
  ...config,
  steps: [
    { ...config.steps[0], pickerQuery: "GetPersonPickerList" },
    config.steps[1],
  ],
} as unknown as RepetitiveForm;

const person = (id: string, name: string, born: string) => ({
  __typename: "Asset",
  id,
  uuid: id,
  type: "person",
  intialValues: { __typename: "IntialValues", title: name, born },
  allowedViewModes: null,
  teaserMetadata: {
    __typename: "teaserMetadata",
    title: {
      __typename: "PanelMetaData",
      key: "title",
      label: "Name",
      value: name,
    },
    born: {
      __typename: "PanelMetaData",
      key: "born",
      label: "Born",
      value: born,
    },
  },
});

const people = [
  person("p-1", "Hergé", "1907"),
  person("p-2", "Peyo", "1928"),
  person("p-3", "Willy Vandersteen", "1913"),
  person("p-4", "Morris", "1923"),
];

const registerPickerFixtures = () => {
  registerLibraryFixtures();
  registerFilterFixtures();
  registerQueryFixture("GetBulkOperations", {
    BulkOperations: { __typename: "Asset" },
  });
  registerQueryFixture("getPreviewComponents", {
    PreviewComponents: { __typename: "Asset", previewComponent: null },
  });
  registerQueryFixture("getEntities", {
    Entities: {
      __typename: "EntitiesResults",
      count: people.length,
      limit: 20,
      facets: [],
      results: people,
    },
  });
};

const flowStory = (
  step: number,
  label: string,
  key: string,
  flowConfig: RepetitiveForm = config,
): Story => ({
  render: () => ({
    components: { RepetitiveFlow },
    setup() {
      provide("config", {
        features: {},
        routerConfig: [{ name: "Home", children: [] }],
      });
      registerPickerFixtures();
      registerQueryFixture(CREATE_FORM, { GetDynamicForm: null });
      const { dynamicForm, dynamicFormLoaded } = useDynamicForm();
      watch(dynamicFormLoaded, (loaded) => {
        if (loaded) dynamicForm.value = formFor(label, key);
      });
      const store = useRepetitiveForm();
      watch(
        store.flowConfig,
        (flow) => {
          if (!flow) return;
          store.branches.value = [savedChain("Marie Vermeulen", "Translator")];
          if (step === 0) return;
          store.recordEntity({
            key: "person",
            id: "p-new",
            type: "person",
            label: "Jan Peeters",
            isNew: true,
          } as never);
          store.currentStepIndex.value = step;
        },
        { immediate: true },
      );
      return { config: flowConfig };
    },
    template: `<repetitive-flow :open="true" :config="config" />`,
  }),
});

export const Default = flowStory(0, "Name", "name");

export const LaterStep = flowStory(1, "Role", "role");

export const PickerStep = flowStory(0, "Name", "name", pickerConfig);

export const RailStates: StoryObj<typeof RepetitiveOverview> = {
  render: () => ({
    components: { RepetitiveOverview },
    setup: () => ({
      steps: config.steps,
      rows: [
        { name: "empty", branches: [] },
        {
          name: "saved, newest can be undone",
          branches: [
            savedChain("Marie Vermeulen", "Translator"),
            savedChain("Jan Peeters", "Author"),
          ],
        },
        {
          name: "picked records only",
          branches: [savedChain("Anna Claes", "Editor", false)],
        },
      ],
    }),
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;align-items:start">
        <div v-for="row in rows" :key="row.name">
          <code style="font-size:var(--text-label)">{{ row.name }}</code>
          <repetitive-overview :branches="row.branches" :steps="steps" :repeatable="true" :undoable="true" />
        </div>
      </div>`,
  }),
};
