import { DateTime } from "luxon";
import { useRoute } from "vue-router";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useStateManagement } from "@/composables/useStateManagement";
import { downloadFile } from "@/helpers";

const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const useExportXlsx = () => {
  const route = useRoute();
  const { getStateForRoute } = useStateManagement();
  const {
    displaySuccessNotification,
    displayErrorNotification,
    displayPersistentNotification,
    closeNotification,
  } = useBaseNotification();

  const exportEntitiesToXlsx = async (entityType: string): Promise<void> => {
    const notificationId = Date.now();
    displayPersistentNotification(
      notificationId,
      "bulk-operations.xlsx-export.in-progress-title",
      "bulk-operations.xlsx-export.in-progress-description",
      "warn",
    );

    try {
      const state = getStateForRoute(route);
      const payload: Record<string, any> = {
        type: entityType,
        limit: state?.totalEntityCount ?? 0,
      };
      if (state?.queryVariables) {
        payload.order_by = state.queryVariables.searchValue?.order_by;
        payload.asc = state.queryVariables.searchValue?.isAsc;
      }

      const response = await fetch("/api/export/xlsx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: XLSX_MIME_TYPE,
        },
        body: JSON.stringify(payload),
      });

      closeNotification(notificationId);

      if (!response.ok) {
        displayErrorNotification(
          "bulk-operations.xlsx-export.error.title",
          await response.text(),
        );
        return;
      }

      const blob = await response.blob();
      const dateStr = DateTime.now().toFormat("dd.MM.yyyy");
      downloadFile(`${entityType}_${dateStr}.xlsx`, blob);
      displaySuccessNotification(
        "bulk-operations.xlsx-export.success-title",
        "bulk-operations.xlsx-export.success-description",
      );
    } catch (error) {
      closeNotification(notificationId);
      displayErrorNotification(
        "bulk-operations.xlsx-export.error.title",
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  return { exportEntitiesToXlsx };
};
