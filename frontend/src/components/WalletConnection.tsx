'use client'

import { useAccount, useConnect, useDisconnect, useBalance, useConnectors } from 'wagmi'
import { useEffect, useState } from 'react'

export function WalletConnection() {
  const { address, isConnected, isReconnecting } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const connectors = useConnectors()
  const [mounted, setMounted] = useState(false)
  
  const { data: balance } = useBalance({
    address: address,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (isReconnecting) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reconnecting...</h2>
        <p className="text-gray-600">
          Reconnecting to your wallet...
        </p>
      </div>
    )
  }

  const hasMinBalance = balance && parseFloat(balance.formatted) >= 1.5

  if (isConnected && address) {
    return (
      <div className="vintage-card shadow-vintage p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold" style={{ color: 'var(--primary)' }}>
            Wallet Connected
          </h2>
          <button
            onClick={() => disconnect()}
            className="btn-elegant"
            style={{ background: 'var(--burgundy-600)' }}
          >
            Disconnect
          </button>
        </div>
        
        <div className="space-y-4 text-base">
          <p className="font-sans" style={{ color: 'var(--vintage-neutral-700)' }}>
            <span className="font-semibold" style={{ color: 'var(--mahogany-600)' }}>Address:</span> {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          <p className="font-sans" style={{ color: 'var(--vintage-neutral-700)' }}>
            <span className="font-semibold" style={{ color: 'var(--mahogany-600)' }}>Balance:</span> {balance?.formatted} {balance?.symbol}
          </p>
          
          {!hasMinBalance && (
            <div className="vintage-alert error mt-6">
              <p className="font-serif font-semibold text-lg" style={{ color: 'hsl(0, 70%, 50%)' }}>
                ⚠️ Insufficient Balance
              </p>
              <p className="font-sans mt-2" style={{ color: 'hsl(0, 70%, 30%)' }}>
                You need at least 1.5 ETH to query memories. Current balance: {balance?.formatted} {balance?.symbol}
              </p>
            </div>
          )}
          
          {hasMinBalance && (
            <div className="vintage-alert success mt-6">
              <p className="font-serif font-semibold text-lg" style={{ color: 'hsl(120, 60%, 50%)' }}>
                ✅ Sufficient Balance
              </p>
              <p className="font-sans mt-2" style={{ color: 'hsl(120, 60%, 30%)' }}>
                You can read and write memories!
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="vintage-card shadow-vintage p-8">
      <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: 'var(--primary)' }}>
        Connect Wallet
      </h2>
      <p className="font-sans text-lg mb-6" style={{ color: 'var(--vintage-neutral-700)' }}>
        Connect your MetaMask wallet to interact with the Decentralized Memory Layer.
      </p>
      <button
        onClick={() => connect({ connector: connectors[0] })}
        disabled={isPending || !connectors[0]}
        className={`w-full btn-ornate ${isPending ? 'loading-ornate' : ''}`}
      >
        {isPending ? 'Connecting...' : 'Connect MetaMask'}
      </button>
      <p className="font-sans text-sm mt-4 text-center" style={{ color: 'var(--vintage-neutral-500)' }}>
        Make sure you have at least 1.5 ETH to query memories.
      </p>
    </div>
  )
}