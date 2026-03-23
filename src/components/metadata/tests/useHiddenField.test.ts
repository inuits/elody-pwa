import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, nextTick } from "vue";
import {
  EditStatus,
  Entitytyping,
  InputFieldTypes,
} from "@/generated-types/queries";

const mockAddMappedRelations = vi.fn();

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    addMappedRelations: mockAddMappedRelations,
  }),
}));

vi.mock("@/main", () => ({
  auth: {
    user: {
      email: "test@example.com",
    },
  },
}));

import { useHiddenField } from "../useHiddenField";

const makeField = (overrides = {}) => ({
  type: InputFieldTypes.DropdownMultiselectRelations,
  relationType: "refTestRelation",
  advancedFilterInputForSearchingOptions: {
    item_types: [Entitytyping.User],
  },
  ...overrides,
});

describe("useHiddenField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isFieldHidden", () => {
    it("is false when hiddenField is undefined", () => {
      const hiddenField = ref(undefined);
      const field = ref(makeField());
      const onUpdate = vi.fn();

      const { isFieldHidden } = useHiddenField(hiddenField, field, "form-1", onUpdate);

      expect(isFieldHidden.value).toBeUndefined();
    });

    it("is true when hiddenField.hidden is true", () => {
      const hiddenField = ref({ hidden: true });
      const field = ref(makeField());
      const onUpdate = vi.fn();

      const { isFieldHidden } = useHiddenField(hiddenField, field, "form-1", onUpdate);

      expect(isFieldHidden.value).toBe(true);
    });

    it("is false when hiddenField.hidden is false", () => {
      const hiddenField = ref({ hidden: false });
      const field = ref(makeField());
      const onUpdate = vi.fn();

      const { isFieldHidden } = useHiddenField(hiddenField, field, "form-1", onUpdate);

      expect(isFieldHidden.value).toBe(false);
    });
  });

  describe("watch: when isFieldHidden becomes true", () => {
    it("does nothing when isFieldHidden is false", async () => {
      const hiddenField = ref({ hidden: false });
      const field = ref(makeField());
      const onUpdate = vi.fn();

      useHiddenField(hiddenField, field, "form-1", onUpdate);
      await nextTick();

      expect(mockAddMappedRelations).not.toHaveBeenCalled();
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it("calls onUpdate with populated relations when hidden and not inherited", async () => {
      const hiddenField = ref({
        hidden: true,
        inherited: false,
        searchValueForFilter: "email",
      });
      const field = ref(makeField());
      const onUpdate = vi.fn();

      useHiddenField(hiddenField, field, "form-1", onUpdate);
      await nextTick();

      expect(onUpdate).toHaveBeenCalledWith([
        {
          editStatus: EditStatus.New,
          key: "test@example.com",
          type: "refTestRelation",
          value: "test@example.com",
        },
      ]);
      expect(mockAddMappedRelations).not.toHaveBeenCalled();
    });

    it("calls addMappedRelations when hidden and inherited", async () => {
      const hiddenField = ref({
        hidden: true,
        inherited: true,
        entityType: Entitytyping.User,
        relationToExtractKey: "hasCreator",
        keyToExtractValue: "id",
      });
      const field = ref(makeField({ relationType: "refCreator" }));
      const onUpdate = vi.fn();

      useHiddenField(hiddenField, field, "form-1", onUpdate);
      await nextTick();

      expect(mockAddMappedRelations).toHaveBeenCalledWith(
        [
          {
            editStatus: EditStatus.New,
            key: "",
            type: "refCreator",
            value: "",
            inheritFrom: {
              entityType: Entitytyping.User,
              relationKey: "hasCreator",
              valueKey: "id",
            },
          },
        ],
        "refCreator",
        "form-1",
      );
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it("reacts when isFieldHidden changes from false to true", async () => {
      const hiddenField = ref({ hidden: false, inherited: false, searchValueForFilter: "email" });
      const field = ref(makeField());
      const onUpdate = vi.fn();

      useHiddenField(hiddenField, field, "form-1", onUpdate);
      await nextTick();

      expect(onUpdate).not.toHaveBeenCalled();

      hiddenField.value = { hidden: true, inherited: false, searchValueForFilter: "email" };
      await nextTick();

      expect(onUpdate).toHaveBeenCalledOnce();
    });
  });

  describe("getIdForHiddenFieldFilter", () => {
    it("returns user email when entity type is User and searchValueForFilter is 'email'", async () => {
      const hiddenField = ref({
        hidden: true,
        inherited: false,
        searchValueForFilter: "email",
      });
      const field = ref(
        makeField({
          type: InputFieldTypes.DropdownMultiselectRelations,
          advancedFilterInputForSearchingOptions: {
            item_types: [Entitytyping.User],
          },
        }),
      );
      const onUpdate = vi.fn();

      useHiddenField(hiddenField, field, "form-1", onUpdate);
      await nextTick();

      expect(onUpdate).toHaveBeenCalledWith([
        expect.objectContaining({ key: "test@example.com", value: "test@example.com" }),
      ]);
    });

    it("returns undefined when entity type is not User", async () => {
      const hiddenField = ref({
        hidden: true,
        inherited: false,
        searchValueForFilter: "email",
      });
      const field = ref(
        makeField({
          type: InputFieldTypes.DropdownMultiselectRelations,
          advancedFilterInputForSearchingOptions: {
            item_types: [Entitytyping.Asset],
          },
        }),
      );
      const onUpdate = vi.fn();

      useHiddenField(hiddenField, field, "form-1", onUpdate);
      await nextTick();

      expect(onUpdate).toHaveBeenCalledWith([
        expect.objectContaining({ key: undefined, value: undefined }),
      ]);
    });

    it("returns undefined when searchValueForFilter is not 'email'", async () => {
      const hiddenField = ref({
        hidden: true,
        inherited: false,
        searchValueForFilter: "name",
      });
      const field = ref(
        makeField({
          type: InputFieldTypes.DropdownMultiselectRelations,
          advancedFilterInputForSearchingOptions: {
            item_types: [Entitytyping.User],
          },
        }),
      );
      const onUpdate = vi.fn();

      useHiddenField(hiddenField, field, "form-1", onUpdate);
      await nextTick();

      expect(onUpdate).toHaveBeenCalledWith([
        expect.objectContaining({ key: undefined, value: undefined }),
      ]);
    });
  });

  describe("value property", () => {
    it("calls onUpdate with the static value string when hidden is true and value is set", async () => {
      const hiddenField = ref({ hidden: true, inherited: false, value: "static-value" });
      const field = ref(makeField());
      const onUpdate = vi.fn();

      useHiddenField(hiddenField, field, "form-1", onUpdate);
      await nextTick();

      expect(onUpdate).toHaveBeenCalledWith("static-value");
      expect(mockAddMappedRelations).not.toHaveBeenCalled();
    });

    it("does not call onUpdate with value when hidden is false", async () => {
      const hiddenField = ref({ hidden: false, inherited: false, value: "static-value" });
      const field = ref(makeField());
      const onUpdate = vi.fn();

      useHiddenField(hiddenField, field, "form-1", onUpdate);
      await nextTick();

      expect(onUpdate).not.toHaveBeenCalled();
    });

    it("prefers value over populateHiddenField when both could apply", async () => {
      const hiddenField = ref({
        hidden: true,
        inherited: false,
        value: "override-value",
        searchValueForFilter: "email",
      });
      const field = ref(makeField({ type: InputFieldTypes.DropdownMultiselectRelations }));
      const onUpdate = vi.fn();

      useHiddenField(hiddenField, field, "form-1", onUpdate);
      await nextTick();

      expect(onUpdate).toHaveBeenCalledWith("override-value");
      expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    it("falls through to populateHiddenField when value is not set", async () => {
      const hiddenField = ref({ hidden: true, inherited: false, value: undefined });
      const field = ref(makeField());
      const onUpdate = vi.fn();

      useHiddenField(hiddenField, field, "form-1", onUpdate);
      await nextTick();

      expect(onUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ editStatus: EditStatus.New })]),
      );
    });

    it("reacts when value is set and isFieldHidden changes from false to true", async () => {
      const hiddenField = ref({ hidden: false, inherited: false, value: "lazy-value" });
      const field = ref(makeField());
      const onUpdate = vi.fn();

      useHiddenField(hiddenField, field, "form-1", onUpdate);
      await nextTick();
      expect(onUpdate).not.toHaveBeenCalled();

      hiddenField.value = { hidden: true, inherited: false, value: "lazy-value" };
      await nextTick();

      expect(onUpdate).toHaveBeenCalledWith("lazy-value");
    });
  });

  describe("populateHiddenField", () => {
    it("returns undefined (calls onUpdate with undefined) when field type is not DropdownMultiselectRelations", async () => {
      const hiddenField = ref({ hidden: true, inherited: false });
      const field = ref(makeField({ type: InputFieldTypes.Text }));
      const onUpdate = vi.fn();

      useHiddenField(hiddenField, field, "form-1", onUpdate);
      await nextTick();

      expect(onUpdate).toHaveBeenCalledWith(undefined);
    });
  });

  describe("formId handling", () => {
    it("accepts a string formId", async () => {
      const hiddenField = ref({
        hidden: true,
        inherited: true,
        entityType: Entitytyping.User,
        relationToExtractKey: "hasCreator",
        keyToExtractValue: "id",
      });
      const field = ref(makeField({ relationType: "refCreator" }));
      const onUpdate = vi.fn();

      useHiddenField(hiddenField, field, "string-form-id", onUpdate);
      await nextTick();

      expect(mockAddMappedRelations).toHaveBeenCalledWith(
        expect.anything(),
        "refCreator",
        "string-form-id",
      );
    });

    it("accepts a ref formId", async () => {
      const hiddenField = ref({
        hidden: true,
        inherited: true,
        entityType: Entitytyping.User,
        relationToExtractKey: "hasCreator",
        keyToExtractValue: "id",
      });
      const field = ref(makeField({ relationType: "refCreator" }));
      const formId = ref("ref-form-id");
      const onUpdate = vi.fn();

      useHiddenField(hiddenField, field, formId, onUpdate);
      await nextTick();

      expect(mockAddMappedRelations).toHaveBeenCalledWith(
        expect.anything(),
        "refCreator",
        "ref-form-id",
      );
    });
  });
});
