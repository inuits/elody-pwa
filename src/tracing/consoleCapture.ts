export const MESSAGE_LIMIT = 1024;

export type ConsoleLevel = "warn" | "error";

type ConsoleMethods = Record<ConsoleLevel, (...args: unknown[]) => void>;

export type ConsoleReport = (
  level: ConsoleLevel,
  message: string,
  error?: Error,
) => void;

// An object is named by its kind, never by its contents: Vue's warnings pass
// component state, and walking that (as JSON.stringify does) can hang the tab.
const kindOf = (value: object): string => {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (Array.isArray(value)) return `[Array(${value.length})]`;
  return `[${Object.prototype.toString.call(value).slice(8, -1)}]`;
};

const describe = (arg: unknown): string => {
  if (typeof arg === "function") return "[Function]";
  if (arg === null || typeof arg !== "object") return String(arg);
  try {
    return kindOf(arg);
  } catch {
    // a proxy that refuses to be inspected
    return "[Object]";
  }
};

/** The console arguments as one short line of text. */
export const consoleMessage = (
  args: unknown[],
  limit = MESSAGE_LIMIT,
): string => {
  const message = args.map(describe).join(" ");
  return message.length > limit ? `${message.slice(0, limit - 1)}…` : message;
};

const firstError = (args: unknown[]): Error | undefined => {
  for (const arg of args) {
    try {
      if (arg instanceof Error) return arg;
    } catch {
      // as above
    }
  }
  return undefined;
};

/**
 * Reports every console.warn and console.error, then prints the original
 * arguments with the given (unpatched) console methods. Returns a restore.
 */
export const captureConsole = (
  target: ConsoleMethods,
  originals: ConsoleMethods,
  report: ConsoleReport,
): (() => void) => {
  let reporting = false;
  const patch =
    (level: ConsoleLevel) =>
    (...args: unknown[]) => {
      if (!reporting) {
        reporting = true;
        try {
          report(level, consoleMessage(args), firstError(args));
        } catch {
          // the console keeps working when reporting does not
        } finally {
          reporting = false;
        }
      }
      originals[level].apply(console, args);
    };
  target.warn = patch("warn");
  target.error = patch("error");
  return () => {
    target.warn = originals.warn;
    target.error = originals.error;
  };
};
