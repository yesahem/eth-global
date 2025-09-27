'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import axios from 'axios'

export function WriteMemory() {
  const { address, isConnected } = useAccount()
  const [memory, setMemory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
        ? (error as any).response?.data?.error || 'Failed to store memory. Please try again.'
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
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Write Memory</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm font-medium">💡 Connect Wallet Required</p>
          <p className="text-blue-700 text-sm mt-1">
            Please connect your wallet using the "Connect Wallet" button in the top navigation to store memories.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Write Memory</h2>
      <p className="text-gray-600 mb-4">
        Store a memory in the decentralized memory layer. It will be stored on IPFS and referenced on the blockchain.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="memory" className="block text-sm font-medium text-gray-700 mb-2">
            Memory Content
          </label>
          <textarea
            id="memory"
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Enter your memory here... (e.g., learned about React hooks, completed project milestone, etc.)"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Characters: {memory.length} | Agent: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !memory.trim()}
          className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Storing Memory...
            </div>
          ) : (
            'Store Memory'
          )}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm font-medium ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </p>
        </div>
      )}
    </div>
  )
}