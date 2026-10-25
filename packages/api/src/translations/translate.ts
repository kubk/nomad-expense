// A translation has the keys of the base one, each a string or a function
// that returns one.
export type TranslationOf<Base> = {
  [K in keyof Base]: Base[K] extends (...args: infer Args) => string
    ? (...args: Args) => string
    : string;
};

export type TranslationArgs<T, K extends keyof T> = T[K] extends (
  ...args: infer Args
) => string
  ? Args
  : [];

export function translate<T, K extends keyof T>(
  translation: T,
  key: K,
  ...args: TranslationArgs<T, K>
): string {
  const entry = translation[key];

  if (typeof entry === "function") {
    return (entry as (...args: TranslationArgs<T, K>) => string)(...args);
  }

  return entry as string;
}
