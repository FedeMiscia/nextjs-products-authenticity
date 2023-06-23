import styles from "../styles/Home.module.css"
import { useQuery, gql } from "@apollo/client"
import networkMapping from "../constants/networkMapping.json"
import { useMoralis } from "react-moralis"
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries" // Tutte le query le definiamo in un singolo file che importiamo al bisogno
import NFTBox from "../components/NFTBox" // Component per mostrare l'immagine dell'NFT

export default function Home() {
    const { isWeb3Enabled, chainId } = useMoralis() //Ricaviamo l'id della rete tramite l'hhok useMoralis
    const chainString = chainId ? parseInt(chainId).toString() : "11155111" // Ricaviamo l'id della rete alla quale siamo connessi. Se chainId non esiste allora prende la stringa indicata
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0] // Ricaviamo l'indirizzo dello smart contract marketplace dal file json

    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS) // Mandiamo in esecuzione la query importata dal file delle subgraph query
    console.log(listedNfts)

    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">
                Product Tokens Available
            </h1>
            <div className="flex flex-wrap">
                Hello! Here you can see NFTs related to products that are
                currently on the market. Each NFT is an authenticity proof of
                the corresponding product
                {
                    // Utilizziamo ora i risultati della query a the graph
                    // Se la query non è ancora terminata (loading è true) oppure l'elemento listedNfts non esiste allora mostriamo la scritta Loading
                    // In caso contrario prendiamo la variabile listedNfts con i risultati della query e scandiamo tramite la funzione map.
                    // La funzione map ci permette di iterare sul contenuto della variabile ed eseguire una funzione che passiamo come parametro su ciascun elemento.
                    // Alla map passiamo una arrow function che prende come input un generico elemento di listedNfts (che chiamiamo nft) e va a stamapre su console, per ogni elemento, alcune informazioni estratte tramite la query
                    //
                    loading || !listedNfts ? (
                        <div>Loading...</div>
                    ) : (
                        listedNfts.activeItems.map((nft) => {
                            // listedNfts è l'oggetto ritornato dalla query. A partire da esso accediamo prima al vettore activeItems ed è su questo vettore che possiamo richiamare al funzione map
                            // Alla funzione map passiamo un'altra che funzione che definiamo al volo e che va ad operare su ogni elemento scandito
                            console.log(nft)
                            const { nftAddress, tokenId, seller } = nft
                            // La funzione passata alla map ritorna del codice HTML innestato con JavaScript per msotrare le informazioni estratte
                            return (
                                <div>
                                    NftAddress: {nftAddress}. TokenID: {tokenId}
                                    . Seller: {seller}
                                    <NFTBox //Inseriamo il component per il box dell'NFT. Passiamo i parametri che esso richiede in input
                                        nftAddress={nftAddress}
                                        tokenId={tokenId}
                                        seller={seller}
                                        key={`${nftAddress}${tokenId}`} //Inseriamo questo parametro key perché tutti gli elementi in un mapping hanno bisogno di una chiave univoca (ricorda: stiamo iterando tramite la funzione map sugli elementi di un mapping). Questa chiave la creiamo concatenando l'address e il token id
                                    />
                                </div>
                            )
                        })
                    )
                }
            </div>
        </div>
    )
}
