export const SESSION_ID_KEY = "elody_session_id";

const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });

let fallback: string | undefined;

// One id per browser tab, kept across reloads, shared by the usage events
// (OpenPanel) and everything HyperDX records (traces, errors, logs, replays),
// so a session can be followed from one tool to the other.
export const getSessionId = (): string => {
  try {
    const known = sessionStorage.getItem(SESSION_ID_KEY);
    if (known) return known;
    const made = newId();
    sessionStorage.setItem(SESSION_ID_KEY, made);
    return made;
  } catch {
    return (fallback ??= newId());
  }
};
