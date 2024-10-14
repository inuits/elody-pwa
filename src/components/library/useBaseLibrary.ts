import type { ApolloClient } from "@apollo/client/core";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import {
  Entitytyping,
  GetEntitiesDocument,
  SearchInputType,
  type AdvancedFilterInput,
  type Entity,
  type GetEntitiesQueryVariables,
  GetEntityByIdDocument,
  type GetEntityByIdQueryVariables,
} from "@/generated-types/queries";
import useEditMode from "@/composables/useEdit";
import { createPlaceholderEntities } from "@/helpers";
import { ref, watch } from "vue";
import { useStateManagement } from "@/composables/useStateManagement";

export const useBaseLibrary = (
  apolloClient: ApolloClient<any>,
  shouldUseStateForRoute: boolean = true
) => {
  let entityType: Entitytyping = Entitytyping.BaseEntity;
  let _route: RouteLocationNormalizedLoaded | undefined;
  const entities = ref<Entity[]>([]);
  const entitiesLoading = ref<boolean>(false);
  const isSearchLibrary = ref<boolean>(false);
  const manipulateQuery = ref<boolean>(false);
  const manipulationQuery = ref<object>();
  const promiseQueue = ref<((entityType: Entitytyping) => Promise<void>)[]>([]);
  const totalEntityCount = ref<number>(0);
  const { getStateForRoute, updateStateForRoute } = useStateManagement();
  const { isSaved } = useEditMode();
  let queryVariables: GetEntitiesQueryVariables = {
    type: entityType,
    limit: 20,
    skip: 1,
    searchValue: {},
    advancedSearchValue: [],
    advancedFilterInputs: [],
    searchInputType: undefined,
    userUuid: "", // refactor needed
  };

  const setManipulationOfQuery = (
    manipulate: boolean,
    manipulation: object
  ) => {
    manipulateQuery.value = manipulate;
    manipulationQuery.value = manipulation;
  };

  const setParentEntityIdentifiers = (identifiers: string[]) => {
    queryVariables.userUuid = identifiers[0];
  };

  const setIsSearchLibrary = (searchLibrary: boolean): void => {
    isSearchLibrary.value = searchLibrary;
  };

  const setEntityType = (type: Entitytyping): void => {
    entityType = type;
    queryVariables.type = type;
  };

  const setsearchInputType = (searchInputType: SearchInputType): void => {
    queryVariables.searchInputType = searchInputType;
  };

  const setAdvancedFilters = async (
    filters: AdvancedFilterInput[],
    stateSaved: boolean = false,
    forceFetch: boolean = false,
    route?: RouteLocationNormalizedLoaded
  ): Promise<void> => {
    if (filters === queryVariables.advancedFilterInputs && !isSaved.value)
      return;
    if (route) _route = route;

    queryVariables.advancedFilterInputs = [];
    queryVariables.advancedFilterInputs = filters;
    if (stateSaved) queryVariables.skip = 1;

    if (shouldUseStateForRoute) updateStateForRoute(_route, { queryVariables });
    if (forceFetch && _route !== undefined) await getEntities(_route);
  };

  const setSkip = async (
    skip: number,
    forceFetch: boolean = false
  ): Promise<void> => {
    queryVariables.skip = skip;
    if (shouldUseStateForRoute) updateStateForRoute(_route, { queryVariables });
    if (forceFetch && _route !== undefined) await getEntities(_route);
  };

  const setLimit = async (
    limit: number,
    forceFetch: boolean = false
  ): Promise<void> => {
    queryVariables.limit = limit;
    if (shouldUseStateForRoute) updateStateForRoute(_route, { queryVariables });
    if (forceFetch && _route !== undefined) await getEntities(_route);
  };

  const setSortKey = async (
    sortKey: string,
    forceFetch: boolean = false
  ): Promise<void> => {
    // queryVariables.searchValue.order_by = sortKey;
    if (shouldUseStateForRoute) updateStateForRoute(_route, { queryVariables });
    if (forceFetch && _route !== undefined) await getEntities(_route);
  };

  const setSortOrder = async (
    sortOrder: "asc" | "desc",
    forceFetch: boolean = false
  ): Promise<void> => {
    // queryVariables.searchValue.isAsc = sortOrder === "asc";
    if (shouldUseStateForRoute) updateStateForRoute(_route, { queryVariables });
    if (forceFetch && _route !== undefined) await getEntities(_route);
  };

  const enqueuePromise = (
    promise: (entityType: Entitytyping) => Promise<void>
  ) => {
    if (
      promise &&
      !promiseQueue.value.find(
        (queuedPromise) => queuedPromise.name === promise.name
      )
    )
      promiseQueue.value.push(promise);
  };

  const getCustomBulkOperations = async () => {
    const bulkOperationsPromise = promiseQueue.value.find(
      (promise) => promise.name === "customBulkOperationsPromise"
    );
    if (bulkOperationsPromise) await bulkOperationsPromise();
    promiseQueue.value = promiseQueue.value.filter(
      (promise) => promise.name !== "customBulkOperationsPromise"
    );
  };

  const getEntities = async (
    route: RouteLocationNormalizedLoaded | undefined
  ): Promise<void> => {
    if (entitiesLoading.value) return;
    entitiesLoading.value = true;

    await Promise.all(promiseQueue.value.map((promise) => promise(entityType)));
    while (promiseQueue.value.length > 0) promiseQueue.value.shift();

    _route = route;
    let variables =
      shouldUseStateForRoute && getStateForRoute(_route)?.queryVariables;
    if (variables) queryVariables = variables;
    else if (!variables && shouldUseStateForRoute)
      updateStateForRoute(_route, { queryVariables });
    if (
      !variables ||
      _route?.name === "SingleEntity" ||
      !shouldUseStateForRoute
    )
      variables = queryVariables;

    await apolloClient
      .query({
        query: manipulateQuery.value
          ? manipulationQuery.value.document
          : GetEntitiesDocument,
        variables,
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        let fetchedEntities = result.data.Entities;
        if (variables.type === "wears") {
          fetchedEntities = {
            count: 1,
            results: [
              {
                _id: "d52bf670-cf0d-45d9-85a2-37ccf18cfed6",
                id: "d52bf670-cf0d-45d9-85a2-37ccf18cfed6",
                uuid: "entities/d52bf670-cf0d-45d9-85a2-37ccf18cfed6",
                type: "wears",
                intialValues: {
                  // @ts-ignore
                  about: [
                    {
                      "@type": "Entiteit",
                      "Entiteit.type": [
                        {
                          "@id": "https://stad.gent/id/concept/570024450",
                          "skos:prefLabel": {
                            "@value": "metaal",
                            "@language": "nl",
                          },
                        },
                        {
                          "@id": "cest:Naam_geassocieerd_concept",
                          label: "associatie.onderwerp",
                        },
                      ],
                    },
                    {
                      "@type": "Entiteit",
                      "Entiteit.type": [
                        {
                          "@id": "http://vocab.getty.edu/aat/300056007",
                          "skos:prefLabel": {
                            "@value": "energie",
                            "@language": "nl",
                          },
                        },
                        {
                          "@id": "cest:Naam_geassocieerd_concept",
                          label: "associatie.onderwerp",
                        },
                      ],
                    },
                    {
                      "@type": "Entiteit",
                      "Entiteit.type": [
                        {
                          "@id": "http://vocab.getty.edu/aat/300011784",
                          "skos:prefLabel": {
                            "@value": "stoom",
                            "@language": "nl",
                          },
                        },
                        {
                          "@id": "cest:Naam_geassocieerd_concept",
                          label: "associatie.onderwerp",
                        },
                      ],
                    },
                    {
                      "@type": "Entiteit",
                      "Entiteit.type": [
                        {
                          "@id": "http://vocab.getty.edu/tgn/7007887",
                          "skos:prefLabel": {
                            "@value": "Gent",
                            "@language": "nl",
                          },
                        },
                        {
                          "@id": "cest:Naam_geassocieerd_concept",
                          label: "associatie.onderwerp",
                        },
                      ],
                    },
                    {
                      "@type": "Entiteit",
                      "Entiteit.type": [
                        {
                          "@id": "http://vocab.getty.edu/tgn/1026817",
                          "skos:prefLabel": {
                            "@value": "Wondelgem",
                            "@language": "nl",
                          },
                        },
                        {
                          "@id": "cest:Naam_geassocieerd_concept",
                          label: "associatie.onderwerp",
                        },
                      ],
                    },
                  ],
                  reference: [
                    {
                      "@type": "Persoon",
                      "Entiteit.type": [
                        {
                          "@id": "https://stad.gent/id/agent/570019416",
                          label: "Mahy Frères nv",
                        },
                        {
                          "@id":
                            "cest:Naam_geassocieerde_persoon_of_instelling",
                          label: "associatie.persoon",
                        },
                      ],
                    },
                    {
                      "@type": "Entiteit",
                      "Entiteit.type": [
                        {
                          "@id": "https://stad.gent/id/concept/570012612",
                          "skos:prefLabel": {
                            "@value": "2de kwart 20ste eeuw",
                            "@language": "nl",
                          },
                        },
                        {
                          "@id": "cest:Periode",
                          label: "associatie.periode",
                        },
                      ],
                    },
                  ],
                  __typename: "IntialValues",
                },
                allowedViewModes: {
                  viewModes: [
                    // @ts-ignore
                    "ViewModesList",
                  ],
                  __typename: "AllowedViewModes",
                },
                teaserMetadata: {
                  // @ts-ignore
                  about: {
                    label: "metadata.labels.about",
                    key: "about",
                    __typename: "PanelMetaData",
                  },
                  reference: {
                    label: "metadata.labels.reference",
                    key: "reference",
                    __typename: "PanelMetaData",
                  },
                  __typename: "teaserMetadata",
                },
                __typename: "Wears",
              },
            ],
          };
        }
        entities.value = fetchedEntities?.results as Entity[];
        totalEntityCount.value = fetchedEntities?.count || 0;
        if (shouldUseStateForRoute)
          updateStateForRoute(_route, {
            entityCountOnPage: fetchedEntities.results.length,
            totalEntityCount: fetchedEntities.count,
          });
        entitiesLoading.value = false;
      })
      .catch(() => {
        entities.value = [];
        entitiesLoading.value = false;
      });
  };

  const getEntityById = async (
    entityType: Entitytyping,
    id: string
  ): Promise<void> => {
    const variables: GetEntityByIdQueryVariables = {
      id: id,
      type: entityType,
    };
    await apolloClient
      .query({
        query: GetEntityByIdDocument,
        variables: variables,
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        const entity = result.data.Entity;
        entities.value.push(entity);
        entitiesLoading.value = false;
      })
      .catch(() => {
        entities.value = [];
        entitiesLoading.value = false;
      });
  };

  watch(
    () => entitiesLoading.value,
    () => {
      if (entitiesLoading.value && _route?.name !== "SingleEntity") {
        let placeholderAmount = 20;
        const entityCountOnPage = getStateForRoute(_route)?.entityCountOnPage;
        if (entityCountOnPage !== undefined)
          placeholderAmount = entityCountOnPage;
        entities.value = createPlaceholderEntities(placeholderAmount);
      }
    }
  );

  return {
    enqueuePromise,
    entities,
    entitiesLoading,
    getCustomBulkOperations,
    getEntities,
    getEntityById,
    manipulationQuery,
    setAdvancedFilters,
    setEntityType,
    setIsSearchLibrary,
    setLimit,
    setManipulationOfQuery,
    setParentEntityIdentifiers,
    setsearchInputType,
    setSkip,
    setSortKey,
    setSortOrder,
    totalEntityCount,
  };
};
