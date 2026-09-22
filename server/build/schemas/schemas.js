import z from "zod";
export const setKeyValueBodySchema = z.object({
    key: z.string(),
    value: z.union([z.string(), z.number(), z.boolean()]),
    expires_in: z.coerce.number().positive()
});
export const getKeyValueParamsSchema = z.object({
    key: z.string()
});
export const deleteKeyValueParamsSchema = z.object({
    key: z.string()
});
//# sourceMappingURL=schemas.js.map