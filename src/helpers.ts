import { RouteLocationNormalizedLoaded } from 'vue-router'

export const getRouteParams = (route: RouteLocationNormalizedLoaded, key: string): string =>
  Array.isArray(route.params[key])
    ? route.params[key][0]
    : route.params[key] as string;
