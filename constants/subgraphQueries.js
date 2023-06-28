import { gql } from "@apollo/client"

// In questo script definiamo tutte le query verso The Graph che poi importeremo nelle varie pagine: le definiamo tutte qui per ragioni di modularità

export const GET_ACTIVE_ITEMS = gql`
    {
        activeItems(first: 5, where: { buyer: null }) {
            id
            buyer
            seller
            nftAddress
            tokenId
        }
    }
`

// Modello di query dinamica con variabili passate all'atto della chiamata tramite l'hook useQuery()
export const GET_STAKING_ITEMS = gql`
    query getStakingItems($buyerAddress: String!) {
        itemBoughts(
            first: 5
            where: { buyer: $buyerAddress, inStaking: true }
        ) {
            id
            buyer
            nftAddress
            tokenId
            timestamp
        }
    }
`

export const GET_RECEIVED_ITEMS = gql`
    query getTransferedItems($userAddress: String!) {
        tokenTransfereds(first: 5, where: { to: $userAddress }) {
            id
            nftAddress
            tokenId
            from
            to
        }
    }
`

export const GET_ACTIVE_ITEM = gql`
    query getActiveItem($id: ID!) {
        activeItems(where: { id: $id, buyer: null }) {
            seller
        }
    }
`
