/// <reference types="../../worker-configuration.d.ts" />

let kv: KVNamespace | undefined;

export function setKv(kvNamespace: KVNamespace) {
  kv = kvNamespace;
}

export function getKv(): KVNamespace {
  if (!kv) {
    throw new Error("KV is not initialized, call setKv first");
  }
  return kv;
}
