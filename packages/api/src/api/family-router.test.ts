import { expect, it, describe } from "vitest";
import { setUpDbTest } from "../lib/testing/set-up-db-test";
import { getCaller } from "../lib/testing/get-trpc-caller";

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
});
