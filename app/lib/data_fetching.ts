"use server"    

import { GetAllKeyValues } from "./interfaces/KeyValue"
import { APP_BASE_URL, SERVER_BASE_URL } from "@/app/api/base_url"

export async function getAllKeyValues(): Promise<GetAllKeyValues | null> {

    try {

        const res = await fetch(`${APP_BASE_URL}/api/keys`, { method: "GET" })
    
        const data: GetAllKeyValues = await res.json()
        
        return data
    
    } catch(e) {
        
        console.log(e);

        return null

    }
}

export async function deleteKeyValue(key: string){

    const res = await fetch(`${SERVER_BASE_URL}/api/keys/${key}`, {
        method: "DELETE"
    })

    if(!res.ok) return { status: 500 }

    return { status: 200 }

}

