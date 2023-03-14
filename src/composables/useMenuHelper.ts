import { MenuLinkType, type Menu } from "@/generated-types/queries";
import type { MenuItem } from "@/generated-types/queries";
import { useRouter } from "vue-router";
import useUploadModal, { modalChoices } from "@/composables/useUploadModal";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { ref } from "vue";
import { TypeModals } from "@/composables/modalFactory";
const { openUploadModal, closeUploadModal } = useUploadModal();
const {  getModal } = useAvailableModals();
const selectedMenuItem = ref<String | 'no-item-selected'>("no-item-selected");

export const useMenuHelper = () => {
  const router = useRouter();
  const showdropdown = ref(false);

  const checkIfRouteOrModal = (_menuItem: MenuItem): void => {
    if (_menuItem.linkType === MenuLinkType.Modal) {
      getModal(_menuItem.destination as TypeModals).openModal();
      
       if (_menuItem.destination === TypeModals.Upload) {
          openUploadModal(modalChoices.DROPZONE);
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