import {
  type MenuItem,
  TypeModals,
  ModalChoices,
} from "@/generated-types/queries";
import { useRouter } from "vue-router";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { ref } from "vue";
const { getModal } = useAvailableModals();
const selectedMenuItem = ref<String | "no-item-selected">("no-item-selected");

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

  return {
    checkIfRouteOrModal,
    showdropdown,
    toggleDropDown,
    selectedMenuItem,
    isMenuItemActive,
    resetSelectedMenuItem,
  };
};

export default useMenuHelper;
