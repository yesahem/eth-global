'use client'

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { injected } from 'wagmi/connectors'

export function NavbarWalletConnection() {
  const { address, isConnected } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({
    address: address,
  })

  const hasMinBalance = balance && parseFloat(balance.formatted) >= 1.5

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-4">
        {/* Balance Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${hasMinBalance ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {balance?.formatted ? parseFloat(balance.formatted).toFixed(3) : '0.000'} ETH
          </span>
        </div>
        
        {/* Address */}
        <div className="hidden md:flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        
        {/* Access Status */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          hasMinBalance 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {hasMinBalance ? '✅ Full Access' : '❌ Write Only'}
        </div>
        
        {/* Disconnect Button */}
        <button
          onClick={() => disconnect()}
          className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="text-sm text-gray-500">
        Not Connected
      </div>
      <button
        onClick={() => connect({ connector: injected() })}
        disabled={isPending}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  )
}