import { registerQueryFixture } from "@/main";

const dir = (parent: string, name: string, hasSubdirs: boolean) => ({
  __typename: "Directory",
  id: `${parent === "/" ? "" : parent}/${name}`,
  dir: name,
  parent,
  has_subdirs: hasSubdirs,
});

const tree: Record<string, ReturnType<typeof dir>[]> = {
  "": [
    dir("/", "archive", true),
    dir("/", "acquisitions-2026", true),
    dir("/", "loose-scans", false),
  ],
  "/archive/": [
    dir("/archive", "newspapers", true),
    dir("/archive", "photographs", false),
  ],
  "/acquisitions-2026/": [dir("/acquisitions-2026", "batch-01", false)],
  "/archive/newspapers/": [dir("/archive/newspapers", "1914", false)],
};

export const registerDirectories = () =>
  registerQueryFixture(
    "getDirectories",
    (variables?: { dir?: string }) => ({
      Directories: tree[variables?.dir ?? ""] ?? [],
    }),
  );

const waitFor = async <T>(find: () => T | null | undefined) => {
  for (let i = 0; i < 40 && !find(); i++)
    await new Promise((resolve) => setTimeout(resolve, 50));
  return find();
};

export const openAndSelect = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const rows = () =>
    canvasElement.querySelectorAll<HTMLElement>('[data-test="li-tree"]');
  await waitFor(() => rows()[0]);
  rows()[0].querySelector<HTMLElement>(".grow-0")?.click();
  await waitFor(() => rows().length > 3);
  rows()[1].querySelector<HTMLElement>(".grow")?.click();
};

