"use server"    

import { env } from "@/app/env"
import { GetAllKeyValues } from "@/lib/interfaces/types"

export async function getAllKeyValues(): Promise<GetAllKeyValues | null> {

    try {

        const res = await fetch(`${env.API_URL}/api/keys`, { method: "GET" })
    
        const data: GetAllKeyValues = await res.json()
        
        return data
    
    } catch(e) {
        
        console.log(e);

        return null

    }
}

export async function deleteKeyValue(key: string){

    const res = await fetch(`${env.API_URL}/api/keys/${key}`, { method: "DELETE" })

    if(!res.ok) return { status: 500 }

    return { status: 200 }

}

