import type { ConfigItem } from "@/generated-types/queries";

export const getBasicMapProperties = (config: ConfigItem[]) => {
  if (!config) return [];
  return (
    config.reduce((resultObject: any, configItem: ConfigItem) => {
      resultObject[configItem.key] = configItem.value;
      return resultObject;
    }, {}) || []
  );
};
