import { RouteLocationNormalizedLoaded } from 'vue-router'

export const getRouteParams = (
  route: RouteLocationNormalizedLoaded,
  key: string
): string => {
  if (Array.isArray(route.params[key])) {
    return route.params[key][0]
  } else {
    const routeParam: string = route.params[key] as string
    return routeParam
  }
}
