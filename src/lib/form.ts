// Coerções de FormData usadas nas server actions.
// str: "" e ausente viram null. num: idem, senão Number.
export const str = (v: FormDataEntryValue | null): string | null =>
  v === null || v === "" ? null : String(v);

export const num = (v: FormDataEntryValue | null): number | null =>
  v === null || v === "" ? null : Number(v);
