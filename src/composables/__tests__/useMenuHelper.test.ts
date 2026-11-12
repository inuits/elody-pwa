import { describe, it, expect, vi } from "vitest";
import { ModalStyle, TypeModals } from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";

vi.mock("@vue/apollo-composable", () => ({ useQuery: vi.fn() }));
vi.mock("@/composables/useTenant", () => ({ default: () => ({}) }));

import useMenuHelper from "@/composables/useMenuHelper";

describe("useMenuHelper", () => {
  // modal.md: the dialog is named by its title; the menu item says what it opens
  it("opens a menu item's modal titled with the item's label", () => {
    const { checkIfRouteOrModal } = useMenuHelper();
    const action = checkIfRouteOrModal({
      label: "navigation.upload-entities-with-meemoo",
      typeLink: {
        modal: {
          typeModal: TypeModals.DynamicForm,
          formQuery: "GetUploadEntitiesWithoutMediafiles",
        },
      },
    } as any);
    (action!.action as () => void)();
    expect(useBaseModal().getModalInfo(TypeModals.DynamicForm)).toMatchObject({
      open: true,
      modalStyle: ModalStyle.Center,
      formQuery: "GetUploadEntitiesWithoutMediafiles",
      title: "navigation.upload-entities-with-meemoo",
    });
  });
});
