import { ActionButtonResult, type ActionButton } from "@/generated-types/queries";
import { apolloClient } from "@/main";
import { useImport } from "@/composables/useImport";
import { useFormHelper } from "@/composables/useFormHelper";
import { useMediafileDownload } from "@/composables/useMediafileDownload";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useI18n } from "vue-i18n";

export type ActionButtonRowValues = {
  intialValues?: object;
  relationValues?: object;
};

const readPath = (source: unknown, path: string): unknown =>
  path
    .split(".")
    .reduce<any>((value, segment) => value?.[segment], source);

export const resolveActionButtonVariables = (
  mapping: Record<string, string> | undefined | null,
  entityId: string,
  rowValues: ActionButtonRowValues,
): Record<string, unknown> => {
  const source = useFormHelper().getForm(entityId)?.values ?? rowValues;
  return Object.fromEntries(
    Object.entries(mapping ?? {}).map(([variable, path]) => [
      variable,
      readPath(source, path),
    ]),
  );
};

const isPathFilled = (source: unknown, condition: string): boolean => {
  const isNegated = condition.startsWith("!");
  const value = readPath(source, isNegated ? condition.slice(1) : condition);
  const isFilled = value !== undefined && value !== null && value !== "";
  return isNegated ? !isFilled : isFilled;
};

export const isActionButtonHidden = (
  button: ActionButton,
  entityId: string,
  rowValues: ActionButtonRowValues,
): boolean => {
  const source = useFormHelper().getForm(entityId)?.values ?? rowValues;
  return (button.hideIf ?? []).some((expression) =>
    (expression ?? "")
      .split("|")
      .some(
        (orPart) =>
          !!orPart &&
          orPart
            .split("&")
            .every((condition) => isPathFilled(source, condition.trim())),
      ),
  );
};

const firstStringIn = (data: unknown): string | undefined => {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return undefined;
  for (const [key, value] of Object.entries(data)) {
    if (key === "__typename") continue;
    const found = firstStringIn(value);
    if (found) return found;
  }
  return undefined;
};

const downloadUrl = (url: string) => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "";
  anchor.target = "_blank";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

export const useActionButton = () => {
  const { t } = useI18n();
  const { loadDocument } = useImport();
  const { downloadMediafile } = useMediafileDownload();
  const { displayErrorNotification } = useBaseNotification();

  const runOperation = async (
    queryName: string,
    variables: Record<string, unknown>,
  ) => {
    const document = await loadDocument(queryName);
    const definition = document?.definitions?.[0];
    const isMutation =
      definition?.kind === "OperationDefinition" &&
      definition.operation === "mutation";
    const result = isMutation
      ? await apolloClient.mutate({ mutation: document, variables })
      : await apolloClient.query({
          query: document,
          variables,
          fetchPolicy: "no-cache",
        });
    return result?.data;
  };

  const download = (data: unknown, variables: Record<string, unknown>) => {
    const url = firstStringIn(data) ?? (variables.url as string | undefined);
    if (url) return downloadUrl(url);
    if (variables.mediafileId)
      downloadMediafile(
        variables.mediafileId as string,
        variables.originalFilename as string | undefined,
      );
  };

  const runActionButton = async (
    button: ActionButton,
    entityId: string,
    rowValues: ActionButtonRowValues,
    refetchParentEntity?: () => unknown,
  ) => {
    try {
      const variables = resolveActionButtonVariables(
        button.variables,
        entityId,
        rowValues,
      );
      const data = button.query
        ? await runOperation(button.query, variables)
        : undefined;
      if (button.onResult === ActionButtonResult.DownloadFile)
        download(data, variables);
      if (button.onResult === ActionButtonResult.RefetchParent)
        await refetchParentEntity?.();
    } catch {
      displayErrorNotification(
        t("notifications.errors.generic.title"),
        t("notifications.errors.generic.description"),
      );
    }
  };

  return { runActionButton };
};
