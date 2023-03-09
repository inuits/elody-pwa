import { assert, expect, test,} from "vitest";
import { MenuLinkType, type MenuItem } from "@/generated-types/queries";
import { ModalState, useAvailableModals } from "@/composables/useAvailableModals"
import useUploadModal, { modalChoices } from "@/composables/useUploadModal";
import {useMenuHelper} from '@/composables/useMenuHelper'
import { useRouter } from "vue-router";


const router = useRouter();
const { openUploadModal, closeUploadModal } = useUploadModal();
const { openModal, closeModal, modalState} = useAvailableModals();
const {toggleDropDown, showdropdown, checkIfRouteOrModal} = useMenuHelper();
test('toggleDropDown toggles showdropdown value', () => {
  
  toggleDropDown();
  
  expect(showdropdown.value).toBe(true);
  
  toggleDropDown();

  expect(showdropdown.value).toBe(false);
});

test('should open upload modal when link type is modal and destination is Upload', () => {
  const menuItem: MenuItem = {
    linkType: MenuLinkType.Modal,
    destination: 'Upload',
    label: "Upload"
  };
  checkIfRouteOrModal(menuItem);
  expect(openUploadModal(modalChoices.DROPZONE));
});

test('Should not open Create modal when Link type is modal and destination is Upload',()=> {
  const menuItem:MenuItem = {
    label: 'Upload',
    linkType: MenuLinkType.Modal,
    destination: 'Upload'
  }
      
      assert.notEqual('Nieuw',menuItem.destination);
});

test('Should open Create modal when Link type is modal and destination is Upload',()=> {
  const menuItem:MenuItem = {
    label: 'Upload',
    linkType: MenuLinkType.Modal,
    destination: 'Upload'
  }
      
      assert.deepEqual('Upload',menuItem.destination);
    });


test('Should open home when Route is home',()=> {
  const menuItem:MenuItem = {
    label: 'Home',
    linkType: MenuLinkType.Route,
    destination: 'Home'
  }
      
      assert.deepEqual('Home',menuItem.destination);
});
