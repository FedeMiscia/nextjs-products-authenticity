import { ConnectButton } from "web3uikit"
import Link from "next/link"
import { useMoralis } from "react-moralis"

export default function Header() {
    const { chainId } = useMoralis()
    const intChainId = parseInt(chainId)

    return (
        <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
            <h1 className="py-4 px-4 font-bold text-3xl">
                Products Authenticity with NFT
            </h1>
            <div className="flex flex-row items-center">
                <Link href="/" className="mr-4 p-6">
                    Home
                </Link>
                <Link href="/exchange-nft" className="mr-4 p-6">
                    Exchange NFT
                </Link>

                {intChainId ? (
                    <Link href="/create-nft" className="mr-4 p-6">
                        Create NFT (Brand Only)
                    </Link>
                ) : (
                    <div></div>
                )}

                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    )
}
