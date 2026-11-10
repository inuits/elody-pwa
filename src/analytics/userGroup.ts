import {
  libraryOf,
  putUserInGroup,
  type UserGroup,
} from "@/analytics/usageAnalytics";
import { identifyInBrowserTracing } from "@/tracing/browserTracing";

/**
 * The group a user's usage (OpenPanel) and traces (HyperDX) are counted in,
 * as the deployment's app config says: where it comes from (the domain of the
 * user's e-mail address, or the tenant the user works in) and what the client
 * calls it (a library, an organisation, a venue).
 */
export type UserGroupSettings = {
  source: "emailDomain" | "tenant";
  type: string;
};

const DEFAULT: UserGroupSettings = { source: "emailDomain", type: "library" };

type Tenant = { id: string; label: string };

let settings: UserGroupSettings = DEFAULT;
let pseudonym: string | undefined;
let tenant: Tenant | undefined;

/** The group that is known when the app starts: the e-mail domain's; a tenant comes later. */
export const initialUserGroup = (
  configured: UserGroupSettings | undefined,
  user: { email?: string } | undefined,
): UserGroup | undefined => {
  const { source, type } = configured ?? DEFAULT;
  if (source !== "emailDomain") return undefined;
  const domain = libraryOf(user?.email);
  return domain ? { id: domain, name: domain, type } : undefined;
};

const apply = () => {
  if (settings.source !== "tenant" || !pseudonym || !tenant) return;
  const group = {
    id: tenant.id,
    name: tenant.label || tenant.id,
    type: settings.type,
  };
  putUserInGroup(group);
  identifyInBrowserTracing({ pseudonym, group: group.name });
};

/** Once the user is known: from now on their group follows the selected tenant, when the config says so. */
export const followTenantGroup = (
  configured: UserGroupSettings | undefined,
  userPseudonym: string | undefined,
): void => {
  settings = configured ?? DEFAULT;
  pseudonym = userPseudonym;
  apply();
};

/** The tenant the user works in from now on (useTenant). */
export const tenantSelected = (selected: Tenant): void => {
  tenant = selected;
  apply();
};

export const resetUserGroup = () => {
  settings = DEFAULT;
  pseudonym = undefined;
  tenant = undefined;
};
