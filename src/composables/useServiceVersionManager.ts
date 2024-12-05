import { ref, type Ref } from "vue";
import { ElodyServices } from "@/generated-types/queries";
import { useStateManagement } from "@/composables/useStateManagement";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";

const pwaVersion = ref<string>();
const apolloGraphqlVersion = ref<string>();

export const useServiceVersionManager = (): {
  pwaVersion: Ref<string>;
  apolloGraphqlVersion: Ref<string>;
  setVersion: (
    newVersion: string,
    service: ElodyServices,
  ) => Record<ElodyServices, string>;
  getPwaVersion: () => Promise<string>;
  compareAllServiceVersions: () => void;
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
    compareAllServiceVersions();
    setGlobalState(`${service}Version`, newVersion);
    return { [service]: newVersion };
  };

  const getCurrentVersion = (service: ElodyServices) => {
    const { getGlobalState } = useStateManagement();
    return getGlobalState(`${service}Version`);
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

  const compareAllServiceVersions = () => {
    const services: string[] = Object.values(ElodyServices);

    services.forEach((service) => {
      compareVersionOfService(
        __getServiceVersionMapper[service](service),
        service,
      );
    });
  };

  const compareVersionOfService = (
    newVersion: string,
    service: ElodyServices,
  ): void => {
    if (!newVersion || !service) return;
    const currentVersion = getCurrentVersion(service);
    if (currentVersion === newVersion) return;

    __showNewVersionAvailableToUser();
  };

  const __showNewVersionAvailableToUser = () => {
    const { createNotificationOverwrite } = useNotification();
    createNotificationOverwrite(
      NotificationType.default,
      "notifications.default.new-version-available.title",
      "notifications.default.new-version-available.description",
      20,
    );
  };

  return {
    pwaVersion,
    apolloGraphqlVersion,
    setVersion,
    getPwaVersion,
    compareAllServiceVersions,
  };
};
