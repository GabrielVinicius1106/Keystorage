import z from "zod";

export const setKeyValueSchema = z.object({
    key:        z.string(),
    value:      z.union([z.string(), z.number(), z.boolean()]),
    expires_in: z.coerce.number().positive()
})