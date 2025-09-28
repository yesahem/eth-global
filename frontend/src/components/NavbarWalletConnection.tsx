'use client'

import { useAccount, useConnect, useDisconnect, useBalance, useConnectors } from 'wagmi'
import { useEffect, useState } from 'react'

export function NavbarWalletConnection() {
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
      <div className="flex items-center space-x-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    )
  }

  if (isReconnecting) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-500">
          Reconnecting...
        </div>
      </div>
    )
  }

  const hasMinBalance = balance && parseFloat(balance.formatted) >= 1.5

  if (isConnected && address) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full sm:w-auto">
        {/* Balance Indicator */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-elegant ${hasMinBalance ? 'gradient-gold' : ''}`} 
               style={{ background: hasMinBalance ? undefined : 'var(--burgundy-500)' }}></div>
          <span className="font-sans font-semibold text-sm sm:text-base" style={{ color: 'var(--mahogany-700)' }}>
            {balance?.formatted ? parseFloat(balance.formatted).toFixed(3) : '0.000'} ETH
          </span>
        </div>
        
        {/* Address */}
        <div className="hidden lg:flex items-center space-x-2">
          <span className="font-sans text-sm" style={{ color: 'var(--vintage-neutral-600)' }}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        
        {/* Mobile Address */}
        <div className="flex sm:hidden items-center space-x-2">
          <span className="font-sans text-xs" style={{ color: 'var(--vintage-neutral-600)' }}>
            {address.slice(0, 4)}...{address.slice(-4)}
          </span>
        </div>
        
        {/* Access Status */}
        <div className="px-2 sm:px-3 py-1 sm:py-2 rounded-full font-sans font-semibold text-xs sm:text-sm shadow-elegant"
             style={{ 
               background: hasMinBalance ? 'var(--gradient-gold)' : 'var(--burgundy-100)',
               color: hasMinBalance ? 'var(--burgundy-800)' : 'var(--burgundy-700)'
             }}>
          <span className="hidden sm:inline">{hasMinBalance ? '✅ Full Access' : '❌ Write Only'}</span>
          <span className="sm:hidden">{hasMinBalance ? '✅ Full' : '❌ Write'}</span>
        </div>
      
        {/* Disconnect Button */}
        <button
          onClick={() => disconnect()}
          className="btn-elegant px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
          style={{ background: 'var(--mahogany-600)' }}
        >
          <span className="hidden sm:inline">Disconnect</span>
          <span className="sm:hidden">DC</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 lg:gap-6 w-full sm:w-auto">
      <div className="font-sans text-xs sm:text-sm" style={{ color: 'var(--vintage-neutral-500)' }}>
        Not Connected
      </div>
      <button
        onClick={() => connect({ connector: connectors[0] })}
        disabled={isPending || !connectors[0]}
        className={`btn-ornate px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm ${isPending ? 'loading-ornate' : ''}`}
      >
        <span className="border-2 p-3 rounded-xl w-full hidden sm:inline text-black" >{isPending ? 'Connecting...' : 'Connect Wallet'}</span>
        <span className="sm:hidden">{isPending ? 'Connecting...' : 'Connect'}</span>
      </button>
    </div>
  )
}