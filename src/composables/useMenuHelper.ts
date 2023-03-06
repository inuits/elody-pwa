import { MenuLinkType, type Menu } from "@/generated-types/queries";
import type { MenuItem } from "@/generated-types/queries";
import { useRouter } from "vue-router";
import useUploadModal, { modalChoices } from "@/composables/useUploadModal";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { ref } from "vue";
const { openUploadModal, closeUploadModal } = useUploadModal();
const { openModal, closeModal } = useAvailableModals();
const selectedMenuItem = ref<String | 'no-item-selected'>("no-item-selected");

export const useMenuHelper = () => {
  const router = useRouter();
  const showdropdown = ref(false);

  const checkIfRouteOrModal = (_menuItem: MenuItem) => {

    if (_menuItem.linkType === MenuLinkType.Modal) {
      if (_menuItem.destination === "Upload") {
        openUploadModal(modalChoices.DROPZONE);
      }
      if (_menuItem.destination === "Nieuw") {
        openModal();
      }
    } else if (_menuItem.linkType === MenuLinkType.Route) {
      router.push(`/${_menuItem.destination}`);
    }
  };
  const toggleDropDown = () => {
    showdropdown.value = !showdropdown.value;
  };
  const isMenuItemActive = (menuItem: MenuItem): boolean => {
    if (selectedMenuItem.value === menuItem.destination) {
      return true;
    }
    else {
      showdropdown.value = false;
      return false;
    }
  };
  const resetSelectedMenuItem = () => {
    selectedMenuItem.value = "no-item-selected"
  };

  // const menuHandler = (menu: Menu): MenuItem[] => {
  //   let newMenu: Array<MenuItem> = [];
  //   for (const key in menu) {
  //     if (
  //       menu[key].linkType === MenuLinkType.Route ||
  //       menu[key].linkType === MenuLinkType.Modal
  //     ) {
  //       newMenu.push(menu[key]);
  //     }
  //   }
  //   return newMenu;
  // }

  return {
    checkIfRouteOrModal,
    showdropdown,
    toggleDropDown,
    selectedMenuItem,
    isMenuItemActive,
    resetSelectedMenuItem
  }
};

export default useMenuHelper;