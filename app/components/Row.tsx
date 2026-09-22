import { TableHead } from "./ui/table";

export default function Row({ className, children }: any){

    return (
        <TableHead className={`${className} text-lg text-white font-bold`} >{ children }</TableHead>
    )

}