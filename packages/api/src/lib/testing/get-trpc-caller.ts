import { t } from "../../api/trpc";
import { router } from "../../api/router";
import { getUserById } from "../../db/user/get-user-by-id";
import { fixtures } from "./set-up-db-test";
import { getDb } from "../../services/db";

const createCaller = t.createCallerFactory(router);

type UserName = keyof typeof fixtures.users;

type Options = {
  loginAs: UserName;
};

export async function getCaller(options?: Options) {
  const headers = new Headers();

  const db = getDb();
  let user = null;
  if (options?.loginAs) {
    const userId = fixtures.users[options.loginAs].id;
    user = await getUserById(db, userId);
  }

  return createCaller({
    db,
    req: new Request("http://localhost:8787"),
    userId: user?.id || null,
    familyId: user?.familyId || null,
    language: "en",
    resHeaders: headers,
  });
}
