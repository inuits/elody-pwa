import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { nextTick, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import NavRail from "../NavRail.vue";
import MobileTopBar from "../MobileTopBar.vue";
import useMenuHelper from "@/composables/useMenuHelper";
import { NavMode, isCompact, useNavMenu } from "@/composables/useNavMenu";
import type { MenuItem } from "@/generated-types/queries";

const link = (label: string, icon: string, destination: string) => ({
  label,
  icon,
  typeLink: { route: { destination } },
});

const sampleMenu = [
  link("Library", "BookOpen", "library"),
  link("Collections", "Folder", "collections"),
  {
    ...link("Organisations", "Apps", "organisations"),
    subMenu: {
      name: "sub-menu-organisations",
      companies: link("Companies", "Apps", "companies"),
      venues: link("Venues", "Apps", "venues"),
    },
  },
  link("Media", "Image", "media"),
] as unknown as MenuItem[];

const useSampleMenu = (mode: NavMode, compact: boolean, drawerOpen = false) => {
  const { menuItems } = useMenuHelper();
  const { setMode, openDrawer, closeDrawer } = useNavMenu();
  menuItems.value = sampleMenu;
  const stopRefill = watch(menuItems, (items) => {
    if (!items.length) menuItems.value = sampleMenu;
  });
  setMode(mode);
  isCompact.value = compact;
  closeDrawer();
  if (drawerOpen)
    useRouter()
      .isReady()
      .then(() => nextTick(openDrawer));
  onBeforeUnmount(() => {
    stopRefill();
    isCompact.value = false;
    closeDrawer();
  });
};

const meta: Meta<typeof NavRail> = {
  title: "Navigation/NavRail",
  component: NavRail,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The main navigation. On desktop a 52px rail that the top button " +
          "keeps open at 320px beside the page; a group opens a flyout on " +
          "the rail and opens inline when the menu is open. Below 768px the " +
          "rail becomes a top bar with a menu button that opens a drawer.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NavRail>;

export const Closed: Story = {
  render: () => ({
    components: { NavRail },
    setup: () => useSampleMenu(NavMode.Collapsed, false),
    template: `<div style="height:100vh"><nav-rail /></div>`,
  }),
};

export const Open: Story = {
  render: () => ({
    components: { NavRail },
    setup: () => useSampleMenu(NavMode.Expanded, false),
    template: `<div style="height:100vh"><nav-rail /></div>`,
  }),
};

export const MobileTopBarOnly: Story = {
  name: "Mobile: top bar",
  render: () => ({
    components: { NavRail, MobileTopBar },
    setup: () => useSampleMenu(NavMode.Collapsed, true),
    template: `<div style="height:100vh"><mobile-top-bar /><nav-rail /></div>`,
  }),
};

export const MobileDrawer: Story = {
  name: "Mobile: drawer open",
  render: () => ({
    components: { NavRail, MobileTopBar },
    setup: () => useSampleMenu(NavMode.Collapsed, true, true),
    template: `<div style="height:100vh"><mobile-top-bar /><nav-rail /></div>`,
  }),
};
