import useDropzoneHelper from "@/composables/useDropzoneHelper";
import { ref } from "vue";
import  { MenuLinkType}  from "@/generated-types/queries";
import type { MenuItem } from "@/generated-types/queries";
import { useRouter } from "vue-router";
import { modalChoices } from "./useUploadModal";
import useUploadModal, { modalChoices }  from "../composables/useUploadModal";
const { openUploadModal } = useUploadModal();
const {openCreateModal} = useCreateModal();
const router = useRouter();


const useMenuHelper = () => {
    const checkIfRouteOrModal = (_menuItem:MenuItem) =>{
        if (_menuItem.linkType === MenuLinkType.Modal) {
            if (_menuItem.destination === "Upload") {
              openUploadModal(modalChoices.DROPZONE);
            }
            if(_menuItem.destination === "Nieuw"){
              openCreateModal();
            }
          } else if (_menuItem.linkType === MenuLinkType.Route) {
            router.push(`/${_menuItem.destination}`);
          }
    }
    return {
        checkIfRouteOrModal
    }
  };


export default useMenuHelper;