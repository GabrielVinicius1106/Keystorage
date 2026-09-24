import { setKeyValueSchema } from "@/lib/schemas/setKeyValueSchema";
import { NextRequest, NextResponse } from "next/server";
import { env } from "../../env";

export async function POST(req: NextRequest){

    // Testing Route
    const parsed = setKeyValueSchema.safeParse(await req.json())

    if(!parsed.success) return NextResponse.json({ message: "Validation Error." }, { status: 400 })

    const { key, value, expires_in } = parsed.data

    const response: Response = await fetch(`${env.API_URL}/api/keys`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, expires_in })
    })

    if(response.ok) return NextResponse.json({ message: "Key Value Created Successfully!" }, { status: 200 })

    const { status } = response

    return NextResponse.json({ message: "Something Went Wrong." }, { status })


}

export async function GET(){

    const response: Response = await fetch(`${env.API_URL}/api/keys`, {
        method: "GET"
    })

    if(!response.ok) return NextResponse.json({ message: "Something Went Wrong." }, { status: 500 })

    return response

}