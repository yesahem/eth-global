'use client'

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { injected } from 'wagmi/connectors'

export function WalletConnection() {
  const { address, isConnected } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({
    address: address,
  })

  const hasMinBalance = balance && parseFloat(balance.formatted) >= 1.5

  if (isConnected && address) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Wallet Connected</h2>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Disconnect
          </button>
        </div>
        
        <div className="space-y-2 text-sm">
          <p className="text-gray-600">
            <span className="font-medium">Address:</span> {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Balance:</span> {balance?.formatted} {balance?.symbol}
          </p>
          
          {!hasMinBalance && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">
                ⚠️ Insufficient Balance
              </p>
              <p className="text-red-700 text-xs mt-1">
                You need at least 1.5 ETH to query memories. Current balance: {balance?.formatted} {balance?.symbol}
              </p>
            </div>
          )}
          
          {hasMinBalance && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">
                ✅ Sufficient Balance
              </p>
              <p className="text-green-700 text-xs mt-1">
                You can read and write memories!
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Connect Wallet</h2>
      <p className="text-gray-600 mb-4">
        Connect your MetaMask wallet to interact with the Decentralized Memory Layer.
      </p>
      <button
        onClick={() => connect({ connector: injected() })}
        disabled={isPending}
        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Connecting...' : 'Connect MetaMask'}
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Make sure you have at least 1.5 ETH to query memories.
      </p>
    </div>
  )
}