import { http, createConfig } from 'wagmi'
import { sepolia, mainnet, polygon, arbitrum } from 'wagmi/chains'
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// Define 0G testnet
export const zgTestnet = {
  id: 16602,
  name: '0G Testnet',
  network: '0g-testnet',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: '0G',
  },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
    public: { http: ['https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Explorer', url: 'https://explorer-testnet.0g.ai' },
  },
  testnet: true,
} as const

// Configure WalletConnect project ID (you should get this from https://cloud.walletconnect.com)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

export const config = createConfig({
  chains: [sepolia, zgTestnet, mainnet, polygon, arbitrum],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ 
      projectId,
      metadata: {
        name: 'Decentralized Memory Layer',
        description: 'Web3 + AI Decentralized Memory Layer for AI agents',
        url: 'https://memory-layer.app',
        icons: ['https://memory-layer.app/icon.png']
      }
    }),
    coinbaseWallet({
      appName: 'Decentralized Memory Layer',
      appLogoUrl: 'https://memory-layer.app/icon.png',
    }),
  ],
  transports: {
    [sepolia.id]: http(),
    [zgTestnet.id]: http('https://evmrpc-testnet.0g.ai'),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
