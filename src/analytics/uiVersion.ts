/**
 * Which UI this deployment runs, as the GraphQL server's app config says
 * (redesign on the beta/redesign track), "current" when it names none. Every
 * usage event and every span carries it, so the redesign can be compared with
 * what came before it.
 */
export const uiVersion = (configured: string | undefined): string =>
  configured?.trim() || "current";
