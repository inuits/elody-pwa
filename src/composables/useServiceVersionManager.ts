import { ref, type Ref } from "vue";
import { ElodyServices } from "@/generated-types/queries";
import { useStateManagement } from "@/composables/useStateManagement";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useNotification } from "@kyvg/vue3-notification";

const pwaVersion = ref<string>();
const apolloGraphqlVersion = ref<string>();

const { displaySuccessNotification } = useBaseNotification();

export const useServiceVersionManager = (): {
  pwaVersion: Ref<string>;
  apolloGraphqlVersion: Ref<string>;
  setVersion: (
    newVersion: string,
    service: ElodyServices,
  ) => Record<ElodyServices, string>;
  getPwaVersion: () => Promise<string>;
  compareServiceVersions: () => void;
} => {
  const __setServiceVersionMapper: Record<ElodyServices, Function> = {
    [ElodyServices.Pwa]: (version) => {
      pwaVersion.value = version;
      return pwaVersion;
    },
    [ElodyServices.ApolloGraphql]: (version) => {
      apolloGraphqlVersion.value = version;
      return apolloGraphqlVersion.value;
    },
  };

  const __getServiceVersionMapper: Record<ElodyServices, Function> = {
    [ElodyServices.Pwa]: () => pwaVersion.value,
    [ElodyServices.ApolloGraphql]: () => apolloGraphqlVersion.value,
  };

  const setVersion = (newVersion: string, service: ElodyServices) => {
    const { setGlobalState } = useStateManagement();
    __setServiceVersionMapper[service](newVersion);
    compareServiceVersions();
    setGlobalState(`${service}Version`, newVersion, "sessionStorage");
    return { [service]: newVersion };
  };

  const getCurrentVersion = (service: ElodyServices) => {
    const { getGlobalState } = useStateManagement();
    return getGlobalState(`${service}Version`, "sessionStorage");
  };

  const getPwaVersion = async (): Promise<string> => {
    try {
      const response = await fetch("/pwa-version.json");
      if (!response.ok) {
        console.error("No pwa version json found");
      }
      const data = await response.json();
      return data["elody-pwa-version"];
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      return "no-version-found";
    }
  };

  const __showNewVersionAvailableToUser = () => {
    displaySuccessNotification(
      "notifications.default.new-version-available.title",
      "notifications.default.new-version-available.description",
      { group: "serviceVersionManager" },
    );
  };

  const compareServiceVersions = () => {
    const services: string[] = Object.values(ElodyServices);
    const versions: string[] = services.map((service: string) =>
      getCurrentVersion(service),
    );

    const equalVersions = versions.every(
      (version: string) => version === versions[0],
    );

    if (!equalVersions) __showNewVersionAvailableToUser();
  };

  return {
    pwaVersion,
    apolloGraphqlVersion,
    setVersion,
    getPwaVersion,
    compareServiceVersions,
  };
};
