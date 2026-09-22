import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { k_storage } from "../lib/keystorage.js";

import { deleteKeyValueParamsSchema, getKeyValueParamsSchema, setKeyValueBodySchema } from "../schemas/schemas.js";

import { InvalidRequestBodyError } from "../errors/InvalidRequestBody.js";

export function applicationRoutes(app: FastifyInstance){

    // Set Key_Value
    app.post("/api/keys", (req: FastifyRequest, res: FastifyReply) => {

        const parsed = setKeyValueBodySchema.safeParse(req.body)

        if(!parsed.success) throw new InvalidRequestBodyError(parsed.error)

        const { key, value, expires_in } = parsed.data

        const created = k_storage.SET(key, value, expires_in)

        if(!created) return res.status(500).send({
            code: "INTERNAL_SERVER_ERROR",
            status: 500
        })

        return res.status(201).send({
            code: "KEY_VALUE_CREATED",
            element:  created,
            status: 201
        })
        
    })

    // Get Key_Value
    app.get("/api/keys/:key", (req: FastifyRequest, res: FastifyReply) => {
    
        const parsed = getKeyValueParamsSchema.safeParse(req.params)

        if(!parsed.success) throw new InvalidRequestBodyError(parsed.error)

        const { key } = parsed.data

        const element = k_storage.GET(key)

        return res.status(200).send({
            code: "GET_KEY_VALUE",
            element: element ? element : {},
            status: 200
        })
    })

    // Get All Key_Values
    app.get("/api/keys", (req: FastifyRequest, res: FastifyReply) => {
    
        const elements = k_storage.GET_ALL()

        return res.status(200).send({
            code: "GET_KEY_VALUES",
            elements: elements,
            status: 200
        })

    })

    // Delete Key_Value
    app.delete("/api/keys/:key", (req: FastifyRequest, res: FastifyReply) => {
        
        const parsed = deleteKeyValueParamsSchema.safeParse(req.params)

        if(!parsed.success) throw new InvalidRequestBodyError(parsed.error)

        const { key } = parsed.data

        k_storage.DEL(key)

        return res.status(200).send({
            code: "KEY_VALUE_DELETED",
            message: "Key Value Deleted Successfully!",
            status: 200
        })


    })

}