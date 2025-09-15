import { z } from "zod";

export const userTelegramSchema = z
  .object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string().optional(),
    language_code: z.string().optional(),
    photo_url: z.string().optional(),
    username: z.string().optional(),
    start: z.string().nullable().optional(),
  })
  .transform((result) => ({
    id: result.id,
    firstName: result.first_name,
    lastName: result.last_name,
    languageCode: result.language_code,
    photoUrl: result.photo_url,
    username: result.username,
    start: result.start,
  }));

export type UserTelegramType = z.infer<typeof userTelegramSchema>;
