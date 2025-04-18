import type { Entity } from "@/generated-types/queries";

const useRegexChecker = () => {

  const checkRegexForOneWayRelations = (filterValue: String | undefined, entity: Entity | undefined): [boolean, Array] => {
    if (!filterValue || !entity) return [false, []];
    const regex = /relations\.([^.]+)\.key/;
    const match = filterValue?.match(regex);
    if (match && match[1]) {
      const ids = entity.relationValues[match[1].split("$")[1]].map(relation => relation["key"]);
      return [true, ids];
    }
    return [false, []];
  }

  return {
    checkRegexForOneWayRelations,
  }
}

export { useRegexChecker };