import { ref } from "vue";

export enum Loader {
  BaseLibrary,
}

export enum LoadingElement {
  Items,
  UI,
}

enum LoadingState {
  Loaded,
  Loading,
}

const states = ref<Map<Loader, Map<LoadingElement, LoadingState>>>(new Map());

export const useLoadingState = () => {
  const finishLoadingElement = (loader: Loader, element: LoadingElement) =>
    states.value.get(loader)?.set(element, LoadingState.Loaded);

  const isLoaded = (loader: Loader) => {
    for (const state of states.value.get(loader)?.values() || [])
      if (state !== LoadingState.Loaded) return false;
    return true;
  };

  const isLoading = (loader: Loader) => {
    for (const state of states.value.get(loader)?.values() || [])
      if (state === LoadingState.Loading) return true;
    return false;
  };

  const startLoader = (loader: Loader) => {
    const elementStates = new Map<LoadingElement, LoadingState>();
    switch (loader) {
      case Loader.BaseLibrary: {
        elementStates.set(LoadingElement.Items, LoadingState.Loading);
        elementStates.set(LoadingElement.UI, LoadingState.Loading);
        break;
      }
      default: {
        break;
      }
    }
    states.value.set(loader, elementStates);
  };

  return { finishLoadingElement, isLoaded, isLoading, startLoader };
};
