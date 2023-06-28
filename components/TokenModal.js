import { Modal, useNotification } from "web3uikit"
import { useWeb3Contract } from "react-moralis"
import { marketplaceAddresses, marketplaceAbi } from "@/constants"
import { useMoralis } from "react-moralis"
import { useRouter } from "next/router"

export default function TokenModal({
    isVisible,
    nftAddress,
    tokenId,
    tokenDescription,
    onClose,
    nftAttributes,
    nftName,
    seller,
    creator,
}) {
    const { isWeb3Enabled, account, chainId } = useMoralis()
    const dispatch = useNotification()
    const { runContractFunction } = useWeb3Contract()
    const isOwnedByUser = seller === account
    const stringChainId = parseInt(chainId).toString()

    const router = useRouter()

    async function handleOkClick() {
        if (isWeb3Enabled && !isOwnedByUser) {
            console.log("Buy Item")
            // Definizione dei parametri per richiamare la funzione dello smart contract
            const options = {
                abi: marketplaceAbi,
                contractAddress: marketplaceAddresses[stringChainId][0],
                functionName: "buyItem",
                params: { nftAddress: nftAddress, tokenId: tokenId },
            }

            await runContractFunction({
                params: options,
                onError: (error) => console.log(error),
                onSuccess: (tx) => handleBuyItemSuccess(tx),
            })
        } else {
            console.log("Ramo else")
            console.log(seller)
            console.log(account)
        }
    }

    async function handleBuyItemSuccess(tx) {
        await tx.wait(1)
        dispatch({
            type: "success",
            message:
                "Congraturations! Token now is in staking. You have 14 days to get back the product (and the token)",
            title: "Item Bought",
            position: "topR",
        })
        router.push("/user-tokens")
    }

    async function onCancelHandler() {
        if (isWeb3Enabled && isOwnedByUser) {
            // Solo l'attuale proprietario può rimuovere l'annuncio
            console.log("Remove Listing ...")

            const options = {
                abi: marketplaceAbi,
                contractAddress: marketplaceAddresses[stringChainId][0],
                functionName: "cancelListing",
                params: { nftAddress: nftAddress, tokenId: tokenId },
            }

            await runContractFunction({
                params: options,
                onError: (error) => {
                    console.log(error)
                    dispatch({
                        type: "error",
                        message:
                            "Error occurred during cancel listing operation",
                        title: "Listing Removal Error",
                        position: "topR",
                    })
                },
                onSuccess: (tx) => handleCancelSuccess(tx),
            })
        }
    }

    async function handleCancelSuccess(tx) {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Listing removed successfully",
            title: "Listing Canceled",
            position: "topR",
        })
    }

    return (
        <div style={{}}>
            <div>
                <Modal
                    headerHasBottomBorder
                    id="regular"
                    isVisible={isVisible}
                    onCancel={onCancelHandler}
                    isCancelDisabled={!isOwnedByUser}
                    onCloseButtonPressed={onClose}
                    isOkDisabled={isOwnedByUser}
                    onOk={handleOkClick}
                    title={`${nftName} #${tokenId} Details`}
                    okText={"Get it!"}
                    cancelText="Remove listing"
                >
                    <div
                        style={{
                            display: "grid",
                            placeItems: "center",
                        }}
                    >
                        <p>
                            {" "}
                            <em className="font-bold">Descripton: </em>{" "}
                            {tokenDescription}{" "}
                        </p>
                        <p>
                            {" "}
                            <em className="font-bold">NFT Address: </em>{" "}
                            {nftAddress}{" "}
                        </p>
                        <p>
                            {" "}
                            <em className="font-bold">Material: </em>{" "}
                            {nftAttributes[0].material}
                        </p>
                        <div>
                            {" "}
                            <em className="font-bold">Colours: </em>{" "}
                            {nftAttributes[0].colour.map((singleColour) => {
                                return (
                                    <div className="inline-block">
                                        <p className="px-1">{singleColour} </p>
                                    </div>
                                )
                            })}
                        </div>
                        <p>
                            {" "}
                            <em className="font-bold">Weight: </em>
                            {nftAttributes[0].weight}
                        </p>
                        <p>
                            {" "}
                            <em className="font-bold">Pureness: </em>{" "}
                            {nftAttributes[0].pureness}
                        </p>
                        <p>
                            {" "}
                            <em className="font-bold">Brand: </em> {creator}
                        </p>
                    </div>
                </Modal>
            </div>
        </div>
    )
}
