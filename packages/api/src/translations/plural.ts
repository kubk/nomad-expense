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

  return (count: number, forms: PluralForms): string => {
    switch (pluralRules.select(count)) {
      case "zero":
        return forms.zero ?? forms.other;
      case "one":
        return forms.one ?? forms.other;
      case "two":
        return forms.two ?? forms.other;
      case "few":
        return forms.few ?? forms.other;
      case "many":
        return forms.many ?? forms.other;
      case "other":
        return forms.other;
    }
  };
}
