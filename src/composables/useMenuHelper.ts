import {
  type MenuItem,
  TypeModals,
  ModalChoices,
  type GetMenuQueryVariables,
  type GetMenuQuery,
  GetMenuDocument,
} from "@/generated-types/queries";
import { useRouter } from "vue-router";
import { useBaseModal } from "@/composables/useBaseModal";
import { reactive, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
const { openModal } = useBaseModal();
const selectedMenuItem = ref<MenuItem | undefined>(undefined);
const selectedMenuItemPath = ref<string>(undefined);
const menuItems = ref<Array<MenuItem>>([]);
const menuDestinations = ref<Array<string>>([]);

export const useMenuHelper = () => {
  const router = useRouter();

  const setSelectedMenuItem = (menuItem: MenuItem) => {
    selectedMenuItem.value = menuItem;
    const menu = ref<Array<MenuItem>>([menuItem]);
    const destinations = getMenuDestinations(menu);
    if(destinations) selectedMenuItemPath.value = `/${destinations.value[0]}`;
  };

  const checkIfRouteOrModal = (_menuItem: MenuItem): void => {
    if (_menuItem?.typeLink?.modal) {
      openModal(
        _menuItem.typeLink.modal.typeModal as TypeModals,
        ModalChoices.Import,
        "left"
      );
    } else if (_menuItem?.typeLink?.route && !_menuItem.subMenu) {
      router.push(`/${_menuItem.typeLink.route.destination}`);
    }
  };

  const resetSelectedMenuItem = () => {
    selectedMenuItem.value = undefined;
    selectedMenuItemPath.value = undefined;
  };

  const queryVariables = reactive<GetMenuQueryVariables>({ name: "main-menu" });
  const { onResult } = useQuery<GetMenuQuery>(GetMenuDocument, queryVariables);
  const getMenuEntities = () => {
    onResult((value) => {
      menuItems.value = Object.values(value.data?.Menu?.menu || {}).filter(
        (menu) => menu?.typeLink
      );
      setSelectedMenuItem(menuItems.value[0]);
    });
  };

  const getMenuDestinations = (menuItemsToTraverse?: ref<Array<MenuItem>>) => {
    menuDestinations.value = [];
    if(!menuItemsToTraverse) {
      menuItemsToTraverse = menuItems;
    }
    menuItemsToTraverse.value.forEach((menuItem) => {
      if(menuItem.subMenu) {
        const entries = Object.entries(menuItem.subMenu);
        for (let i = 2; i < entries.length; i += 1) {
          const [objectKey, objectValue] = entries[i];
          const destination = objectValue.typeLink.route.destination;
          menuDestinations.value.push(destination);
        }
      }
    })
    return menuDestinations;
  }

  return {
    setSelectedMenuItem,
    checkIfRouteOrModal,
    selectedMenuItem,
    selectedMenuItemPath,
    resetSelectedMenuItem,
    getMenuEntities,
    menuItems,
    getMenuDestinations
  };
};

export default useMenuHelper;
