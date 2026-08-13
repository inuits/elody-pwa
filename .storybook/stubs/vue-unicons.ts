// Stand-in for vue-unicons under vitest. The real package ships a UMD build
// that breaks with vitest's SSR interop, and its icon lib is only populated
// by app-bootstrap code (main.ts / preview.ts setup) that portable stories
// don't run. BaseIcon.vue does `Unicon.lib.find(...).path`, so `find` must
// always return an icon-shaped object; unknown names fall back to an empty
// path instead of crashing. Real icons still render in the browser Storybook.
type Icon = { name: string; style?: string; path?: string };

const registered: Icon[] = [];

const lib = {
  find(predicate: (icon: Icon) => boolean): Icon {
    return (
      registered.find(predicate) ?? { name: "", style: "line", path: "" }
    );
  },
};

export const Unicon = {
  add(icons: Icon[]) {
    registered.push(...icons);
  },
  install() {},
  lib,
};

export default Unicon;
