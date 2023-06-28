import {
    Table,
    Avatar,
    SvgMoreVert,
    Tag,
    Button,
    useNotification,
} from "web3uikit"
import React from "react"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract, isWeb3Enabled } from "react-moralis"
import {
    marketplaceAbi,
    marketplaceAddresses,
    nftAbi,
    nftAddresses,
} from "@/constants"
import { useRouter } from "next/router"
import { useQuery } from "@apollo/client"
import { GET_ACTIVE_ITEM } from "@/constants/subgraphQueries"
import TokenModal from "./TokenModal"
import { format } from "date-fns"

// Questo component riceve un parametro booleano staking in modo da adattare la tabella a seconda delle circostanze: se staking è true allora vengono generati alcune colonne e bottoni relativi alla tabella degli staking altrimenti la tabella viene impostata in modo diverso.
export default function NftsTable({ items, staking }) {
    const { chainId } = useMoralis()
    const stringChainId = parseInt(chainId).toString()
    const [returnTime, setReturnTime] = useState(0)

    const dispatch = useNotification()
    const router = useRouter()

    const { runContractFunction } = useWeb3Contract({})

    // Definizione della chiamata allo smart contract per ottenere il tempo utile al recesso
    const { runContractFunction: getReturnTime } = useWeb3Contract({
        abi: marketplaceAbi,
        contractAddress: marketplaceAddresses[stringChainId][0],
        functionName: "getReturnTime",
        params: {},
    })

    useEffect(() => {
        // Chiamata alla funzione del contratto avviene solo al montaggio del componente (in quanto viene utilizzata una dipendenza vuota per useEffect)
        // NOTA: la sintassi che segue è per la definizione di una funzione asincrona al volo e immediata chiamata
        ;(async () => {
            const time = await getReturnTime()
            console.log(`Return time: ${parseInt(time)}`)
            setReturnTime(parseInt(time) * 1000)
        })()
    }, [])

    // Handler per i diversi bottoni
    async function handleTakeBack(nftAddress, tokenId) {
        const options = {
            abi: marketplaceAbi,
            contractAddress: marketplaceAddresses[stringChainId][0],
            functionName: "takeBackToken",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
            },
        }
        await runContractFunction({
            params: options,
            onSuccess: (tx) => {
                handleTakeBackSuccess(tx)
            },
            onError: (error) => {
                console.log(error)
                dispatch({
                    type: "error",
                    message: "Something went wrong",
                    title: "Take Back Error",
                    position: "topR",
                })
            },
        })
    }

    async function handleTakeBackSuccess(tx) {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Product token given back successfully ",
            title: "Operation Complete",
            position: "topR",
        })
    }

    async function handleConfirm(nftAddress, tokenId) {
        const options = {
            abi: marketplaceAbi,
            contractAddress: marketplaceAddresses[stringChainId][0],
            functionName: "transferTokenAfterTime",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
            },
        }

        await runContractFunction({
            params: options,
            onSuccess: (tx) => {
                handleConfirmSuccess(tx)
            },
            onError: (error) => {
                console.log(error)
                dispatch({
                    type: "error",
                    message:
                        "Something went wrong, maybe you have still time to recess",
                    title: "Transfer Token",
                    position: "topR",
                })
            },
        })
    }

    async function handleConfirmSuccess(tx) {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Token Transfered successfully",
            title: "Token Transfer",
            position: "topR",
        })
    }

    // Chiamata alla funzione dello smart contract per pubblicare un token

    async function approveAndList(nftAddress, tokenId) {
        console.log("Approving...")

        // Definiamo le opzioni da passare ad useWeb3Contract per richiamare la funzione approve dello smart contract ProductNft
        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddresses[stringChainId][0],
                tokenId: tokenId,
            },
        }

        await runContractFunction({
            params: approveOptions,
            onSuccess: (tx) => {
                // Prendiamo l'oggetto transazione e lo mandiamo come parametro dell'handler in modo da attendere prima la conferma di un blocco prima di procedere con il listing (altrimenti dà errore)
                handleApproveSuccess(nftAddress, tokenId, tx)
            }, // NOTA: quando la funzione approve ha successo richiamiamo la funzione ListItem
            onError: (error) => {
                console.log(error)
                dispatch({
                    type: "error",
                    message: "Something went wrong",
                    title: "NFT Approving Error",
                    position: "topR",
                })
                router.reload()
            },
        })
    }

    async function handleApproveSuccess(nftAddress, tokenId, tx) {
        await tx.wait(1)
        console.log("Approved to marketplace")
        console.log("Now it's time to list")
        const listOptions = {
            abi: marketplaceAbi,
            contractAddress: marketplaceAddresses[stringChainId][0],
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: (tx) => handleListSuccess(tx),
            onError: (error) => {
                console.log(error)
                dispatch({
                    type: "error",
                    message: "Listing went wrong",
                    title: "NFT Listing Error",
                    position: "topR",
                })
            },
        })
    }

    async function handleListSuccess(tx) {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Operation complete",
            title: "NFT listed succesfully",
            position: "topR",
        })
        router.push("/")
    }

    // Generazione dinamica delle righe della tabella. Il campo data del tag <Table> prende un array in cui ogni elemento è ancora un array che rappresenta una singola riga della tabella.
    // Ciascun elemento di quest'ultimo array è l'elemento relativo ad una singola colonna di quella riga

    const stakingTableData = items.map((item) => {
        const key = item.id
        return [
            `${item.nftAddress}`,
            `${item.tokenId}`,
            item.timestamp
                ? `${format(
                      parseInt(item.timestamp) * 1000 + returnTime,
                      "dd/MM/yyyy HH:mm:ss"
                  )}`
                : "",
            // Per poter passare come elemento di un array un component bisogna utilizzare la funzione React.createElement, passare una funzione arrow e restituire in questa funzioen arrow il component desiderato

            React.createElement(() => {
                return (
                    <Button
                        color="yellow"
                        onClick={() => {
                            handleTakeBack(item.nftAddress, item.tokenId) // L'handler deve essere attivato all'interno di una arrow function altrimenti è come se si attivasse di continuo anche senza il click
                        }}
                        text="Give Back"
                        theme="colored"
                    />
                )
            }),
            React.createElement(() => {
                return (
                    <Button
                        color="green"
                        onClick={() => {
                            handleConfirm(item.nftAddress, item.tokenId)
                        }}
                        text="Confirm"
                        theme="colored"
                    />
                )
            }),
        ]
    })

    // Generazione elementi per la tabella dei token trasferiti
    const transferedTableData = items.map((item) => {
        // Query per vedere se l'elemento corrente risulta "attivo" cioè pubblicato: in tal caso bisogna disabilitare il bottone di listing
        const {
            loading: activeLoading,
            error: activeError,
            data: activeNft,
        } = useQuery(GET_ACTIVE_ITEM, { variables: { id: item.id } })

        return [
            `${item.nftAddress}`,
            `${item.tokenId}`,

            "",

            React.createElement(() => {
                return (
                    <Button
                        color="blue"
                        onClick={() => {
                            approveAndList(item.nftAddress, item.tokenId) // L'handler deve essere attivato all'interno di una arrow function altrimenti è come se si attivasse di continuo anche senza il click
                        }}
                        text="List Item"
                        theme="colored"
                        disabled={
                            activeNft && activeNft.activeItems.length != 0
                        } // Se il token in questione risulta tra i token attivi allora il bottone per il listing viene disabilitato
                    />
                )
            }),
            "",
        ]
    })

    return (
        <Table
            columnsConfig="2fr 80px 120px 100px 100px "
            data={staking ? stakingTableData : transferedTableData}
            header={[
                <span>NFT Address</span>,

                <span>Token ID</span>,
                staking ? <span>Return deadline</span> : <span></span>,
                "",
                "",
            ]}
            isColumnSortable={[false, true, false, false]}
            maxPages={3}
            onPageNumberChanged={function noRefCheck() {}}
            // onRowClick={function noRefCheck() {}}
            pageSize={5}
        />
    )
}
