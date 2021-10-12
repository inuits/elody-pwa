import { useQuery } from '@vue/apollo-composable';
import { computed } from 'vue';
import { GetEnumsByNameDocument } from './queries';

export const getFromObjectArrayByKey = <T>(
  array: T[],
  key: string,
  value: number | string,
): T[] => {
  const filter = array.filter((obj: T) => {
    if (typeof obj === 'object' && hasOwnProperty(obj, key)) {
      return obj[key] === value;
    }
  });

  return filter;
};

export const hasOwnProperty = <X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> => {
  return obj.hasOwnProperty(prop);
};

export const asString = (x: string | string[]) => (Array.isArray(x) ? x[0] : x);

export const getEnumValuesOf = (enumName: string) => {
  const { result } = useQuery(GetEnumsByNameDocument, { enumName: enumName });
  return result;
};
