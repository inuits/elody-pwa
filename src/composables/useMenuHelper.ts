import { MenuLinkType, type Menu } from "@/generated-types/queries";
import type { MenuItem } from "@/generated-types/queries";
import { useRouter } from "vue-router";
import useUploadModal, { modalChoices } from "@/composables/useUploadModal";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { ref } from "vue";
import { TypeModals } from "./modalFactory";
const { openUploadModal, closeUploadModal } = useUploadModal();
const {  createmodal, uploadModal } = useAvailableModals();
const selectedMenuItem = ref<String | 'no-item-selected'>("no-item-selected");

export const useMenuHelper = () => {
  const router = useRouter();
  const showdropdown = ref(false);

  const checkIfRouteOrModal = (_menuItem: MenuItem):String => {
    if (_menuItem.linkType === MenuLinkType.Modal) {
      if (_menuItem.destination === TypeModals.Upload) {
        openUploadModal(modalChoices.DROPZONE);
        return _menuItem.destination; 
      }
      if (_menuItem.destination === TypeModals.Create) {
        createmodal?.openModal()
        return _menuItem.destination;
      }
    } else if (_menuItem.linkType === MenuLinkType.Route) {
      router.push(`/${_menuItem.destination}`);
      return _menuItem.destination;
    }
    return ''
  };
  const toggleDropDown = () => {
    showdropdown.value = !showdropdown.value;
  };
  const isMenuItemActive = (menuItem: MenuItem) : boolean => {
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