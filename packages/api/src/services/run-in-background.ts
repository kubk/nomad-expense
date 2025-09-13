/// <reference types="../../worker-configuration.d.ts" />

let ctx: ExecutionContext | null = null;

export function setWorkerContext(ctxInput: ExecutionContext) {
  ctx = ctxInput;
}

export function runInBackground(promise: Promise<any>) {
  if (!ctx) {
    return;
  }

  ctx.waitUntil(promise);
}
