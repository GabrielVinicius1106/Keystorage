import { z } from "zod";
export class InvalidRequestBodyError extends Error {
    constructor(error) {
        super();
        this.message = z.prettifyError(error);
    }
}
//# sourceMappingURL=InvalidRequestBody.js.map