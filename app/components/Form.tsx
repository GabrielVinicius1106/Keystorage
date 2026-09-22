"use client"

import { Button } from "./ui/button"
import { Field } from "./ui/field"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { setKeyValueSchema } from "@/lib/schemas/setKeyValueSchema"
import { toast } from "./ui/toast"
import { refresh } from "@/lib/revalidate_path"

export default function Form(){

    async function handleCreateRegister(formData: FormData){

        const rawFormData = {
            key:        formData.get('input-field-key'),
            value:      formData.get('input-field-value'),
            expires_in: formData.get('input-field-expires-in')
        }

        // Validate Types
        const parsed = setKeyValueSchema.safeParse(rawFormData)

        if(!parsed.success){
            
            toast.add({
            title: "Campos Inválidos!",
            description: "Um ou mais campos não foram preenchidos.",
            type: 'warning'
            })

            return
        }

        const { key, value, expires_in } = parsed.data

        // Send Request to the Server
        const res = await fetch("/api/keys", {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key, value, expires_in })
        })

        console.log(res);

        refresh("/")

        if(res.status === 200){

            toast.add({
            title: "Registro Criado com Sucesso!",
            type: 'success'
            })

            return
        }

        toast.add({
            title: "Algo deu Errado.",
            description: "Tente novamente em alguns segundos.",
            type: 'error'
            })

        return
    }

    return (
        <form className="flex flex-col gap-8" action={ handleCreateRegister } >
        <div className="flex flex-col lg:flex-row gap-4">
            <Field>
            <Label htmlFor="input-field-key" >Chave</Label>
            <Input className="rounded-lg" id="input-field-key" name="input-field-key" type="text..." placeholder="Apple" />
            </Field>

            <Field>
            <Label htmlFor="input-field-value" >Valor</Label>
            <Input className="rounded-lg" id="input-field-value" name="input-field-value" type="text" placeholder="1.50" />
            </Field>

            <Field>
            <Label htmlFor="input-field-expires-in" >Expira em</Label>
            <Input className="rounded-lg" id="input-field-expires-in" name="input-field-expires-in" type="number" placeholder="60" />
            </Field>
        </div>

        <Button className="cursor-pointer rounded-lg" variant="secondary" type="submit" >Criar Registro</Button>
        </form>
    )
}