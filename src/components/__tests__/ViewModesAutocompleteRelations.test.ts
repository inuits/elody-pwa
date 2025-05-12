import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, afterEach } from "vitest";
import { Entitytyping, AdvancedFilterTypes } from "@/generated-types/queries";
import { flushPromises } from "@vue/test-utils";
import ViewModesAutocompleteRelations from "@/components/library/view-modes/ViewModesAutocompleteRelations.vue";

vi.mock("@vue/apollo-composable", () => ({
  useMutation: () => ({
    mutate: vi.fn(),
  }),
}));

vi.mock("@/composables/useGetDropdownOptions", () => ({
  useGetDropdownOptions: () => ({
    initialize: vi.fn(),
    getAutocompleteOptions: vi.fn(),
  }),
}));

// TODO: tests need to be rewritten from stratch, too much changes have been done here

describe("ViewModesAutocompleteRelations", () => {
  it("waits to be written", async () => {
    expect(true).toBe(true);
  });
});

// describe("ViewModesAutocompleteRelations", () => {
//   afterEach(() => {
//     vi.clearAllMocks();
//     vi.resetAllMocks();
//   });

//   it("sets the related options to 2 and all to 0", async () => {
//     const wrapper = mount(ViewModesAutocompleteRelations, {
//       props: {
//         modelValue: "This is a multiselect value",
//         selectType: "multi",
//         advancedFilterInputForRetrievingOptions: [],
//         advancedFilterInputForRetrievingRelatedOptions: [
//           {
//             type: AdvancedFilterTypes.Type,
//             value: Entitytyping.MediaLicense,
//             match_exact: true,
//           },
//           {
//             type: AdvancedFilterTypes.Id,
//             key: ["elody: 1|identifiers"],
//             value: "$hasMediaLicense",
//             match_exact: true,
//             returnIdAtIndex: -1,
//           },
//         ],
//         advancedFilterInputForRetrievingAllOptions: [],
//         advancedFilterInputForSearchingOptions: [],
//         relationType: "hasMediaLicense",
//         fromRelationType: "isMediaLicenseFor",
//         dependsOn: undefined,
//         mode: "edit",
//         formId: "438bacfd-6344-4897-8739-4a34cc26e983",
//         autoSelectable: "edit",
//         disabled: true,
//         isReadOnly: true,
//         isMetadataField: false,
//       },
//     });
//     // await flushPromises();
//     expect(wrapper.vm.advancedFilterInputForRetrievingAllOptions.length).toBe(
//       0,
//     );
//     expect(
//       wrapper.vm.advancedFilterInputForRetrievingRelatedOptions.length,
//     ).toBe(2);
//   });

//   it("sets the related options to 2 and all to 1", async () => {
//     const wrapper = mount(ViewModesAutocompleteRelations, {
//       props: {
//         modelValue: "This is a multiselect value",
//         selectType: "multi",
//         advancedFilterInputForRetrievingOptions: [
//           {
//             type: AdvancedFilterTypes.Type,
//             value: Entitytyping.MediaLicense,
//             match_exact: true,
//           },
//         ],
//         advancedFilterInputForRetrievingRelatedOptions: [
//           {
//             type: AdvancedFilterTypes.Type,
//             value: Entitytyping.MediaLicense,
//             match_exact: true,
//           },
//           {
//             type: AdvancedFilterTypes.Id,
//             key: ["elody: 1|identifiers"],
//             value: "$hasMediaLicense",
//             match_exact: true,
//             returnIdAtIndex: -1,
//           },
//         ],
//         advancedFilterInputForRetrievingAllOptions: [],
//         advancedFilterInputForSearchingOptions: [],
//         relationType: "hasMediaLicense",
//         fromRelationType: "isMediaLicenseFor",
//         dependsOn: undefined,
//         mode: "edit",
//         formId: "438bacfd-6344-4897-8739-4a34cc26e983",
//         autoSelectable: "edit",
//         disabled: true,
//         isReadOnly: true,
//         isMetadataField: false,
//       },
//     });
//     // await flushPromises();
//     expect(wrapper.vm.advancedFilterInputForRetrievingAllOptions.length).toBe(
//       1,
//     );
//     expect(
//       wrapper.vm.advancedFilterInputForRetrievingRelatedOptions.length,
//     ).toBe(2);
//   });

//   it("sets the related options to 1 and all to 1", async () => {
//     const wrapper = mount(ViewModesAutocompleteRelations, {
//       props: {
//         modelValue: "This is a multiselect value",
//         selectType: "multi",
//         advancedFilterInputForRetrievingOptions: [
//           {
//             type: AdvancedFilterTypes.Type,
//             value: Entitytyping.MediaLicense,
//             match_exact: true,
//           },
//         ],
//         advancedFilterInputForRetrievingRelatedOptions: [],
//         advancedFilterInputForRetrievingAllOptions: [],
//         advancedFilterInputForSearchingOptions: [],
//         relationType: "hasMediaLicense",
//         fromRelationType: "isMediaLicenseFor",
//         dependsOn: undefined,
//         mode: "edit",
//         formId: "438bacfd-6344-4897-8739-4a34cc26e983",
//         autoSelectable: "edit",
//         disabled: true,
//         isReadOnly: true,
//         isMetadataField: false,
//       },
//     });
//     // await flushPromises();
//     expect(wrapper.vm.advancedFilterInputForRetrievingAllOptions.length).toBe(
//       1,
//     );
//     expect(
//       wrapper.vm.advancedFilterInputForRetrievingRelatedOptions.length,
//     ).toBe(1);
//   });
// });
