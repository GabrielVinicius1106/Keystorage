import {} from "dotenv/config"
import { z }      from "zod"
import { InvalidEnvironmentVariables } from "@/lib/errors/InvalidEnvironmentVariables"

const envBodySchema = z.object({
    NODE_ENV:           z.string(),
    
    DEV_HOST:           z.string(),
    PRODUCTION_HOST:    z.string(),
    
    DEV_API_URL:        z.string(),
    PRODUCTION_API_URL: z.string(),
})

const _env = envBodySchema.safeParse(process.env)

if(!_env.success){

    console.log(_env.error);

    throw new InvalidEnvironmentVariables()
}

const env = _env.data

export { env }