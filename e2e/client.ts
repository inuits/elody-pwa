import { existsSync } from "node:fs";
import path from "node:path";

export type ClientConfig = {
  baseURL: string;
  menuItems: string[];
  listEntityType: string;
  create: {
    dialogName: string;
    pickFirstOption: string[];
    titleField: string;
  };
  editableTextField: string;
  sortOption: string;
  filters: {
    text: string;
    checkbox: { label: string; options: [string, string] };
    date: string;
  };
  ignoredErrors?: RegExp[];
};

export const clientName = process.env.E2E_CLIENT ?? "";
export const clientDir = path.resolve(
  import.meta.dirname,
  process.env.E2E_CLIENTS_DIR ?? "../../clients",
  clientName,
  "e2e",
);

if (!clientName || !existsSync(path.join(clientDir, "client.ts")))
  throw new Error(
    `E2E_CLIENT="${clientName}" has no ${clientDir}/client.ts. Set E2E_CLIENT in e2e/.env.`,
  );

export const client: ClientConfig = (
  await import(path.join(clientDir, "client.ts"))
).default;

export const authFile = path.join(import.meta.dirname, ".auth/user.json");
