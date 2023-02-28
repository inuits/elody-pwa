import  { MenuLinkType}  from "@/generated-types/queries";
import type { MenuItem } from "@/generated-types/queries";
import {useRouter}   from "vue-router";
import useUploadModal, { modalChoices }  from "../composables/useUploadModal";
import { useCreateModal } from "@/components/CreateModal.vue";
const { openUploadModal } = useUploadModal();
const {openCreateModal} = useCreateModal();



const useMenuHelper = () => {
  const router = useRouter();
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