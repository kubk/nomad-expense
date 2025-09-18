import { expect, it, describe, vi } from "vitest";
import { setUpDbTest, fixtures } from "../lib/testing/set-up-db-test";
import { uploadStatementHandler } from "./upload-statement-handler";
import { getUserById } from "../db/user/get-user-by-id";
import { assert } from "../lib/typescript/assert";

vi.mock("../services/auth/authenticate", () => ({
  authenticate: vi.fn(),
}));

function createMockRequest() {
  const formData = new FormData();
  formData.append("file", new File([], "test.csv"));
  formData.append("accountId", fixtures.accounts.accountUsd.id);

  return new Request("http://localhost:8787/upload-statement", {
    method: "POST",
    headers: new Headers(),
    body: formData,
  });
}

describe("upload-statement-handler", () => {
  setUpDbTest();

  it("should upload statement", async () => {
    const { authenticate } = await import("../services/auth/authenticate");
    const user = await getUserById(fixtures.users.alice.id);
    assert(user)
    vi.mocked(authenticate).mockResolvedValue({
      userId: user.id,
      familyId: user.familyId,
    });

    const result = await uploadStatementHandler(createMockRequest());
    console.log(result);
  });
});
