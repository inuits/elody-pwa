import {
  type MenuItem,
  TypeModals,
  ModalChoices,
  type GetMenuQueryVariables,
  type GetMenuQuery,
  GetMenuDocument,
} from "@/generated-types/queries";
import { useRoute, useRouter } from "vue-router";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { reactive, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { getEntityIdFromRoute } from "@/helpers";
const { getModal } = useAvailableModals();
const selectedMenuItem = ref<String | "no-item-selected">("no-item-selected");
const menuItems = ref<Array<MenuItem>>([]);

export const useMenuHelper = () => {
  const router = useRouter();
  const showdropdown = ref(false);

  const checkIfRouteOrModal = (_menuItem: MenuItem): void => {
    if (_menuItem.typeLink.modal) {
      getModal(_menuItem.typeLink.modal.typeModal as TypeModals).openModal(
        ModalChoices.Import
      );
    } else if (_menuItem.typeLink.route) {
      router.push(`/${_menuItem.typeLink.route.destination}`);
    }
  };
  const toggleDropDown = () => {
    showdropdown.value = !showdropdown.value;
  };
  const isMenuItemActive = (menuItem: MenuItem): boolean => {
    if (
      selectedMenuItem.value === menuItem.typeLink.route?.destination ||
      selectedMenuItem.value === menuItem.typeLink.modal?.typeModal
    ) {
      return true;
    } else {
      showdropdown.value = false;
      return false;
    }
  };
  const resetSelectedMenuItem = () => {
    selectedMenuItem.value = "no-item-selected";
  };

  const queryVariables = reactive<GetMenuQueryVariables>({ name: "main-menu" });
  const { result: menuQueryResult, onResult } = useQuery<GetMenuQuery>(
    GetMenuDocument,
    queryVariables
  );
  const getMenuEntities = () => {
    onResult((value) => {
      menuItems.value = Object.values(value.data.Menu?.menu || {}).filter(
        (menu) => menu.typeLink
      );
      getEntityIdFromRoute;
      console.log(menuItems.value);
    });
    console.log("This is the route", getEntityIdFromRoute());
  };

  return {
    checkIfRouteOrModal,
    showdropdown,
    toggleDropDown,
    selectedMenuItem,
    isMenuItemActive,
    resetSelectedMenuItem,
    getMenuEntities,
    menuItems,
  };
};

export default useMenuHelper;
