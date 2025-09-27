'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import axios from 'axios'

interface Memory {
  hash: string
  content: string
  timestamp?: string
}

export function ReadMemory() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [targetAgent, setTargetAgent] = useState('')

  const hasMinBalance = balance && parseFloat(balance.formatted) >= 1.5

  useEffect(() => {
    if (isConnected && address) {
      setTargetAgent(address) // Default to current user's address
    }
  }, [isConnected, address])

  const handleRead = async () => {
    if (!isConnected || !address) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' })
      return
    }

    if (!hasMinBalance) {
      setMessage({ type: 'error', text: 'Insufficient balance. You need at least 1.5 ETH to read memories.' })
      return
    }

    if (!targetAgent.trim()) {
      setMessage({ type: 'error', text: 'Please enter an agent address' })
      return
    }

    setIsLoading(true)
    setMessage(null)
    setMemories([])

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/read`, {
        params: {
          agent: targetAgent.trim(),
          reader: address
        }
      })

      if (response.data.success) {
        setMemories(response.data.memories || [])
        setMessage({ 
          type: 'success', 
          text: `Found ${response.data.memories?.length || 0} memories for agent ${targetAgent.slice(0, 6)}...${targetAgent.slice(-4)}` 
        })
      } else {
        setMessage({ type: 'error', text: response.data.error || 'Failed to read memories' })
      }
    } catch (error: unknown) {
      console.error('Error reading memories:', error)
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to read memories. Please try again.'
        : 'Failed to read memories. Please try again.'
      setMessage({ 
        type: 'error', 
        text: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Read Memory</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm font-medium">💡 Connect Wallet Required</p>
          <p className="text-blue-700 text-sm mt-1">
            Please connect your wallet using the &quot;Connect Wallet&quot; button in the top navigation to read memories.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Read Memory</h2>
      <p className="text-gray-600 mb-4">
        Read memories from the decentralized memory layer. Requires at least 1.5 ETH balance.
      </p>
      
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="targetAgent" className="block text-sm font-medium text-gray-700 mb-2">
            Agent Address
          </label>
          <input
            id="targetAgent"
            type="text"
            value={targetAgent}
            onChange={(e) => setTargetAgent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0x... (Leave empty to read your own memories)"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the Ethereum address of the agent whose memories you want to read
          </p>
        </div>
        
        <button
          onClick={handleRead}
          disabled={isLoading || !hasMinBalance || !targetAgent.trim()}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Reading Memories...
            </div>
          ) : (
            'Read Memories'
          )}
        </button>
      </div>

      {!hasMinBalance && isConnected && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm font-medium">
            ⚠️ Insufficient Balance
          </p>
          <p className="text-yellow-700 text-xs mt-1">
            You need at least 1.5 ETH to read memories. Current: {balance?.formatted} {balance?.symbol}
          </p>
        </div>
      )}

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : message.type === 'error'
            ? 'bg-red-50 border border-red-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <p className={`text-sm font-medium ${
            message.type === 'success' 
              ? 'text-green-800' 
              : message.type === 'error' 
              ? 'text-red-800' 
              : 'text-blue-800'
          }`}>
            {message.type === 'success' ? '✅' : message.type === 'error' ? '❌' : 'ℹ️'} {message.text}
          </p>
        </div>
      )}

      {memories.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Memory Timeline</h3>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {memories.map((memory, index) => (
              <div key={memory.hash || index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                  <span className="text-xs text-gray-400">
                    Hash: {memory.hash?.slice(0, 8)}...{memory.hash?.slice(-8)}
                  </span>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed">
                  {memory.content || 'Content not available'}
                </p>
                {memory.timestamp && (
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(memory.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {memories.length === 0 && message?.type === 'success' && (
        <div className="text-center py-8 text-gray-500">
          <p>No memories found for this agent.</p>
        </div>
      )}
    </div>
  )
}