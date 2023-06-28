import { ConnectButton } from "web3uikit"
import Link from "next/link"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { nftAbi, nftAddresses } from "../constants/index.js"
import { useState, useEffect } from "react"

export default function Header() {
    const { account, chainId, isWeb3Enabled } = useMoralis()
    const stringChainId = parseInt(chainId).toString()
    const [brand, setBrand] = useState("")
    //console.log(`Indirizzo NFT: ${nftAddresses[stringChainId]}`)

    // Chiamata alla funzione dello Smart Contract ProductNFT per estrarre il proprietario del contratto
    const { runContractFunction: getContractOwner } = useWeb3Contract()

    async function updateHeader(options) {
        const nftBrand = await getContractOwner({
            params: options,
            onError: (error) => {
                console.log(error)
            },
        })
        console.log(`Brand: ${nftBrand}`)
        if (nftBrand) {
            setBrand(nftBrand)
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            console.log(`Account Detected: ${account}`)
            const options = {
                abi: nftAbi,
                contractAddress: nftAddresses[stringChainId][0],
                functionName: "getContractOwner",
                params: {},
            }

            updateHeader(options)
        }
    }, [isWeb3Enabled])

    return (
        <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
            <h1 className="py-4 px-4 font-bold text-3xl">
                Products Authenticity with NFTs
            </h1>
            <div className="flex flex-row items-center">
                <Link href="/" className="mr-4 p-6">
                    Home
                </Link>
                {isWeb3Enabled ? (
                    <Link href="/list-nft" className="mr-4 p-6">
                        List TPC
                    </Link>
                ) : (
                    <div></div>
                )}

                {isWeb3Enabled ? (
                    <Link href="/user-tokens" className="mr-4 p-6">
                        Your TPCs
                    </Link>
                ) : (
                    <div></div>
                )}

                {account &&
                brand &&
                account.toLowerCase() == brand.toLowerCase() ? (
                    <Link href="/create-nft" className="mr-4 p-6">
                        Create TPC (Brand Only)
                    </Link>
                ) : (
                    <div></div>
                )}

                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    )
}
