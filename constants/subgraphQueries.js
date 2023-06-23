import { gql } from "@apollo/client"

// In questo script definiamo tutte le query verso The Graph che poi importeremo nelle varie pagine: le definiamo tutte qui per ragioni di modularità

const GET_ACTIVE_ITEMS = gql`
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

export default GET_ACTIVE_ITEMS
