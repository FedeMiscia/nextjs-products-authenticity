import "@/styles/globals.css"
import { MoralisProvider } from "react-moralis"
import Header from "../components/Header"
import Head from "next/head"
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import { NotificationProvider } from "web3uikit"

// Inizializzazione del client Apollo per effettuare le query da the graph
const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: "https://api.studio.thegraph.com/query/48551/products-authenticity/version/latest", // endpoint per le query al subgraph (letta dal sito)
})

function App({ Component, pageProps }) {
    return (
        <div>
            <Head>
                <title>Products Authenticity NFT</title>
                <meta
                    name="description"
                    content="Products Authenticity using NFT"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <MoralisProvider initializeOnMount={false}>
                <ApolloProvider client={client}>
                    <NotificationProvider>
                        <Header />
                        <Component {...pageProps} />
                    </NotificationProvider>
                </ApolloProvider>
            </MoralisProvider>
        </div>
    )
}

export default App
