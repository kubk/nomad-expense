import { makeAutoObservable } from "mobx";
import { makeMutation, makeQuery } from "mobx-query-lite";
import type { SupportedCurrency } from "api";
import { api, apiProxy } from "@/shared/api";
import { haptic } from "@/shared/platform/haptics";

class FamilyStore {
  membersQuery = makeQuery(apiProxy.family.listMembers.query());
  activeInviteQuery = makeQuery(apiProxy.family.getActiveInvite.query());
  baseCurrencyQuery = makeQuery(apiProxy.family.getBaseCurrency.query());
  generateInviteMutation = makeMutation(api.family.generateInvite.mutate);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get baseCurrency(): SupportedCurrency {
    return this.baseCurrencyQuery.data ?? "USD";
  }

  async generateInvite() {
    haptic("light");
    const result = await this.generateInviteMutation.mutateResult();
    if (result.ok) {
      await this.activeInviteQuery.invalidate();
    }
  }
}

export const familyStore = new FamilyStore();
