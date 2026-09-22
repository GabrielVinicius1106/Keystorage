import { useEffect, useState } from "react"
import { TableCell } from "./ui/table"
import { refresh } from "@/lib/revalidate_path"
import { Skeleton } from "./ui/skeleton"

interface TimeToLiveProps {
    ttl: number
}

export default function TimeToLive({ ttl }: TimeToLiveProps){

    const [ ready, setReady ] = useState(false)
    
    // Convert miliseconds to seconds 
    let sec = ttl / 1000

    const [ remaining, setRemaining ] = useState<{ hours: number, minutes: number, seconds: number }>({
        hours:   0, 
        minutes: 0, 
        seconds: 0
    })


    useEffect(() => {
        
        const tick = () => {

            const s = Math.floor(sec % 60)
            const m = Math.floor(sec / 60)
            const h = Math.floor(sec / 3600)

            setRemaining({
                hours:   h,
                minutes: m,
                seconds: s
            }) 

            setReady(true)

            sec--
        }
    
        tick()

        const id = setInterval(tick, 1000)

        return () => clearInterval(id)
    
    }, [ ttl ])

    useEffect(() => {

        const { hours, minutes, seconds } = remaining

        if(hours === 0 && minutes === 0 && seconds === 0) refresh('/')

        return

    })

    const { hours, minutes, seconds } = remaining

    const str_hours = hours.toString().padStart(2, '0')
    const str_mins  = minutes.toString().padStart(2, '0')
    const str_secs  = seconds.toString().padStart(2, '0')

    
    { return ready ? (<TableCell>{str_hours}h {str_mins}m {str_secs}s</TableCell>) : (<TableCell><Skeleton className="h-4 w-full bg-accent-foreground" /></TableCell>) }
    

}