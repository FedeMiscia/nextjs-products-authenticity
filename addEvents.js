const Moralis = require("moralis/node")
require("dotenv").config()
const contractAddresses = require("./constants/networkMapping.json")

let chainId = process.env.chainId
const contractAddress = contractAddresses[chainId]["NftMarketplace"][0]

async function main() {}
