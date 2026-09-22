import {} from "dotenv/config"
import { z }      from "zod"
import { InvalidEnvironmentVariables } from "../errors/InvalidEnvironmentVariables.js"

const envBodySchema = z.object({
    HOST:     z.string(),
    PORT:     z.coerce.number(),
    ORIGIN:   z.string()
})

const _env = envBodySchema.safeParse(process.env)

if(!_env.success) throw new InvalidEnvironmentVariables()

const env = _env.data

export { env }