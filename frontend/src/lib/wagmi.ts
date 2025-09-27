import { http, createConfig } from 'wagmi'
import { sepolia, localhost } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { defineChain } from 'viem'

// Define 0G Testnet chain
export const zgTestnet = defineChain({
  id: 9000,
  name: '0G Testnet',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: '0G',
  },
  rpcUrls: {
    default: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G Explorer',
      url: 'https://chainscan-newton.0g.ai',
    },
  },
  testnet: true,
})

export const config = createConfig({
  chains: [zgTestnet, sepolia, localhost],
  connectors: [
    injected(),
  ],
  transports: {
    [zgTestnet.id]: http('https://evmrpc-testnet.0g.ai'),
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
    [localhost.id]: http('http://127.0.0.1:8545'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}