import { makeAutoObservable } from "mobx";
import { makeMutation } from "mobx-query-lite";
import { api } from "@/shared/api";

export class InviteStore {
  joinFamilyMutation = makeMutation(api.family.joinFamily.mutate);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  joinFamily(code: string) {
    this.joinFamilyMutation.mutateResult({ code });
  }
}
