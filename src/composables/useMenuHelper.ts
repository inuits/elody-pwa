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
import useTenant from "./useTenant";

const { openModal } = useBaseModal();

const menuItems = ref<Array<MenuItem>>([]);
const menuDestinations = ref<{ entityType: string; destination: string }[]>([]);

export enum MenuItemType {
  modal = "modal",
  link = "link",
}

type MenuAction = {
  menuItemType: MenuItemType;
  action: () => void | string;
};

export const useMenuHelper = () => {
  const getUrlForMenuItem = (destination: string) => {
    const { selectedTenant, getCodeById } = useTenant();
    if (!selectedTenant.value) return `/${destination}`;
    const code = getCodeById(selectedTenant.value) || selectedTenant;
    return `/${code}/${destination}`;
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
            undefined,
            false,
            undefined,
            { title: _menuItem.label },
          );
        },
      };
    } else if (_menuItem?.typeLink?.route && !_menuItem.subMenu) {
      action = {
        menuItemType: MenuItemType.link,
        action: getUrlForMenuItem(_menuItem.typeLink.route.destination),
      };
    }
    return action;
  };

  const getMenuEntities = () => {
    const queryVariables = reactive<GetMenuQueryVariables>({
      name: "main-menu",
    });
    const { onResult } = useQuery<GetMenuQuery>(
      GetMenuDocument,
      queryVariables,
    );
    onResult(async (value) => {
      if (value.loading || value.partial) {
        return;
      }

      const menu = Object.values(value.data?.Menu?.menu || {}).filter(
        (menu) => menu?.typeLink,
      );

      menuItems.value = menu;
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
          const [, objectValue] = entries[i];
          if (!objectValue?.typeLink?.route) continue;
          const destination = objectValue.typeLink.route.destination;
          if (destination)
            menuDestinations.value.push({
              entityType: objectValue.entityType,
              destination,
            });
        }
      } else {
        const destination = menuItem.typeLink?.route?.destination;
        if (destination)
          menuDestinations.value.push({
            entityType: menuItem.entityType,
            destination,
          });
      }
    });
    return menuDestinations.value;
  };

  return {
    getUrlForMenuItem,
    checkIfRouteOrModal,
    getMenuEntities,
    menuItems,
    getMenuDestinations,
  };
};

export default useMenuHelper;
