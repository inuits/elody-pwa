import { expect, test} from "vitest";
import { MenuLinkType, type MenuItem } from "@/generated-types/queries";
import useMenuHelper from "@/composables/useMenuHelper";
import { useCreateModal } from "@/components/CreateModal.vue"
import useUploadModal, { modalChoices } from "@/composables/useUploadModal";
import { useRouter } from "vue-router";

const router = useRouter();const { openUploadModal, closeUploadModal } = useUploadModal();
const { openCreateModal, closeCreateModal } = useCreateModal();
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

test('should open create modal when link type is modal and destination is Nieuw', () => {
  const menuItem: MenuItem = {
    linkType: MenuLinkType.Modal,
    destination: 'Nieuw',
    label:"Nieuw"

  };
  checkIfRouteOrModal(menuItem);
  expect(openCreateModal());
});

test('Opens the route of Home', async () => {
  const menuItem:MenuItem = {
    linkType: MenuLinkType.Route,
    destination:'/Home',
    label:'Home'
  }
  router.push('/Home');
  await router.isReady();
  checkIfRouteOrModal(menuItem);
  
  expect(router.push).toBe('/Home');
})


