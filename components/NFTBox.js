import { useState, useEffect } from "react" // useState ci servirà per memorizzare l'immagine dell'NFT. useEffect è un hook per gestire gli "effetti collaterali" di una qualche situazione
import { useWeb3Contract, useMoralis } from "react-moralis"
import { nftAbi } from "@/constants"
import Image from "next/image" // Import necessario per renderizzare un'immagine a partire dall'URI
import { Card } from "web3uikit" // Import per creare delle card cliccabili per ogni NFT (interfaccia e formattazione)

export default function NFTBox({ nftAddress, tokenId, seller }) {
    //Qualora ci siano parametri di input ad un component, essi vengono indicati genericamente con props. In questo caso, utilizzando le parentesi graffe, andiamo ad estrarre direttamente i parametrid i nostri interesse da props. Altirmenti nel corpo della funzione avremmo dovuto scrivere props.nftAddress ecc...

    const { isWeb3Enabled } = useMoralis() //isWeb3Enabled vede se siamo connessi ad un wallet. Verrà utilizzato successivamente nell'hook useEffect

    // Definizione di variabili di stato per andare a memorizzare alcune informazioni sul token dopo aver otenuto il token URI
    const [imageURI, setImageURI] = useState("") // Definizione della variabile di stato, del metodo per aggiornarla e del valore iniziale (stringa vuota)
    const [tokenName, setTokenName] = useState("") // Variabile di stato in cui andremo a memorizzare il nome del token prelevato dal token URI
    const [tokenDescription, setTokenDescription] = useState("")
    const [tokenCreator, setTokenCreator] = useState("")

    // Chiamata alla funzione del contratto ProductNFT per legegre il token URI
    const { runContractFunction: getTokenUri } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "getTokenUri",
        params: {},
    })

    // Creiamo una funzione che aggiornerà l'interfaccia
    async function updateUI() {
        // Due obiettivi:
        // Preleviamo il token URI
        // Utilizzando il tag image del tokenURI, otteniamo l'immagine

        const tokenURI = await getTokenUri()
        console.log(`Token URI: ${tokenURI}`)
        // Se il tokenURI esiste allora andremo ad estrarre l'immagine da esso
        if (tokenURI) {
            const requestURL = tokenURI.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/"
            ) // Sostituiamo l'URL: vogliamo utilizzare un gateway IPFS provider per fare in modo che l'URI possa essere visualizzato anche da chi non ha IPFS
            const tokenURIResponse = await (await fetch(requestURL)).json() // Tramite la funzione fetch andiamo ad ottenere l'URL. E' come se incollassimo il link nel browser e prelevassimo il json

            const imageURI = tokenURIResponse.image // Andiamo ad estrarre il campo image dal json
            const imageURIURL = imageURI.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/"
            ) // Anche per l'image URI sostituitamo parte dell'URL per fare una richiesta http

            setImageURI(imageURIURL) // Aggiorniamo la variabile di stato con l'URI dell'immagine
            setTokenName(tokenURIResponse.name)
            setTokenDescription(tokenURIResponse.description)
            setTokenCreator(tokenURIResponse.creator)
        }
    }

    // Per assicurarci che la funzione updateUI venga effettivamente richiamata la andiamo ad aggiungere all'hook useEffect
    // useEffect prende due parametri: la funzione da eseguire e una o più dipendenze. In questo caso vogliamo eseguire la funzione updateUI se isWeb3Anbled risulta true
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    return (
        <div>
            <div>
                {imageURI ? (
                    <Card title={tokenName} description={tokenDescription}>
                        <div className="p-2">
                            <div className="flex flex-col items-center gap-2">
                                <div>#{tokenId}</div>
                                <div className="italic text-sm">
                                    Currently Owned by: {seller}{" "}
                                </div>
                                <Image
                                    loader={() => imageURI}
                                    src={imageURI}
                                    alt="product image"
                                    height="200"
                                    width="200"
                                />
                                <div className="font-bold">
                                    Created by: {tokenCreator}
                                </div>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </div>
    )
}
