import { accountTable } from "./schema";
import { InferSelectModel } from "drizzle-orm";

export type AccountSelect = InferSelectModel<typeof accountTable>;
