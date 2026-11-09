import { z } from "zod";
import {
  type WiseActivity,
  type WiseDebit,
  wiseActivitySchema,
} from "../bank-parsers/wise-activity-parser";

const WISE_API_URL = "https://api.wise.com";
const MAX_ATTEMPTS = 3;

export class WiseApiClient {
  constructor(private readonly token: string) {}

  private async get<T>(path: string, schema: z.ZodType<T>): Promise<T> {
    for (let attempt = 1; ; attempt++) {
      const response = await fetch(`${WISE_API_URL}${path}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      const isRetryable = response.status === 429 || response.status >= 500;
      if (isRetryable && attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `Wise API ${path} responded ${response.status}: ${body.slice(0, 300)}`,
        );
      }

      return schema.parse(await response.json());
    }
  }

  async getPersonalProfileId(): Promise<number> {
    const profiles = await this.get(
      "/v2/profiles",
      z.array(z.object({ id: z.number(), type: z.string() })),
    );
    const personal = profiles.filter(
      (profile) => profile.type.toUpperCase() === "PERSONAL",
    );
    const [profile] = personal;
    if (!profile || personal.length > 1) {
      throw new Error(
        `Expected exactly one personal Wise profile, found ${personal.length}`,
      );
    }
    return profile.id;
  }

  async listActivities(
    profileId: number,
    range: { since: Date; until: Date },
  ): Promise<WiseActivity[]> {
    const pageSchema = z.object({
      cursor: z.string().nullish(),
      activities: z.array(wiseActivitySchema),
    });

    const activities: WiseActivity[] = [];
    let cursor: string | null | undefined;
    do {
      const params = new URLSearchParams({
        since: range.since.toISOString(),
        until: range.until.toISOString(),
        size: "100",
      });
      if (cursor) params.set("nextCursor", cursor);

      const page = await this.get(
        `/v1/profiles/${profileId}/activities?${params}`,
        pageSchema,
      );
      activities.push(...page.activities);
      cursor = page.cursor;
    } while (cursor);

    return activities;
  }

  // How a card payment funded from several balances was split
  async getCardTransactionDebits(
    profileId: number,
    cardTransactionId: string,
  ): Promise<WiseDebit[]> {
    const { balanceTransactionId } = await this.get(
      `/v3/profiles/${profileId}/card-transactions/${cardTransactionId}`,
      z.object({ balanceTransactionId: z.number() }),
    );
    const { debits } = await this.get(
      `/v2/profiles/${profileId}/balance-transactions/${balanceTransactionId}`,
      z.object({
        debits: z.array(
          z.object({
            debitedAmount: z.object({
              value: z.number(),
              currency: z.string(),
            }),
          }),
        ),
      }),
    );
    return debits.map((debit) => debit.debitedAmount);
  }
}
