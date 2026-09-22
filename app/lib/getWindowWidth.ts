"use client"

import { useEffect, useState } from "react"

export function getWindowWidth(){

    const [ width, setWidth ] = useState(0)

    useEffect(() => {

        function handleResize(){
            setWidth(window.innerWidth)
        }

        window.addEventListener('resize', handleResize)

        return () => window.removeEventListener('resize', handleResize)

    }, [])
    
    return width
}