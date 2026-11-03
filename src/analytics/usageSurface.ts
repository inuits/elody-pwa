import {
  defineComponent,
  hasInjectionContext,
  inject,
  provide,
  type InjectionKey,
} from "vue";

/**
 * Which part of a page an action was started from: the alias of the element
 * in the UI declaration (completenessOverview), on bulk_operation,
 * form_opened and form_submitted. Read when the action happens, so a modal
 * can hand on the part it was opened from.
 */
type UsageSurfaceReader = () => string | undefined;

const usageSurfaceKey: InjectionKey<UsageSurfaceReader> =
  Symbol("usageSurface");

const none: UsageSurfaceReader = () => undefined;

export const provideUsageSurface = (surface: UsageSurfaceReader): void =>
  provide(usageSurfaceKey, surface);

/** Call in a component's setup; outside one there is no surface. */
export const useUsageSurface = (): UsageSurfaceReader =>
  (hasInjectionContext() && inject(usageSurfaceKey, null)) || none;

/** Names what is inside it after an element; the outermost element wins. */
export const UsageSurface = defineComponent({
  name: "UsageSurface",
  props: { name: { type: String, required: false, default: undefined } },
  setup(props, { slots }) {
    const outer = useUsageSurface();
    provideUsageSurface(() => outer() ?? props.name);
    return () => slots.default?.();
  },
});
