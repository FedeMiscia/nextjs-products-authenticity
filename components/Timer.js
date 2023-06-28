// Componente non più usato

import React from "react"
import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { marketplaceAddresses, marketplaceAbi } from "@/constants"

export default function Timer({ initialTime }) {
    const [time, setTime] = useState(initialTime)

    useEffect(() => {
        let interval = null

        if (time > 0) {
            interval = setInterval(() => {
                setTime((prevTime) => prevTime - 1)
            }, 1000)
        }

        return () => {
            clearInterval(interval)
        }
    }, [time])

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60)
        const secondsLeft = seconds % 60

        const formattedMinutes = String(minutes).padStart(2, "0")
        const formattedSeconds = String(secondsLeft).padStart(2, "0")

        return `${formattedMinutes}:${formattedSeconds}`
    }

    return (
        <div>
            <h2>Timer</h2>
            <p>{formatTime(time)}</p>
        </div>
    )
}
