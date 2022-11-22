import { ref } from "vue";
type ModalState = "initial" | "show" | "hide" | "loading";
export type CreateModalType = {
  state: ModalState;
};

const createModalState = ref<CreateModalType>({
  state: "hide",
});

const isDisplayingContextMenu = ref<Boolean>(false);
const savedSearches = ref<any>([]);
const pickedSavedSearch = ref<any>();

export type PickEntityModalType = {
  state: ModalState;
  pickedEntity: any;
  acceptedEntityTypes?: any;
};

const SearchSavedSearchesModalState = ref<PickEntityModalType>({
  state: "hide",
  pickedEntity: undefined,
  acceptedEntityTypes: [],
});

export const useSavedSearchHelper = () => {
  const toggleContextMenu = () => {
    isDisplayingContextMenu.value = !isDisplayingContextMenu.value;
  };

  const updateCreateModal = (CreateModalInput: CreateModalType) => {
    createModalState.value = CreateModalInput;
  };

  const closeCreateModal = () => {
    updateCreateModal({
      state: "hide",
    });
  };

  const openCreateModal = () => {
    updateCreateModal({
      state: "show",
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

  const openSearchSavedSearchesModal = (acceptedEntityTypes: any) => {
    updateSearchSavedSearchesModal({
      state: "show",
      pickedEntity: undefined,
      acceptedEntityTypes: acceptedEntityTypes,
    });
  };

  return {
    createModalState,
    closeCreateModal,
    openCreateModal,
    isDisplayingContextMenu,
    toggleContextMenu,
    savedSearches,
    pickedSavedSearch,
    closeSearchSavedSearchesModal,
    openSearchSavedSearchesModal,
    SearchSavedSearchesModalState,
  };
};
