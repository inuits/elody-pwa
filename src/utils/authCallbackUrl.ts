const authCallbackParams = ["code", "state", "session_state", "iss"];

// The authorization code is single-use: leaving it in the url makes every reload,
// restored tab or bookmark replay it against Keycloak.
export const getUrlWithoutAuthCallbackParams = (href: string): string => {
  const url = new URL(href);
  authCallbackParams.forEach((param) => url.searchParams.delete(param));
  return `${url.pathname}${url.search}${url.hash}`;
};
