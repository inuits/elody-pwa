import type { Definition, Entity, Maybe, SavedSearchedEntity, SavedSearchInput } from "@/queries";
import { ref } from "vue";
import type { FilterInList } from "./useFilterHelper";
type ModalState = "initial" | "show" | "hide" | "loading";
type ModalActions = "create" | "edit";

export type ModalType = {
  state: ModalState;
  action: ModalActions;
};

const initSavedSearch = () => {
  return {
    definition: [],
    metadata: [
      {
        key: "title",
        value: "",
        lang: "nl",
      },
    ],
    private: true,
    type: "saved_search",
  }
}

const createModalState = ref<ModalType>({
  state: "hide",
  action: "create",
});

const isDisplayingContextMenu = ref<Boolean>(false);

const savedSearches = ref<Array<SavedSearchedEntity>>([]);
const pickedSavedSearch = ref<SavedSearchedEntity | undefined>(undefined);

export type PickEntityModalType = {
  state: ModalState;
  pickedEntity: Entity | undefined;
  acceptedEntityTypes?: Maybe<string>[];
};

function clearTypename(o: any) {
  Object.keys(o).forEach(function (k) {
    if (o[k] === null) {
      delete o[k];
    }

    if (o[k] !== null && typeof o[k] === "object") {
      clearTypename(o[k]);
      return;
    }
    if (typeof o[k] === "string") {
      if (k === "__typename") {
        o[k] = undefined;
      }
    }
  });
}

const setPickedSavedSearch = (res: SavedSearchedEntity | undefined) => {
  if (res) {
    res = JSON.parse(JSON.stringify(res))
    clearTypename(res);
  }
  pickedSavedSearch.value = res;
}

const SearchSavedSearchesModalState = ref<PickEntityModalType>({
  state: "hide",
  pickedEntity: undefined,
  acceptedEntityTypes: [],
});

export const useSavedSearchHelper = () => {
  const toggleContextMenu = () => {
    isDisplayingContextMenu.value = !isDisplayingContextMenu.value;
  };

  const updateCreateModal = (CreateModalInput: ModalType) => {
    createModalState.value = CreateModalInput;
  };

  const closeCreateModal = () => {
    updateCreateModal({
      state: "hide",
      action: "create",
    });
  };

  const openCreateModal = () => {
    updateCreateModal({
      state: "show",
      action: "create",
    });
  };

  const openEditModal = () => {
    updateCreateModal({
      state: "show",
      action: "edit",
    });
  };

  const updateSearchSavedSearchesModal = (
    SearchSavedSearchesModalInput: PickEntityModalType
  ) => {
    SearchSavedSearchesModalState.value = SearchSavedSearchesModalInput;
  };

  const closeSearchSavedSearchesModal = () => {
    updateSearchSavedSearchesModal({
      state: "hide",
      pickedEntity: undefined,
    });
  };

  const openSearchSavedSearchesModal = () => {
    updateSearchSavedSearchesModal({
      state: "show",
      pickedEntity: undefined,
      acceptedEntityTypes: [],
    });
  };

  function sortObj(obj: any) {
      return Object.keys(obj).sort().reduce(function (result: any, key) {
        result[key] = obj[key];
        return result;
      }, {});
    }

  const isNoChangesOriginal = (original: SavedSearchedEntity | undefined, change: Array<FilterInList>) => {
    if (original?.definition) {
      const tmp = ref<SavedSearchInput>(initSavedSearch());
    
      change.forEach((filter: FilterInList) => {
        if (filter.isActive) {
          tmp.value.definition.push(filter.input);
        }
      });

      tmp.value.definition.forEach((def: Definition) => {
        clearTypename(def);
      })


      original.definition.forEach((def: Maybe<Definition>) => {
        clearTypename(def);
      })
      
      if (JSON.stringify(original?.definition.map((def:Maybe<Definition>) => sortObj(def))) === JSON.stringify(tmp.value.definition.map((def:Definition) => sortObj(def)))) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }

  return {
    createModalState,
    closeCreateModal,
    openCreateModal,
    openEditModal,
    isDisplayingContextMenu,
    toggleContextMenu,
    savedSearches,
    pickedSavedSearch,
    closeSearchSavedSearchesModal,
    openSearchSavedSearchesModal,
    SearchSavedSearchesModalState,
    clearTypename,
    setPickedSavedSearch,
    isNoChangesOriginal,
    initSavedSearch
  };
};
