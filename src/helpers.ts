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
