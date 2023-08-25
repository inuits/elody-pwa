import {
  type MenuItem,
  TypeModals,
  ModalChoices,
  type GetMenuQueryVariables,
  type GetMenuQuery,
  GetMenuDocument,
} from "@/generated-types/queries";
import { useRouter } from "vue-router";
import { useBaseModal } from "@/composables/useBaseModal";
import { reactive, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
const { openModal } = useBaseModal();
const selectedMenuItem = ref<MenuItem | undefined>(undefined);
const menuItems = ref<Array<MenuItem>>([]);

export const useMenuHelper = () => {
  const router = useRouter();

  const setSelectedMenuItem = (menuItem: MenuItem) => {
    selectedMenuItem.value = menuItem;
  };

  const checkIfRouteOrModal = (_menuItem: MenuItem): void => {
    if (_menuItem?.typeLink?.modal) {
      openModal(
        _menuItem.typeLink.modal.typeModal as TypeModals,
        ModalChoices.Import
      );
    } else if (_menuItem?.typeLink?.route && !_menuItem.subMenu) {
      router.push(`/${_menuItem.typeLink.route.destination}`);
    }
  };

  const resetSelectedMenuItem = () => {
    selectedMenuItem.value = undefined;
  };

  const queryVariables = reactive<GetMenuQueryVariables>({ name: "main-menu" });
  const { onResult } = useQuery<GetMenuQuery>(GetMenuDocument, queryVariables);
  const getMenuEntities = () => {
    onResult((value) => {
      menuItems.value = Object.values(value.data?.Menu?.menu || {}).filter(
        (menu) => menu?.typeLink
      );
      setSelectedMenuItem(menuItems.value[0]);
    });
  };

  return {
    setSelectedMenuItem,
    checkIfRouteOrModal,
    selectedMenuItem,
    resetSelectedMenuItem,
    getMenuEntities,
    menuItems,
  };
};

export default useMenuHelper;
