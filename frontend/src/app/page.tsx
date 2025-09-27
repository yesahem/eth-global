import { NavbarWalletConnection } from '@/components/NavbarWalletConnection'
import { WriteMemory } from '@/components/WriteMemory'
import { ReadMemory } from '@/components/ReadMemory'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Decentralized Memory Layer
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                AI Agent Memory using 0G Stack + 0G Testnet
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                0G Testnet
              </span>
              <NavbarWalletConnection />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Write Memory */}
          <div>
            <WriteMemory />
          </div>
          
          {/* Read Memory */}
          <div>
            <ReadMemory />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Connect Wallet</h4>
                <p>Connect your MetaMask wallet with at least 1.5 ETH to interact with the memory layer.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Store Memories</h4>
                <p>Write memories that get stored on IPFS and referenced on the Ethereum blockchain.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Query Memories</h4>
                <p>Read stored memories from any agent address (requires 1.5+ ETH balance for access control).</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}