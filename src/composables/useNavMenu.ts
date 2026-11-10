import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import type { MenuItem } from "@/generated-types/queries";
import { auth } from "@/main";

export enum NavMode {
  Collapsed = "collapsed",
  Expanded = "expanded",
}

const MODE_STORAGE_KEY = "elody.navMode";

const readStoredMode = (): NavMode => {
  try {
    const stored = localStorage.getItem(MODE_STORAGE_KEY) as NavMode | null;
    return stored && Object.values(NavMode).includes(stored)
      ? stored
      : NavMode.Collapsed;
  } catch {
    return NavMode.Collapsed;
  }
};

const mode = ref<NavMode>(readStoredMode());
const isOpen = computed(() => mode.value === NavMode.Expanded);

// Matches Tailwind's md breakpoint: below it the rail becomes a drawer.
const compactQuery = window.matchMedia?.("(width < 48rem)");
export const isCompact = ref(compactQuery?.matches ?? false);
compactQuery?.addEventListener("change", (event) => {
  isCompact.value = event.matches;
});
const isDrawerOpen = ref(false);
const openDrawer = () => {
  isDrawerOpen.value = true;
};
const closeDrawer = () => {
  isDrawerOpen.value = false;
};

const lastSegmentOf = (path: string) =>
  path.substring(path.lastIndexOf("/") + 1);

const destinationOf = (item: MenuItem) =>
  item.typeLink?.route?.destination as string | undefined;

export const subItemsOf = (item: MenuItem): MenuItem[] =>
  Object.values(item.subMenu ?? {}).filter(
    (subItem: any) => subItem?.typeLink,
  ) as MenuItem[];

export const useNavMenu = () => {
  const route = useRoute();

  const setMode = (newMode: NavMode) => {
    mode.value = newMode;
    try {
      localStorage.setItem(MODE_STORAGE_KEY, newMode);
    } catch {
      return;
    }
  };

  const isVisible = (item: MenuItem) => {
    if (item.isLoggedIn && !auth.isAuthenticated.value) return false;
    return !item.subMenu || subItemsOf(item).length > 0;
  };

  const isCurrent = (item: MenuItem): boolean => {
    const segment = lastSegmentOf(route.path);
    return (
      destinationOf(item) === segment ||
      subItemsOf(item).some((subItem) => destinationOf(subItem) === segment)
    );
  };

  return {
    isOpen,
    setMode,
    isVisible,
    isCurrent,
    isCompact,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
  };
};
