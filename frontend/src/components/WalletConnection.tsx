'use client'

import { useAccount, useConnect, useDisconnect, useBalance, useConnectors, useChainId, useSwitchChain } from 'wagmi'
import { useEffect, useState } from 'react'
import { sepolia, mainnet, polygon, arbitrum } from 'viem/chains'
import { zgTestnet } from '@/lib/wagmi'

// Types for managing multiple wallets
interface ConnectedWallet {
  address: string
  connector: any
  name: string
  isActive: boolean
  balance?: string
}

// Supported networks
const supportedChains = [sepolia, zgTestnet, mainnet, polygon, arbitrum]

// Wallet icons and metadata
const walletMetadata = {
  'MetaMask': { icon: '🦊', color: 'hsl(25, 95%, 53%)', description: 'Most popular Ethereum wallet' },
  'WalletConnect': { icon: '🔗', color: 'hsl(219, 95%, 64%)', description: 'Connect with 300+ wallets' },
  'Coinbase Wallet': { icon: '🔷', color: 'hsl(219, 95%, 53%)', description: 'Built by Coinbase' },
  'Injected': { icon: '🌐', color: 'hsl(271, 81%, 56%)', description: 'Browser wallet' },
  'Safe': { icon: '🔒', color: 'hsl(79, 70%, 40%)', description: 'Multi-signature wallet' },
  'Ledger': { icon: '🔐', color: 'hsl(0, 0%, 0%)', description: 'Hardware wallet' },
  'Trezor': { icon: '🛡️', color: 'hsl(0, 0%, 0%)', description: 'Hardware wallet' },
  'Default': { icon: '👛', color: 'hsl(220, 9%, 46%)', description: 'Web3 wallet' }
}

