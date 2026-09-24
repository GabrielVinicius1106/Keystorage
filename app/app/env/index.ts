import {} from "dotenv/config"
import { z }      from "zod"
import { InvalidEnvironmentVariables } from "@/lib/errors/InvalidEnvironmentVariables"

const envBodySchema = z.object({
    NODE_ENV:  z.string(),
    HOSTNAME:  z.string(),
    PORT:      z.coerce.number(),
    API_URL:   z.string(),
})

const _env = envBodySchema.safeParse(process.env)

if(!_env.success){

    console.log(_env.error);

    throw new InvalidEnvironmentVariables()
}

const env = _env.data

export { env }