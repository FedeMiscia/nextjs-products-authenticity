import { useMoralis, useWeb3Contract } from "react-moralis"
import { gql, useQuery } from "@apollo/client"
import {
    GET_STAKING_ITEMS,
    GET_RECEIVED_ITEMS,
    GET_ACTIVE_ITEMS,
} from "@/constants/subgraphQueries"
import LoadComponent from "@/components/LoadComponent"

import NftsTable from "@/components/NftsTable"
import { useState, useEffect } from "react"
import { marketplaceAbi, marketplaceAddresses } from "@/constants"

export default function UserTokens() {
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const stringChainId = parseInt(chainId).toString()

    const {
        loading: stakingLoading,
        error: stakingError,
        data: stakingNfts,
    } = useQuery(GET_STAKING_ITEMS, { variables: { buyerAddress: account } })
    console.log(stakingNfts)

    const {
        loading: receivedLoading,
        error: receivedError,
        data: receivedNfts,
    } = useQuery(GET_RECEIVED_ITEMS, { variables: { userAddress: account } })
    console.log(receivedNfts)

    return (
        <div>
            <h1 className="py-4 px-8 font-bold text-2xl">
                Certificates you have in Staking
            </h1>

            {!isWeb3Enabled || stakingLoading || !stakingNfts ? (
                <div className="px-4">
                    <LoadComponent></LoadComponent>
                </div>
            ) : (
                <div className="px-8 py-4 ">
                    <NftsTable items={stakingNfts.itemBoughts} staking={true} />
                </div>
            )}

            <div>
                <h1 className="py-4 px-8 font-bold text-2xl">
                    Certificates successfully transfered to you
                </h1>
                {!isWeb3Enabled || receivedLoading || !receivedNfts ? (
                    <div className="px-4">
                        <LoadComponent></LoadComponent>
                    </div>
                ) : (
                    <div className="px-8 py-4 ">
                        <NftsTable
                            items={receivedNfts.tokenTransfereds}
                            staking={false}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
