type AppendPath<
  TPath extends ReadonlyArray<string>,
  TKey extends string,
> = readonly [...TPath, TKey];

// Keys follow React Query: the procedure path segments, then the input if any, so ["expenses"] or ["expenses", "overview"] invalidates every query below it
type ApiQueryConfig<TKey extends ReadonlyArray<unknown>, TData> = {
  key: TKey;
  query: () => Promise<TData>;
};

type ApiQueryFactory<
  TValue extends (...args: any[]) => Promise<unknown>,
  TPath extends ReadonlyArray<string>,
> = [Parameters<TValue>[0]] extends [void]
  ? () => ApiQueryConfig<TPath, Awaited<ReturnType<TValue>>>
  : (
      ...args: Parameters<TValue>
    ) => ApiQueryConfig<
      readonly [...TPath, Parameters<TValue>[0]],
      Awaited<ReturnType<TValue>>
    >;

type ApiProxyKey<TKey, TValue> = TKey extends string
  ? TValue extends (...args: infer _TArgs) => Promise<unknown>
    ? TKey extends "query"
      ? TKey
      : never
    : TValue extends object
      ? TKey
      : never
  : never;

type ApiProxyValue<
  TValue,
  TKey extends string,
  TPath extends ReadonlyArray<string>,
> = TValue extends (...args: infer _TArgs) => Promise<unknown>
  ? TKey extends "query"
    ? ApiQueryFactory<TValue, TPath>
    : never
  : TValue extends object
    ? ApiProxy<TValue, AppendPath<TPath, TKey>>
    : never;

type ApiProxy<TApi, TPath extends ReadonlyArray<string> = readonly []> = {
  [TKey in keyof TApi as ApiProxyKey<TKey, TApi[TKey]>]: TKey extends string
    ? ApiProxyValue<TApi[TKey], TKey, TPath>
    : never;
};

const getValueAtPath = (value: unknown, path: ReadonlyArray<string>) => {
  return path.reduce<unknown>((currentValue, key) => {
    if (
      currentValue === null ||
      (typeof currentValue !== "object" && typeof currentValue !== "function")
    ) {
      throw new Error(`Could not resolve API path: ${path.join(".")}`);
    }

    return Reflect.get(currentValue, key);
  }, value);
};

export const createApiProxy = <TApi extends object>(api: TApi) => {
  const proxies = new Map<string, unknown>();

  const createProxy = (path: ReadonlyArray<string>): unknown => {
    const cacheKey = JSON.stringify(path);
    const existing = proxies.get(cacheKey);
    if (existing) {
      return existing;
    }

    const proxy = new Proxy(() => undefined, {
      get(_target, key) {
        if (typeof key !== "string" || key === "then") {
          return undefined;
        }

        return createProxy([...path, key]);
      },
      apply(_target, _thisArg, args: Array<unknown>) {
        if (path[path.length - 1] !== "query") {
          throw new Error(
            `API proxy path must end with query: ${path.join(".")}`,
          );
        }

        const query = getValueAtPath(api, path);
        if (typeof query !== "function") {
          throw new Error(`API query is not callable: ${path.join(".")}`);
        }

        const procedurePath = path.slice(0, -1);

        if (args.length === 0) {
          return {
            key: procedurePath,
            query,
          };
        }

        return {
          key: [...procedurePath, args[0]],
          query: () => Reflect.apply(query, undefined, args),
        };
      },
    });

    proxies.set(cacheKey, proxy);
    return proxy;
  };

  return createProxy([]) as ApiProxy<TApi>;
};
