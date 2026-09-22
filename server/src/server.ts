import { fastify, type FastifyError, type FastifyReply, type FastifyRequest } from "fastify"
import { fastifyRateLimit } from "@fastify/rate-limit"
import cors from "@fastify/cors"

import { env } from "./env/index.js"
import { applicationRoutes } from "./routes/applicationRoutes.js"
import { InvalidRequestBodyError } from "./errors/InvalidRequestBody.js"
import z, { ZodError } from "zod"

const server = fastify()

server.get("/api", (req: FastifyRequest, res: FastifyReply) => {

    return res.status(200).send({
        code: "APPLICATION_RUNNING",
        message: "Hello from Keystorage API.",
        status: 200
    })

})

server.register(cors, {
    origin: env.NODE_ENV === 'development' ? env.DEV_ORIGIN : env.DOCKER_ORIGIN,
    methods: [ 'GET', 'POST', 'DELETE' ]
})

server.register(fastifyRateLimit, {
    max: 10000,
    timeWindow: 60
})

server.setErrorHandler((error: FastifyError, _req: FastifyRequest, res: FastifyReply) => {
    
    if(error instanceof ZodError){
        return res.status(400).send({
            code: "ZOD_ERROR",
            message: "Something Went Wrong.",
            issues: z.treeifyError(error),
            status: 400
        })
    }
    
    if(error.statusCode === 429){

        const seconds = res.getHeader('x-ratelimit-reset')

        return res.status(429).send({
            code: "LIMIT_REQUESTS_EXCEEDED_ERROR",
            message: "Too Many Requests.",
            wait: seconds,
            status: 429
        })
    }

    if(error instanceof InvalidRequestBodyError){
        
        return res.status(400).send({
            code: "INVALID_REQUEST_BODY_ERROR",
            message: error.message,
            cause: error.cause,
            status: 400
        })
    }
})

server.setNotFoundHandler((_req: FastifyRequest, res: FastifyReply) => {
    return res.status(404).send({
        code: "HANDLER_NOT_FOUND",
        message: "404 Not Found.",
        status: 404
    })
})

server.addHook("onRequest", (req: FastifyRequest, _res: FastifyReply, done) => {

    // Logs

    const method = req.method
    const url    = req.url

    console.log(`${method} ${url}`);

    done()
})

server.register(applicationRoutes)

server.listen({
    host: env.HOST,
    port: env.PORT
}, () => {
    console.log(`🚀 Server Running: http://${env.HOST}:${env.PORT}/api\n`);
})