'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import axios from 'axios'

export function WriteMemory() {
  const { address, isConnected } = useAccount()
  const [memory, setMemory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="vintage-card shadow-vintage p-4 sm:p-6 md:p-8">
        <div className="animate-pulse">
          <div className="h-4 sm:h-6 bg-gray-200 rounded w-3/4 mb-3 sm:mb-4"></div>
          <div className="h-24 sm:h-32 bg-gray-200 rounded mb-3 sm:mb-4"></div>
          <div className="h-8 sm:h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !address) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' })
      return
    }

    if (!memory.trim()) {
      setMessage({ type: 'error', text: 'Please enter a memory to store' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/write`, {
        content: memory.trim(),
        agent: address
      })

      if (response.data.success) {
        setMessage({ type: 'success', text: `Memory stored successfully! Hash: ${response.data.hash.slice(0, 10)}...` })
        setMemory('')
      } else {
        setMessage({ type: 'error', text: response.data.error || 'Failed to store memory' })
      }
    } catch (error: unknown) {
      console.error('Error writing memory:', error)
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to store memory. Please try again.'
        : 'Failed to store memory. Please try again.'
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
      <div className="vintage-card shadow-vintage p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl font-serif font-bold mb-4 sm:mb-6" style={{ color: 'var(--primary)' }}>
          Write Memory
        </h2>
        <div className="vintage-alert" style={{ borderLeftColor: 'var(--gold-500)', background: 'var(--gold-50)' }}>
          <p className="font-serif font-semibold text-base sm:text-lg" style={{ color: 'var(--gold-700)' }}>
            💡 Connect Wallet Required
          </p>
          <p className="font-sans mt-2" style={{ color: 'var(--gold-600)' }}>
            Please connect your wallet using the &quot;Connect Wallet&quot; button in the top navigation to store memories.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="vintage-card shadow-vintage p-4 sm:p-6 md:p-8">
      <h2 className="text-xl sm:text-2xl font-serif font-bold mb-4 sm:mb-6" style={{ color: 'var(--primary)' }}>
        Write Memory
      </h2>
      <p className="font-sans text-sm sm:text-base md:text-lg mb-4 sm:mb-6" style={{ color: 'var(--vintage-neutral-700)' }}>
        Store a memory in the decentralized memory layer. It will be stored on IPFS and referenced on the blockchain.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="memory" className="block font-serif font-semibold text-base sm:text-lg mb-2 sm:mb-3" style={{ color: 'var(--mahogany-600)' }}>
            Memory Content
          </label>
          <textarea
            id="memory"
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            rows={4}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg font-sans resize-none transition-all duration-300 text-sm sm:text-base"
            style={{ 
              borderColor: 'var(--border)',
              background: 'var(--cream-50)',
              color: 'var(--foreground)'
            }}
            placeholder="Enter your memory here... (e.g., learned about React hooks, completed project milestone, etc.)"
            disabled={isLoading}
            onFocus={(e) => e.target.style.borderColor = 'var(--gold-400)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
          <p className="font-sans text-xs sm:text-sm mt-2" style={{ color: 'var(--vintage-neutral-500)' }}>
            Characters: {memory.length} | Agent: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !memory.trim()}
          className={`w-full btn-ornate border-amber-500 border-2 ${isLoading ? 'loading-ornate' : ''}`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Storing Memory...
            </div>
          ) : (
            <div className="flex items-center justify-center text-black ">
              
              Store Memory
            </div>
          )}
        </button>
      </form>

      {message && (
        <div className={`vintage-alert mt-6 ${message.type}`}>
          <p className="font-serif font-semibold text-lg">
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </p>
        </div>
      )}
    </div>
  )
}