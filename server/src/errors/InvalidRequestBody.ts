import { z, type ZodError } from "zod";

export class InvalidRequestBodyError extends Error {
    constructor(error: ZodError){ 
        super() 
        this.message = z.prettifyError(error)
    }
}