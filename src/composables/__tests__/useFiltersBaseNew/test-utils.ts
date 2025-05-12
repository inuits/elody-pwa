export const sortFilters = (filters: any[]) => {
  return [...filters].sort((a, b) => {
    const keyA = Array.isArray(a.key) ? a.key.join("") : a.key;
    const keyB = Array.isArray(b.key) ? b.key.join("") : b.key;

    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;

    if (a.type < b.type) return -1;
    if (a.type > b.type) return 1;

    return String(a.value).localeCompare(String(b.value));
  });
};

export const basicInputFromState = {
  type: undefined,
  parent_key: undefined,
  key: undefined,
  value: undefined,
  match_exact: true,
  item_types: undefined,
};
