import type { TypeModals } from "@/generated-types/queries";
import {
  type MenuItem,
  type GetMenuQueryVariables,
  type GetMenuQuery,
  GetMenuDocument,
  ModalStyle,
} from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";
import { reactive, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { usePermissions } from "@/composables/usePermissions";
const { openModal } = useBaseModal();
const { extractMenuPermissions, fetchAdvancedPermissions } = usePermissions();

const selectedMenuItem = ref<MenuItem | undefined>(undefined);
const selectedMenuItemPath = ref<string>(undefined);
const menuItems = ref<Array<MenuItem>>([]);
const isExpanded = ref<boolean>(false);
const menuDestinations = ref<{ entityType: string; destination: string }[]>([]);

export enum MenuItemType {
  modal = "modal",
  link = "link",
}

type MenuAction = {
  menuItemType: MenuItemType;
  action: Function | string;
};

export const useMenuHelper = () => {
  const setSelectedMenuItem = (menuItem: MenuItem) => {
    if (!menuItem) return;
    selectedMenuItem.value = menuItem;
    const menu = ref<Array<MenuItem>>([menuItem]);
    const destinations = getMenuDestinations(menu);
    if (destinations && destinations.length > 0)
      selectedMenuItemPath.value = `/${destinations[0].destination}`;
  };

  const checkIfRouteOrModal = (_menuItem: MenuItem): MenuAction | undefined => {
    let action: MenuAction | undefined = undefined;
    if (_menuItem.typeLink && _menuItem.typeLink.modal) {
      action = {
        menuItemType: MenuItemType.modal,
        action: function () {
          openModal(
            _menuItem.typeLink?.modal?.typeModal as TypeModals,
            ModalStyle.Center,
            _menuItem.typeLink?.modal?.formQuery,
          );
        },
      };
    } else if (_menuItem?.typeLink?.route && !_menuItem.subMenu) {
      action = {
        menuItemType: MenuItemType.link,
        action: `/${_menuItem.typeLink.route.destination}`,
      };
    }
    return action;
  };

  const resetSelectedMenuItem = () => {
    selectedMenuItem.value = undefined;
    selectedMenuItemPath.value = undefined;
  };

  const queryVariables = reactive<GetMenuQueryVariables>({ name: "main-menu" });
  const { onResult } = useQuery<GetMenuQuery>(GetMenuDocument, queryVariables);
  const getMenuEntities = () => {
    onResult(async (value) => {
      if (value.loading || value.partial) {
        return;
      }

      const menu = Object.values(value.data?.Menu?.menu || {}).filter(
        (menu) => menu?.typeLink,
      );
      const extractedPermissions = await extractMenuPermissions(menu);
      if (extractedPermissions.length !== 0)
        await fetchAdvancedPermissions(extractedPermissions);

      menuItems.value = menu;
      setSelectedMenuItem(menuItems.value[0]);
    });
  };

  const getMenuDestinations = (menuItemsToTraverse?: ref<Array<MenuItem>>) => {
    menuDestinations.value = [];
    if (!menuItemsToTraverse) {
      menuItemsToTraverse = menuItems;
    }
    menuItemsToTraverse.value.forEach((menuItem) => {
      if (menuItem.subMenu) {
        const entries = Object.entries(menuItem.subMenu);
        for (let i = 2; i < entries.length; i += 1) {
          const [objectKey, objectValue] = entries[i];
          if (!objectValue.typeLink.route) return;
          const destination = objectValue?.typeLink?.route.destination;
          if (destination)
            menuDestinations.value.push({
              entityType: objectValue.entityType,
              destination,
            });
        }
      } else {
        const destination = menuItem.typeLink.route?.destination;
        if (destination)
          menuDestinations.value.push({
            entityType: menuItem.entityType,
            destination,
          });
      }
    });
    return menuDestinations.value;
  };

  const changeExpandedState = (newState: boolean) => {
    isExpanded.value = newState;
  };

  return {
    setSelectedMenuItem,
    checkIfRouteOrModal,
    selectedMenuItem,
    selectedMenuItemPath,
    resetSelectedMenuItem,
    getMenuEntities,
    menuItems,
    getMenuDestinations,
    changeExpandedState,
    isExpanded,
  };
};

export default useMenuHelper;
