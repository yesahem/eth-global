import { NavbarWalletConnection } from '@/components/NavbarWalletConnection'
import { WriteMemory } from '@/components/WriteMemory'
import { ReadMemory } from '@/components/ReadMemory'

export default function Home() {
  return (
    <div className="min-h-screen gradient-paper">
      {/* Ornate Header */}
      <header className="vintage-card shadow-ornate border-b-4" style={{ borderBottomColor: 'var(--gold-400)', borderRadius: 0 }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
            <div className="stagger-delay-1" style={{ animation: 'vintage-fade 0.8s ease-out' }}>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold leading-tight" style={{ color: 'var(--primary)' }}>
                Decentralized Memory Layer
              </h1>
              <p className="text-sm sm:text-base md:text-lg font-sans mt-1 sm:mt-2" style={{ color: 'var(--mahogany-600)' }}>
                AI Agent Memory using 0G Stack + 0G Testnet
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 lg:gap-6 stagger-delay-2 w-full lg:w-auto" style={{ animation: 'vintage-fade 0.8s ease-out' }}>
              <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium font-sans shadow-elegant" 
                    style={{ background: 'var(--gradient-gold)', color: 'var(--burgundy-800)' }}>
                ✨ 0G Testnet
              </span>
              <NavbarWalletConnection />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
          {/* Write Memory */}
          <div className="stagger-delay-3" style={{ animation: 'vintage-fade 0.8s ease-out' }}>
            <WriteMemory />
          </div>
          
          {/* Read Memory */}
          <div className="stagger-delay-4" style={{ animation: 'vintage-fade 0.8s ease-out' }}>
            <ReadMemory />
          </div>
        </div>

        {/* Ornate How It Works Section */}
        <div className="mt-8 sm:mt-12 md:mt-14 lg:mt-16 vintage-card shadow-ornate p-4 sm:p-6 md:p-8">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12" style={{ color: 'var(--primary)' }}>
            How It Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="vintage-step-card stagger-delay-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="ornate-step">1</div>
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-serif font-semibold mb-2 sm:mb-3" style={{ color: 'var(--mahogany-700)' }}>
                  Connect Wallet
                </h4>
                <p className="font-sans text-sm sm:text-base leading-relaxed" style={{ color: 'var(--vintage-neutral-600)' }}>
                  Connect your MetaMask wallet with at least 1.5 ETH to interact with the memory layer.
                </p>
              </div>
            </div>
            <div className="vintage-step-card stagger-delay-2">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="ornate-step">2</div>
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-serif font-semibold mb-2 sm:mb-3" style={{ color: 'var(--mahogany-700)' }}>
                  Store Memories
                </h4>
                <p className="font-sans text-sm sm:text-base leading-relaxed" style={{ color: 'var(--vintage-neutral-600)' }}>
                  Write memories that get stored on IPFS and referenced on the Ethereum blockchain.
                </p>
              </div>
            </div>
            <div className="vintage-step-card stagger-delay-3">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="ornate-step">3</div>
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-serif font-semibold mb-2 sm:mb-3" style={{ color: 'var(--mahogany-700)' }}>
                  Query Memories
                </h4>
                <p className="font-sans text-sm sm:text-base leading-relaxed" style={{ color: 'var(--vintage-neutral-600)' }}>
                  Read stored memories from any agent address (requires 1.5+ ETH balance for access control).
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}