import { useWeb3Contract, useMoralis } from "react-moralis"
import { contractsAddresses, nftAbi, nftAddresses } from "@/constants"
import { useNotification } from "web3uikit"

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
        await tx.wait(1)
        handleNewNotification(tx)
    }

    // Funzione richiamata nella handSuccess. Qui andiamo a definire le caratteristiche del pop up
    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div>
            Hi from certificate generation
            {nftAddresses ? (
                <div>
                    <button
                        onClick={async function () {
                            await mintNft({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
                    >
                        Genera certificato
                    </button>
                </div>
            ) : (
                <div>No Product NFT detected</div>
            )}
        </div>
    )
}
