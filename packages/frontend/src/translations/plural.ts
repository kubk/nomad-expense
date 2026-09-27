type PluralForms = {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
};

export function createPlural(locale: string) {
  const pluralRules = new Intl.PluralRules(locale);

  return (count: number, forms: PluralForms): string =>
    forms[pluralRules.select(count)] ?? forms.other;
}
