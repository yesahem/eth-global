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
  const [mounted, setMounted] = useState(false)

  const hasMinBalance = balance && parseFloat(balance.formatted) >= 1.5

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && isConnected && address) {
      setTargetAgent(address) // Default to current user's address
    }
  }, [mounted, isConnected, address])

  if (!mounted) {
    return (
      <div className="vintage-card shadow-vintage p-4 sm:p-6 md:p-8">
        <div className="animate-pulse">
          <div className="h-4 sm:h-6 bg-gray-200 rounded w-3/4 mb-3 sm:mb-4"></div>
          <div className="h-8 sm:h-10 bg-gray-200 rounded mb-3 sm:mb-4"></div>
          <div className="h-24 sm:h-32 bg-gray-200 rounded mb-3 sm:mb-4"></div>
        </div>
      </div>
    )
  }

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
    <div className="vintage-card shadow-vintage p-4 sm:p-6 md:p-8">
      <h2 className="text-xl sm:text-2xl font-serif font-bold mb-4 sm:mb-6" style={{ color: 'var(--primary)' }}>
        Read Memory
      </h2>
      <p className="font-sans text-sm sm:text-base md:text-lg mb-4 sm:mb-6" style={{ color: 'var(--vintage-neutral-700)' }}>
        Read memories from the decentralized memory layer. Requires at least 1.5 ETH balance.
      </p>
      
      <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
        <div>
          <label htmlFor="targetAgent" className="block font-serif font-semibold text-base sm:text-lg mb-2 sm:mb-3" style={{ color: 'var(--mahogany-600)' }}>
            Agent Address
          </label>
          <input
            id="targetAgent"
            type="text"
            value={targetAgent}
            onChange={(e) => setTargetAgent(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg font-sans transition-all duration-300 text-sm sm:text-base"
            style={{ 
              borderColor: 'var(--border)',
              background: 'var(--cream-50)',
              color: 'var(--foreground)'
            }}
            placeholder="0x... (Leave empty to read your own memories)"
            disabled={isLoading}
            onFocus={(e) => e.target.style.borderColor = 'var(--gold-400)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
          <p className="font-sans text-sm mt-2" style={{ color: 'var(--vintage-neutral-500)' }}>
            Enter the Ethereum address of the agent whose memories you want to read
          </p>
        </div>
        
        <button
          onClick={handleRead}
          disabled={isLoading || !hasMinBalance || !targetAgent.trim()}
          className={`w-full btn-ornate border-2 ${isLoading ? 'loading-ornate' : ''}`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center text-black">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Reading Memories...
            </div>
          ) : (
            <div className="flex items-center justify-center text-black">
              
              Read Memories
            </div>
          )}
        </button>
      </div>

      {!hasMinBalance && isConnected && (
        <div className="vintage-alert warning mb-6">
          <p className="font-serif font-semibold text-lg" style={{ color: 'hsl(38, 92%, 50%)' }}>
            ⚠️ Insufficient Balance
          </p>
          <p className="font-sans mt-2" style={{ color: 'hsl(38, 92%, 30%)' }}>
            You need at least 1.5 ETH to read memories. Current: {balance?.formatted} {balance?.symbol}
          </p>
        </div>
      )}

      {message && (
        <div className={`vintage-alert mb-6 ${message.type}`}>
          <p className="font-serif font-semibold text-lg">
            {message.type === 'success' ? '✅' : message.type === 'error' ? '❌' : 'ℹ️'} {message.text}
          </p>
        </div>
      )}

      {memories.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <h3 className="text-lg sm:text-xl font-serif font-bold" style={{ color: 'var(--mahogany-700)' }}>
            Memory Timeline
          </h3>
          <div className="max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto space-y-3 sm:space-y-4">
            {memories.map((memory, index) => (
              <div key={memory.hash || index} className="vintage-card p-3 sm:p-4 md:p-6 hover:shadow-ornate transition-all duration-300">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <span className="ornate-step text-xs sm:text-sm" style={{ width: '1.75rem', height: '1.75rem', fontSize: '0.75rem' }}>
                    {index + 1}
                  </span>
                  <span className="font-sans text-xs" style={{ color: 'var(--vintage-neutral-400)' }}>
                    <span className="hidden sm:inline">Hash: </span>{memory.hash?.slice(0, 6)}...{memory.hash?.slice(-6)}
                  </span>
                </div>
                <p className="font-sans text-sm sm:text-base leading-relaxed" style={{ color: 'var(--foreground)' }}>
                  {memory.content || 'Content not available'}
                </p>
                {memory.timestamp && (
                  <p className="font-sans text-sm mt-3" style={{ color: 'var(--vintage-neutral-500)' }}>
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