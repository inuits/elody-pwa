export type FiltersLayout = "pane" | "rail";

// shortcut: a per-browser switch while the pane is tried out (user,
// 2026-10-30); drop it with the rail once one layout is chosen.
export const filtersLayout = (): FiltersLayout => {
  try {
    return localStorage.getItem("elody.filtersLayout") === "rail"
      ? "rail"
      : "pane";
  } catch {
    return "pane";
  }
};
