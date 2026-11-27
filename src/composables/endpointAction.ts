export const callEntityEndpoint = async (
  endpointUrl: string,
  method: string | undefined | null,
  entityId: string,
): Promise<Response> => {
  const response = await fetch(`/${endpointUrl.replace("$id", entityId)}`, {
    method: method?.toUpperCase() || "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`Response status: ${response.status}`);
  return response;
};
