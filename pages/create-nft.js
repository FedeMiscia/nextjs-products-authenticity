import Image from "next/image"
import styles from "../styles/Home.module.css"
import CertificateGeneration from "@/components/CertificateGeneration"
import { useMoralis } from "react-moralis"
import Home from "."

export default function CreateNft() {
    const { chainId } = useMoralis()
    const intChainId = parseInt(chainId)

    return (
        <div className="px-8 py-4">
            {intChainId ? (
                <CertificateGeneration></CertificateGeneration>
            ) : (
                <Home></Home>
            )}
        </div>
    )
}
