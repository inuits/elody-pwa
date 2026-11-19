import { inject, provide, type InjectionKey } from "vue";
import { useRouter, type RouteLocationRaw } from "vue-router";
import { mapUrlToEntityType } from "@/helpers";

export type EntityNavigationTarget = { id: string; type: string };
export type EntityNavigationScope = (target: EntityNavigationTarget) => void;

const EntityNavigationScopeKey: InjectionKey<EntityNavigationScope> = Symbol(
  "EntityNavigationScope",
);

export const provideEntityNavigationScope = (
  scope: EntityNavigationScope,
): void => provide(EntityNavigationScopeKey, scope);

export const useScopedEntityNavigation = () => {
  const scope = inject(EntityNavigationScopeKey, undefined);
  const router = useRouter();

  const resolveTarget = (
    location: RouteLocationRaw,
  ): EntityNavigationTarget | undefined => {
    const { id, type } = router.resolve(location).params ?? {};
    if (!id || !type) return undefined;
    const slug = String(type);
    return { id: String(id), type: mapUrlToEntityType(slug) || slug };
  };

  const navigate = (location: RouteLocationRaw): void => {
    const target = scope ? resolveTarget(location) : undefined;
    if (scope && target) {
      scope(target);
      return;
    }
    router.push(location);
  };

  return { isScoped: Boolean(scope), navigate, resolveTarget };
};
