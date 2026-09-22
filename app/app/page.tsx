"use server"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import KeyValuesList from "@/components/KeyValuesList";
import Form from "@/components/Form";
import { getAllKeyValues } from "@/lib/data_fetching";
import { getAllKeyValuesResponse, KeyValue } from "@/lib/interfaces/types";
import { Clock8 } from "lucide-react";

export default async function Home() {

  const data: getAllKeyValuesResponse = await getAllKeyValues()

  const elements = data ? data.elements : []

  return (
    <div className="flex flex-col flex-1 items-center w-full bg-accent-foreground" >
      <main className="flex text-secondary flex-1 flex-col items-center gap-12 py-16 sm:items-start">
        <div className="flex flex-col gap-8 px-8 w-full">
          <h1 className="text-2xl lg:text-4xl font-bold font-mono w-full text-center lg:text-start" >Keystorage App.</h1>
          <p className="text-center lg:text-start" >Criação de registros CHAVE VALOR com TIME TO LIVE.</p>
        </div>

        <div className="flex flex-col w-full gap-8 px-8">

          <h1 className="text-2xl lg:text-3xl font-bold font-mono w-full text-center lg:text-start" >Criar Registro</h1>

          {/* Set Key_Value */}
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Registro.</CardTitle>
              <CardDescription>Criar um novo Registro Chave_Valor.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form />
            </CardContent>
          </Card>
          
        </div>

        {/* Get All Key_Values */}
        <div className="w-full" >
          <h1 className="text-2xl lg:text-3xl font-bold font-mono w-full text-center lg:text-start py-8 px-8" >Todos os Registros</h1>
          <KeyValuesList items={elements} /> 
        </div>

      </main>
    </div>
  );
}
