import { describe, test, expect, beforeEach } from "vitest";
import { useBreadcrumb } from "@/composables/useBreadcrumb";

describe("useBreadcrumb", () => {
  let pageInfo,
    visitedPagesOptions,
    selectedVisitedPage,
    showVisitedPages,
    entityTitle,
    showEntityTitle,
    addVisitedPage,
    clearVisitedPages,
    onVisitedPageChange;

  beforeEach(() => {
    pageInfo = { value: {} };
    ({
      visitedPagesOptions,
      selectedVisitedPage,
      showVisitedPages,
      entityTitle,
      showEntityTitle,
      addVisitedPage,
      clearVisitedPages,
      onVisitedPageChange,
    } = useBreadcrumb(pageInfo));
  });

  test("adds visited page", () => {
    addVisitedPage({ entityTitle: "Page 1", path: "/page1" });
    expect(visitedPagesOptions.value).toEqual([
      { label: "Home", value: 0 },
      { label: "Page 1", value: 1 },
    ]);
  });

  test("does not add duplicate visited page", () => {
    addVisitedPage({ entityTitle: "Page 1", path: "/page1" });
    addVisitedPage({ entityTitle: "Page 1", path: "/page1" });
    expect(visitedPagesOptions.value).toEqual([
      { label: "Home", value: 0 },
      { label: "Page 1", value: 1 },
    ]);
  });

  test("clears visited pages and adds home page", () => {
    addVisitedPage({ entityTitle: "Page 1", path: "/page1" });
    addVisitedPage({ entityTitle: "Page 2", path: "/page2" });
    clearVisitedPages();
    expect(visitedPagesOptions.value).toEqual([{ label: "Home", value: 0 }]);
  });

  test("updates page info and visited pages when selected visited page changes", () => {
    addVisitedPage({ entityTitle: "Page 1", path: "/page1" });
    addVisitedPage({ entityTitle: "Page 2", path: "/page2" });
    onVisitedPageChange(0);
    expect(pageInfo.value.entityTitle).toEqual("Home");
    expect(visitedPagesOptions.value).toEqual([{ label: "Home", value: 0 }]);
    expect(showVisitedPages.value).toEqual(false);
    expect(entityTitle.value).toEqual("Home");
    expect(showEntityTitle.value).toEqual(true);
    expect(selectedVisitedPage.value).toEqual(0);
  });
});
