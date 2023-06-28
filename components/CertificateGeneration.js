import { useWeb3Contract, useMoralis, useChain } from "react-moralis"
import { contractsAddresses, nftAbi, nftAddresses } from "@/constants"
import { useNotification } from "web3uikit"
import Home from "@/pages"

export default function CertificateGeneration() {
    const { chainId } = useMoralis() // Moralis conosce il chain Id in quanto metamask passa tutte le informazioni al Moralis Provider il quale a sua volta passa tutte le informazioni ai components interni al tag <MoralisProvider>
    // Il chainId che otteniamo però è in esadecimale quindi dobbiamo trasformarlo in decimale tramite la funzione parseInt()
    const intChainId = parseInt(chainId)

    const productAddress =
        intChainId in nftAddresses ? nftAddresses[intChainId][0] : null

    const dispatch = useNotification() // Oggetto ottenuto dall'hook per le notifiche, rappresenta il pop-up

    // Chiamata alla funzione dello smart contract ProductNft
    const { runContractFunction: mintNft } = useWeb3Contract({
        abi: nftAbi,
        //contractAddress: contractsAddresses[intChainId].ProductNft[0],
        contractAddress: productAddress,
        functionName: "mintNft",
        params: {},
    })

    // Handler da richiamare quando la transazione ha successo
    const handleSuccess = async function (tx) {
        const mintTxReceipt = await tx.wait(1)
        const tokenId = mintTxReceipt.events[0].args.tokenId // Preleviamo il token ID assegnato all'NFT tramite l'evento emesso
        handleNewNotification(tx, tokenId)
    }

    // Funzione richiamata nella handleSuccess. Qui andiamo a definire le caratteristiche del pop up
    const handleNewNotification = async (tx, tokenId) => {
        await tx.wait(1) // Attendiamo la conferma di un blocco a seguito della transazione e poi il popup apparirà
        dispatch({
            type: "info",
            message: `Generated NFT with ID: ${tokenId}`,
            title: "Token Created",
            position: "topR",
        })
        return <Home></Home>
    }

    return (
        <div className="container mx-auto">
            Product Brand can mine a new token
            {nftAddresses ? (
                <div className="py-6">
                    <button
                        onClick={async function () {
                            await mintNft({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
                    >
                        Create Product Token
                    </button>
                </div>
            ) : (
                <div>NFT Address not found</div>
            )}
        </div>
    )
}
