import { registerQueryFixture } from "@/main";

const option = (label: string, value: string | number) => ({
  __typename: "DropdownOption",
  icon: null,
  label,
  value,
});

export const registerLibraryFixtures = () => {
  registerQueryFixture("GetPaginationLimitOptions", {
    PaginationLimitOptions: {
      __typename: "PaginationLimitOptions",
      options: [option("20", 20), option("50", 50), option("100", 100)],
    },
  });
  registerQueryFixture("GetSortOptions", {
    EntityTypeSortOptions: {
      __typename: "BaseEntity",
      sortOptions: {
        __typename: "SortOptions",
        options: [
          option("Title", "title"),
          option("Date created", "date_created"),
          option("Date updated", "date_updated"),
        ],
        isAsc: "desc",
      },
    },
  });
};
