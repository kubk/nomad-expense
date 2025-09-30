import { expect, it, describe, vi } from "vitest";
import { setUpDbTest } from "../lib/testing/set-up-db-test";
import { getCaller } from "../lib/testing/get-trpc-caller";
import { notifyViaTelegram } from "../services/notifications/notify-via-telegram";

vi.mock("../services/notifications/notify-via-telegram", () => ({
  notifyViaTelegram: vi.fn(),
}));

vi.mock("cloudflare:workers", () => ({
  env: {},
}));

vi.mock("../services/user-cache", () => ({
  userCacheSet: vi.fn(),
}));

describe("family router", () => {
  setUpDbTest();

  it("should return list of family members", async () => {
    const callerAlice = await getCaller({ loginAs: "alice" });
    const resultAlice = await callerAlice.family.listMembers();
    expect(resultAlice).toHaveLength(2);

    const callerCharlie = await getCaller({ loginAs: "charlie" });
    const resultCharlie = await callerCharlie.family.listMembers();
    expect(resultCharlie).toHaveLength(1);
  });

  it("should notify family owner when a new member joins", async () => {
    // Alice is the family owner, Bob is already in the family
    // Charlie will join Alice's family
    const callerAlice = await getCaller({ loginAs: "alice" });
    const callerCharlie = await getCaller({ loginAs: "charlie" });

    // Alice generates an invite
    const invite = await callerAlice.family.generateInvite();
    expect(invite.code).toBeDefined();

    // Clear any previous mock calls
    vi.mocked(notifyViaTelegram).mockClear();

    // Charlie joins using the invite code
    const joinResult = await callerCharlie.family.joinFamily({
      code: invite.code,
    });

    expect(joinResult.success).toBe(true);

    // Verify the family now has 3 members
    const familyMembers = await callerAlice.family.listMembers();
    expect(familyMembers).toHaveLength(3);

    // Verify notification was sent to the family owner (Alice)
    expect(notifyViaTelegram).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "userJoinedYourFamily",
      }),
    );
  });
});
