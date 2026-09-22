"use client"

import { KeyValue } from "@/lib/interfaces/types"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from "./ui/button"
import { toast } from "./ui/toast"
import { deleteKeyValue } from "@/lib/data_fetching"
import { refresh } from "@/lib/revalidate_path"
import TimeToLive from "./TimeToLive"
import Row from "./Row"
import { getWindowWidth } from "@/lib/getWindowWidth"
import { Card, CardContent, CardHeader } from "./ui/card"
import { Clock8, MoveRight } from "lucide-react"

interface KeyValuesListProps {
    items: KeyValue[]
}

const MIN_WIDTH = 700

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

    const width = getWindowWidth()

    const num_elements = items.length

    if(width < MIN_WIDTH){

        // Retorna uma Lista de Cards
        {

            return num_elements > 0 ? (
            <div className="flex flex-col gap-6 px-8" >
                {
                    items.map((item: KeyValue, idx) => {

                        const { key, value, created_at, expires_at, time_to_live } = item

                        return (
                            <Card key={idx} className="bg-white/5 text-white px-8" >
                            <CardHeader className="flex justify-between items-center text-xl p-0" >
                                <CardContent className="text-chart-3 p-0 font-bold text-start" >{key}</CardContent>
                                <CardContent className="font-bold p-0" >{value}</CardContent>
                            </CardHeader>
                            <CardContent className="flex justify-between items-center text-sm p-0" >
                                <span className="flex items-center gap-2" ><Clock8 className="h-3 w-3" />{new Date(created_at).toLocaleTimeString('pt-br')}</span>
                                <span><MoveRight className="h-3 w-3" /></span>
                                <span className="flex items-center gap-2" ><Clock8 className="h-3 w-3" />{new Date(expires_at).toLocaleTimeString('pt-br')}</span>
                            </CardContent>
                            <CardContent className="flex justify-between items-center p-0" >
                                <TimeToLive ttl={time_to_live} type="list" />
                                <Button className="rounded-lg cursor-pointer" variant={"destructive"} onClick={ () => handleDeleteItem(key) }>Excluir</Button>
                            </CardContent>
                        </Card>
                        )
                    })
                }
                
            </div>
            ) : (
                <Table>
                    <TableCaption>Lista de Registros Criados.</TableCaption>
                </Table>
            )

        }

    }

    { return num_elements > 0 ? (
        <Table className="text-xs" >
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
                            <TableRow key={idx} className="hover:bg-secondary/5 text-sm" >
                                <TableCell className="font-bold text-lg text-chart-3">{key}</TableCell>
                                <TableCell className="font-bold text-lg">{value}</TableCell>
                                <TableCell>{new Date(created_at).toLocaleTimeString('pt-br')}</TableCell>
                                <TableCell>{new Date(expires_at).toLocaleTimeString('pt-br')}</TableCell>
                                <TimeToLive ttl={time_to_live} type="table" />
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