export function WalletConnection() {
  const { address, isConnected, isReconnecting, connector } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const connectors = useConnectors()
  const chainId = useChainId()
  const [mounted, setMounted] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showMultiWalletView, setShowMultiWalletView] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([])
  const [activeWalletIndex, setActiveWalletIndex] = useState(0)
  
  const { data: balance } = useBalance({
    address: address,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update connected wallets when account changes
  useEffect(() => {
    if (isConnected && address && connector) {
      const walletExists = connectedWallets.some(w => w.address === address)
      
      if (!walletExists) {
        const newWallet: ConnectedWallet = {
          address,
          connector,
          name: connector.name || 'Unknown Wallet',
          isActive: true,
          balance: balance?.formatted
        }
        
        // Set all other wallets as inactive
        const updatedWallets = connectedWallets.map(w => ({ ...w, isActive: false }))
        setConnectedWallets([...updatedWallets, newWallet])
        setActiveWalletIndex(updatedWallets.length)
      } else {
        // Update active wallet
        setConnectedWallets(prev => prev.map((w, index) => ({
          ...w,
          isActive: w.address === address,
          balance: w.address === address ? balance?.formatted : w.balance
        })))
        const activeIndex = connectedWallets.findIndex(w => w.address === address)
        if (activeIndex !== -1) setActiveWalletIndex(activeIndex)
      }
    }
  }, [isConnected, address, connector, balance])

  // Helper functions
  const getWalletMetadata = (name: string) => {
    return walletMetadata[name as keyof typeof walletMetadata] || walletMetadata.Default
  }

  const getCurrentNetwork = () => {
    const network = supportedChains.find(chain => chain.id === chainId)
    return network || { name: 'Unknown Network', id: chainId }
  }

  const checkWalletInstalled = (connectorName: string): boolean => {
    if (typeof window === 'undefined') return false
    
    switch (connectorName) {
      case 'MetaMask':
        return !!(window as any).ethereum?.isMetaMask
      case 'Coinbase Wallet':
        return !!(window as any).ethereum?.isCoinbaseWallet
      default:
        return true
    }
  }

  const handleConnect = async (connector: any) => {
    try {
      setConnectionError(null)
      await connect({ connector })
      setShowWalletModal(false)
    } catch (error: any) {
      console.error('Connection error:', error)
      setConnectionError(error.message || 'Failed to connect wallet')
    }
  }

  const handleConnectAdditional = async (connector: any) => {
    try {
      setConnectionError(null)
      await connect({ connector })
      setShowWalletModal(false)
    } catch (error: any) {
      console.error('Connection error:', error)
      setConnectionError(error.message || 'Failed to connect additional wallet')
    }
  }

  const switchToWallet = async (walletIndex: number) => {
    const wallet = connectedWallets[walletIndex]
    if (wallet && wallet.connector) {
      try {
        await connect({ connector: wallet.connector })
        setActiveWalletIndex(walletIndex)
      } catch (error: any) {
        console.error('Switch wallet error:', error)
        setConnectionError('Failed to switch to wallet')
      }
    }
  }

  const disconnectWallet = async (walletIndex?: number) => {
    if (typeof walletIndex === 'number') {
      // Disconnect specific wallet
      const wallet = connectedWallets[walletIndex]
      if (wallet) {
        const updatedWallets = connectedWallets.filter((_, index) => index !== walletIndex)
        setConnectedWallets(updatedWallets)
        
        // If disconnecting active wallet, switch to first available or disconnect all
        if (walletIndex === activeWalletIndex) {
          if (updatedWallets.length > 0) {
            setActiveWalletIndex(0)
            await connect({ connector: updatedWallets[0].connector })
          } else {
            await disconnect()
          }
        } else if (walletIndex < activeWalletIndex) {
          setActiveWalletIndex(activeWalletIndex - 1)
        }
      }
    } else {
      // Disconnect all wallets
      await disconnect()
      setConnectedWallets([])
      setActiveWalletIndex(0)
    }
  }

  const handleSwitchNetwork = async (targetChainId: number) => {
    try {
      await switchChain({ chainId: targetChainId })
      setConnectionError(null)
    } catch (error: any) {
      console.error('Network switch error:', error)
      setConnectionError('Failed to switch network')
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="vintage-card p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-vintage-cream rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-vintage-cream rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-vintage-cream rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (isReconnecting) {
    return (
      <div className="vintage-card p-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-vintage-gold border-t-transparent"></div>
          <h2 className="text-xl font-serif font-semibold" style={{ color: 'var(--primary)' }}>
            Reconnecting...
          </h2>
        </div>
        <p className="font-sans" style={{ color: 'var(--vintage-neutral-700)' }}>
          Reconnecting to your wallet...
        </p>
      </div>
    )
  }

  const hasMinBalance = balance && parseFloat(balance.formatted) >= 1.5
  const currentNetwork = getCurrentNetwork()
  const isCorrectNetwork = chainId === 11155111 || chainId === 16602 // Sepolia or 0G testnet

  if (isConnected && address) {
    const walletMeta = getWalletMetadata(connector?.name || '')
    const activeWallet = connectedWallets[activeWalletIndex]
    
    return (
      <div className="vintage-card shadow-vintage p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h2 className="text-2xl font-serif font-bold" style={{ color: 'var(--primary)' }}>
                {connectedWallets.length > 1 ? `${connectedWallets.length} Wallets Connected` : 'Wallet Connected'}
              </h2>
              <p className="text-sm font-sans" style={{ color: 'var(--vintage-neutral-600)' }}>
                {walletMeta.icon} {connector?.name || 'Unknown Wallet'}
                {connectedWallets.length > 1 && ` (Active)`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {connectedWallets.length > 1 && (
              <button
                onClick={() => setShowMultiWalletView(!showMultiWalletView)}
                className="btn-ornate px-3 py-2 text-sm"
              >
                <span className="font-sans">
                  {showMultiWalletView ? 'Hide Wallets' : 'Manage Wallets'}
                </span>
              </button>
            )}
            <button
              onClick={() => setShowWalletModal(true)}
              className="btn-elegant px-3 py-2 text-sm"
              style={{ background: 'var(--vintage-gold-600)' }}
            >
              <span className="font-sans">+ Add Wallet</span>
            </button>
            <button
              onClick={() => disconnectWallet()}
              className="btn-elegant"
              style={{ background: 'var(--burgundy-600)' }}
            >
              Disconnect All
            </button>
          </div>
        </div>

        {/* Multi-Wallet View */}
        {showMultiWalletView && connectedWallets.length > 1 && (
          <div className="mb-6 bg-vintage-cream/20 rounded-lg p-4">
            <h3 className="text-lg font-serif font-semibold mb-4" style={{ color: 'var(--primary)' }}>
              Connected Wallets
            </h3>
            <div className="space-y-3">
              {connectedWallets.map((wallet, index) => {
                const meta = getWalletMetadata(wallet.name)
                const isActive = index === activeWalletIndex
                
                return (
                  <div
                    key={`${wallet.address}-${index}`}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                      isActive 
                        ? 'border-vintage-gold bg-vintage-gold/10' 
                        : 'border-vintage-cream/50 bg-vintage-cream/30 hover:border-vintage-gold/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{meta.icon}</div>
                      <div>
                        <p className="font-semibold font-sans" style={{ color: 'var(--vintage-neutral-800)' }}>
                          {wallet.name} {isActive && '(Active)'}
                        </p>
                        <p className="text-sm font-mono" style={{ color: 'var(--vintage-neutral-600)' }}>
                          {formatAddress(wallet.address)}
                        </p>
                        {wallet.balance && (
                          <p className="text-xs font-sans" style={{ color: 'var(--vintage-neutral-500)' }}>
                            Balance: {wallet.balance} ETH
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!isActive && (
                        <button
                          onClick={() => switchToWallet(index)}
                          className="btn-ornate px-3 py-1 text-xs"
                        >
                          <span className="font-sans">Switch</span>
                        </button>
                      )}
                      <button
                        onClick={() => disconnectWallet(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-sans"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {/* Account Info */}
          <div className="bg-vintage-cream/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold font-sans" style={{ color: 'var(--mahogany-600)' }}>
                Address
              </span>
              <button
                onClick={() => copyToClipboard(address)}
                className="text-sm text-vintage-gold hover:text-vintage-gold-dark transition-colors flex items-center space-x-1"
              >
                <span>📋</span>
                <span className="font-sans">Copy</span>
              </button>
            </div>
            <p className="font-mono text-sm" style={{ color: 'var(--vintage-neutral-700)' }}>
              {formatAddress(address)}
            </p>
          </div>

          {/* Balance Info */}
          <div className="bg-vintage-cream/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold font-sans" style={{ color: 'var(--mahogany-600)' }}>
                Balance
              </span>
              <p className="font-semibold font-sans" style={{ color: 'var(--vintage-neutral-700)' }}>
                {balance?.formatted} {balance?.symbol}
              </p>
            </div>
          </div>

          {/* Network Info */}
          <div className="bg-vintage-cream/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold font-sans" style={{ color: 'var(--mahogany-600)' }}>
                Network
              </span>
              {!isCorrectNetwork && (
                <button
                  onClick={() => handleSwitchNetwork(11155111)} // Switch to Sepolia
                  className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-sans"
                >
                  Switch
                </button>
              )}
            </div>
            <p className={`text-sm font-sans ${isCorrectNetwork ? '' : 'text-red-600'}`} 
               style={{ color: isCorrectNetwork ? 'var(--vintage-neutral-700)' : 'hsl(0, 70%, 50%)' }}>
              {currentNetwork.name}
            </p>
            {!isCorrectNetwork && (
              <p className="text-xs text-red-500 mt-1 font-sans">
                Please switch to Sepolia or 0G testnet
              </p>
            )}
          </div>
          
          {/* Balance Status */}
          {!hasMinBalance ? (
            <div className="vintage-alert error">
              <p className="font-serif font-semibold text-lg" style={{ color: 'hsl(0, 70%, 50%)' }}>
                ⚠️ Insufficient Balance
              </p>
              <p className="font-sans mt-2" style={{ color: 'hsl(0, 70%, 30%)' }}>
                You need at least 1.5 ETH to query memories. Current balance: {balance?.formatted} {balance?.symbol}
              </p>
            </div>
          ) : (
            <div className="vintage-alert success">
              <p className="font-serif font-semibold text-lg" style={{ color: 'hsl(120, 60%, 50%)' }}>
                ✅ Sufficient Balance
              </p>
              <p className="font-sans mt-2" style={{ color: 'hsl(120, 60%, 30%)' }}>
                You can read and write memories!
              </p>
            </div>
          )}

          {/* Connection Error */}
          {connectionError && (
            <div className="vintage-alert error">
              <p className="font-serif font-semibold text-lg" style={{ color: 'hsl(0, 70%, 50%)' }}>
                Connection Error
              </p>
              <p className="font-sans mt-2" style={{ color: 'hsl(0, 70%, 30%)' }}>
                {connectionError}
              </p>
              <button
                onClick={() => setConnectionError(null)}
                className="text-xs text-red-500 hover:text-red-700 mt-1 font-sans"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="vintage-card shadow-vintage p-8">
        <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: 'var(--primary)' }}>
          Connect Wallet
        </h2>
        <p className="font-sans text-lg mb-6" style={{ color: 'var(--vintage-neutral-700)' }}>
          Choose your preferred wallet to interact with the Decentralized Memory Layer. You can connect multiple wallets and switch between them.
        </p>
        
        <button
          onClick={() => setShowWalletModal(true)}
          className="w-full btn-elegant mb-4"
          disabled={isPending}
        >
          {isPending ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-vintage-gold border-t-transparent"></div>
              <span className="font-sans">Connecting...</span>
            </div>
          ) : (
            <span className="font-sans font-medium">Choose Wallet</span>
          )}
        </button>

        {/* Quick Connect Buttons for Popular Wallets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {connectors.slice(0, 4).map((connector) => {
            const walletMeta = getWalletMetadata(connector.name)
            const isInstalled = checkWalletInstalled(connector.name)
            
            return (
              <button
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                disabled={isPending || (!isInstalled && connector.name === 'MetaMask')}
                className={`btn-ornate flex items-center justify-center gap-2 p-3 ${
                  isPending ? 'loading-ornate opacity-50' : ''
                } ${(!isInstalled && connector.name === 'MetaMask') ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="text-lg">{walletMeta.icon}</span>
                <span className="font-sans text-sm font-medium">
                  {connector.name}
                  {!isInstalled && connector.name === 'MetaMask' && (
                    <span className="text-xs text-red-500 block">(Not Installed)</span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
        
        {connectors.length === 0 && (
          <div className="vintage-alert error">
            <p className="font-serif font-semibold text-lg" style={{ color: 'hsl(0, 70%, 50%)' }}>
              ⚠️ No Wallets Available
            </p>
            <p className="font-sans mt-2" style={{ color: 'hsl(0, 70%, 30%)' }}>
              Please install MetaMask or another Web3 wallet to continue.
            </p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-vintage-gold hover:text-vintage-gold-dark underline font-sans text-sm"
            >
              Download MetaMask →
            </a>
          </div>
        )}

        {/* Connection Error */}
        {connectionError && (
          <div className="vintage-alert error mt-4">
            <p className="font-serif font-semibold text-lg" style={{ color: 'hsl(0, 70%, 50%)' }}>
              Connection Error
            </p>
            <p className="font-sans mt-2" style={{ color: 'hsl(0, 70%, 30%)' }}>
              {connectionError}
            </p>
            <button
              onClick={() => setConnectionError(null)}
              className="text-xs text-red-500 hover:text-red-700 mt-1 font-sans"
            >
              Dismiss
            </button>
          </div>
        )}
        
        <p className="font-sans text-sm mt-6 text-center" style={{ color: 'var(--vintage-neutral-500)' }}>
          Make sure you have at least 1.5 ETH to query memories.
        </p>
      </div>

      {/* Wallet Selection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="vintage-card max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif font-bold" style={{ color: 'var(--primary)' }}>
                {connectedWallets.length > 0 ? 'Add Another Wallet' : 'Choose Your Wallet'}
              </h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-vintage-neutral-600 hover:text-vintage-neutral-800 text-2xl"
              >
                ×
              </button>
            </div>

            {connectedWallets.length > 0 && (
              <div className="mb-4 p-3 bg-vintage-gold/10 rounded-lg">
                <p className="text-sm font-sans" style={{ color: 'var(--vintage-neutral-700)' }}>
                  💡 You can connect multiple wallets and easily switch between them. Your current active wallet will remain unchanged.
                </p>
              </div>
            )}

            {/* All Wallet Options */}
            <div className="space-y-3 mb-6">
              {connectors.map((connector) => {
                const walletMeta = getWalletMetadata(connector.name)
                const isInstalled = checkWalletInstalled(connector.name)

                const isAlreadyConnected = connectedWallets.some(w => w.name === connector.name)

                return (
                  <button
                    key={connector.uid}
                    onClick={() => connectedWallets.length > 0 ? handleConnectAdditional(connector) : handleConnect(connector)}
                    disabled={isPending || (!isInstalled && connector.name === 'MetaMask')}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                      isInstalled || connector.name !== 'MetaMask'
                        ? `border-vintage-gold/30 hover:border-vintage-gold hover:bg-vintage-cream/50 ${
                            isAlreadyConnected ? 'bg-vintage-gold/10 border-vintage-gold' : ''
                          }`
                        : 'border-gray-300 bg-gray-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${walletMeta.color}20` }}
                      >
                        {walletMeta.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold font-sans" style={{ color: 'var(--vintage-neutral-800)' }}>
                          {connector.name}
                          {isAlreadyConnected && (
                            <span className="text-vintage-gold text-sm ml-2">✓ Connected</span>
                          )}
                          {!isInstalled && connector.name === 'MetaMask' && (
                            <span className="text-red-500 text-sm ml-2">(Not Installed)</span>
                          )}
                        </h4>
                        <p className="text-sm font-sans" style={{ color: 'var(--vintage-neutral-600)' }}>
                          {walletMeta.description}
                          {isAlreadyConnected && ' • Add another account'}
                        </p>
                      </div>
                      <div className="text-right">
                        {isInstalled && connector.name === 'MetaMask' && (
                          <span className="text-green-500 text-sm font-sans">✓ Installed</span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Help Section */}
            <div className="bg-vintage-cream/30 rounded-lg p-4 mb-4">
              <p className="text-sm font-sans font-medium" style={{ color: 'var(--vintage-neutral-700)' }}>
                {connectedWallets.length > 0 ? 'Need another wallet?' : "Don't have a wallet?"}
              </p>
              <div className="mt-2 space-y-1">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-vintage-gold hover:text-vintage-gold-dark underline font-sans"
                >
                  📲 Download MetaMask (Recommended)
                </a>
                <a
                  href="https://www.coinbase.com/wallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-vintage-gold hover:text-vintage-gold-dark underline font-sans"
                >
                  📱 Get Coinbase Wallet
                </a>
                {connectedWallets.length > 0 && (
                  <p className="text-xs font-sans mt-2" style={{ color: 'var(--vintage-neutral-500)' }}>
                    💡 Tip: You can connect the same wallet type with different accounts
                  </p>
                )}
              </div>
            </div>

            {/* Supported Networks */}
            <div className="bg-vintage-cream/20 rounded-lg p-4">
              <p className="text-sm font-medium font-sans mb-2" style={{ color: 'var(--vintage-neutral-700)' }}>
                Supported Networks:
              </p>
              <div className="flex flex-wrap gap-2">
                {supportedChains.map((chain) => (
                  <span
                    key={chain.id}
                    className="px-2 py-1 bg-vintage-gold/20 text-vintage-neutral-700 text-xs rounded font-sans"
                  >
                    {chain.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}