import Image from "next/image"
import styles from "../styles/Home.module.css"
import { Form, useNotification } from "web3uikit"
import {
    contractsAddresses,
    marketplaceAbi,
    marketplaceAddresses,
    nftAbi,
    nftAddresses,
} from "@/constants"
import { useMoralis, useWeb3Contract } from "react-moralis"
import Home from "."
import { useRouter } from "next/router"

export default function List() {
    const { chainId } = useMoralis()
    const stringChainId = chainId ? parseInt(chainId).toString() : "11155111" // Se chainId non esiste (l'utente non è ancora connesso con un accout ad una certa rete) allora stabiliamo noi di default il chainId da utilizzare
    const marketplaceAddress = marketplaceAddresses[stringChainId][0]

    const dispatch = useNotification()
    const router = useRouter()

    // Preleviamo una funzione generica da useWeb3Contract. Indicheremo nel seguito le opzioni in base alle esigenze
    const { runContractFunction } = useWeb3Contract()

    async function approveAndList(data) {
        // Dobbiamo prelevare il campo value dei dati inseriti nella form, andando ad agire sul parametro data in input
        console.log("Approving...")
        const nftAddress = data.data[0].inputResult //data.data[0] accede al primo oggetto del parametro di input data (nel nostro caso accede al campo relativo all'indirizzo dell'NFT). Con InputResult si accede poi a quanto inserito dall'utente
        const tokenId = data.data[1].inputResult

        // Definiamo le opzioni da passare ad useWeb3Contract per richiamare la funzione approve dello smart contract ProductNft
        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
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
                    message: "Check the data",
                    title: "NFT Approving Error",
                    position: "topR",
                })
                router.reload()
            },
        })
    }

    async function handleApproveSuccess(nftAddress, tokenId, tx) {
        console.log("Approved to marketplace")
        await tx.wait(1)
        console.log("Now it's time to list")
        const listOptions = {
            abi: marketplaceAbi,
            contractAddress: marketplaceAddress,
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
            message: "NFT Listing",
            title: "NFT Listed",
            position: "topR",
        })

        router.push("/")
    }

    async function errorHandler() {
        dispatch({
            type: "error",
            message: "Check the data",
            title: "Validation Error",
            position: "topR",
        })
    }

    return (
        <div className="container mx-auto">
            <div className="px-8 py-4">
                Insert token data in the form below to list your certificate to
                the platform
                <Form
                    buttonConfig={{
                        theme: "primary",
                        text: "Proceed",
                    }}
                    onSubmit={approveAndList}
                    onError={errorHandler}
                    data={[
                        // Data viene passato automaticamente alla funzione specificata per l'onSubmit
                        {
                            name: "NFT Address",
                            type: "text",
                            inputWidth: "50%",
                            value: "",
                            key: "nftAddress",
                            validation: {
                                required: true,
                                characterMinLength: 14,
                                characterMaxLength: 64,
                            },
                        },
                        {
                            name: "Token ID",
                            type: "number",
                            value: "",
                            key: "tokenId",
                            validation: { required: true },
                        },
                    ]}
                    title="List your NFT!"
                    id="NFTForm"
                />
            </div>
        </div>
    )
}
