"use client"

import { GetAllKeyValues, getAllKeyValuesResponse, KeyValue } from "@/lib/interfaces/KeyValue"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from "./ui/button"
import { toast } from "./ui/toast"
import { deleteKeyValue } from "@/lib/data_fetching"
import { refresh } from "@/lib/revalidate_path"
import TimeToLive from "./TimeToLive"
import Row from "./Row"

interface KeyValuesListProps {
    items: KeyValue[]
}

export default function KeyValuesList({ items }: KeyValuesListProps){

    async function handleDeleteItem(key: string){

        const { status } = await deleteKeyValue(key)

        if(status === 500){
            toast.add({
                title: 'Erro',
                description: 'Não foi possível deletar este item.'
            })

            return
        }

        toast.add({
            title: 'Deletado com Sucesso.',
            type: 'success'
        })

        refresh('/')

    }

    const num_elements = items.length

    { return num_elements > 0 ? (
        <Table>
            <TableCaption>Lista de Registros Criados.</TableCaption>
            <TableHeader>
                <TableRow className="hover:bg-secondary/5" >
                    <Row>Chave</Row>
                    <Row>Valor</Row>
                    <Row>Criado em</Row>
                    <Row>Expira em</Row>
                    <Row>Tempo de Vida</Row>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    items.map((item: KeyValue, idx) => {

                        const { key, value, created_at, expires_at, time_to_live } = item

                        return (
                            <TableRow key={idx} className="hover:bg-secondary/5" >
                                <TableCell className="font-medium text-chart-3">{key}</TableCell>
                                <TableCell className="font-bold">{value}</TableCell>
                                <TableCell>{new Date(created_at).toLocaleTimeString('pt-br')}</TableCell>
                                <TableCell>{new Date(expires_at).toLocaleTimeString('pt-br')}</TableCell>
                                <TimeToLive ttl={time_to_live} />
                                <TableCell className="text-right" ><Button className="rounded-lg cursor-pointer" variant={"destructive"} onClick={ () => handleDeleteItem(key) }>Excluir</Button></TableCell>
                            </TableRow>
                        )
                    })
                }
            </TableBody>
        </Table>
    ) : (
        (
        <Table>
            <TableCaption>Lista de Registros Criados.</TableCaption>
        </Table>
        )
    )} 

}