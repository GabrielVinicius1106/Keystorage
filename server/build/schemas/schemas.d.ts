import z from "zod";
export declare const setKeyValueBodySchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean]>;
    expires_in: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export declare const getKeyValueParamsSchema: z.ZodObject<{
    key: z.ZodString;
}, z.core.$strip>;
export declare const deleteKeyValueParamsSchema: z.ZodObject<{
    key: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=schemas.d.ts.map