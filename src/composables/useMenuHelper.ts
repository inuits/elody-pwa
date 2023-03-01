import { MenuLinkType } from "@/generated-types/queries";
import type { MenuItem } from "@/generated-types/queries";
import { useRouter } from "vue-router";
import useUploadModal, { modalChoices } from "../composables/useUploadModal";
import { useCreateModal } from "@/components/CreateModal.vue";
import { ref } from "vue";
const { openUploadModal, closeUploadModal } = useUploadModal();
const { openCreateModal, closeCreateModal } = useCreateModal();
const selectedMenuItem = ref<String>("");

export const useMenuHelper = () => {
  const router = useRouter();
  const showdropdown = ref(false);
  const checkIfRouteOrModal = (_menuItem: MenuItem) => {
    if (_menuItem.linkType === MenuLinkType.Modal) {
      if (_menuItem.destination === "Upload") {
        openUploadModal(modalChoices.DROPZONE);
      }
      if (_menuItem.destination === "Nieuw") {
        openCreateModal();
      }
    } else if (_menuItem.linkType === MenuLinkType.Route) {
      router.push(`/${_menuItem.destination}`);
    }
  }
  const toggleDropDown = () => {
    showdropdown.value = !showdropdown.value;
  };
  const isMenuItemActive = (menuItem:MenuItem):boolean => {
    if(selectedMenuItem.value === menuItem.destination){
      return true;
    }
    else {
      showdropdown.value = false;
      return false;
    }
  } 
  const resetSelectedMenuItem = () => {
    selectedMenuItem.value = ""
  }
 
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