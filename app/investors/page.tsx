import React from 'react';
import { Briefcase, Shield, Lock, FileText, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function InvestorPortal() {
  return (
    <div className="min-h-screen bg-[#0b0e14] text-white p-6 md:p-12 font-sans selection:bg-yellow-500 selection:text-black">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-12 border-b border-[#2b3139] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="text-yellow-500 w-8 h-8" />
            LONEWOLF <span className="text-gray-500 font-light">SYNDICATE</span>
          </h1>
          <p className="text-gray-400 mt-2 font-mono text-sm">INSTITUTIONAL LIQUIDITY & GOVERNANCE PORTAL</p>
        </div>
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors border border-[#2b3139] px-4 py-2 rounded">
          <ArrowLeft size={16} /> Back to Matrix
        </Link>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        
        {/* LEFT COLUMN: THE PITCH & DOCUMENTS */}
        <div className="space-y-8">
          <div className="bg-[#181a20] border border-[#2b3139] rounded-lg p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-500">
              <Briefcase size={20} /> The Architecture of Alpha
            </h2>
            <p className="text-gray-300 leading-relaxed text-sm mb-4">
              LoneWolf is currently operating as a high-margin Web3 Micro-SaaS, providing decentralized predictive computational models (MIT KANs, Mamba State-Spaces) via cryptographic paywalls.
            </p>
            <p className="text-gray-400 leading-relaxed text-sm mb-6">
              Incoming liquidity is classified as Pre-Seed SAFE (Simple Agreement for Future Equity). Upon reaching Series A thresholds, full migration to a registered Quant Hedge Fund entity in <span className="text-white font-bold">GIFT City, India</span> will initiate, providing investors with institutional banking integration and a 10-year tax holiday.
            </p>
            
            <div className="flex gap-4">
              <a href="/syndicate.pdf" target="_blank" className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded text-center flex items-center justify-center gap-2 transition-all">
                <FileText size={18} /> Read Pitch Deck
              </a>
              <a href="/syndicate.pdf.ots" download className="flex-1 border border-[#2b3139] hover:border-blue-500 text-gray-300 hover:text-blue-400 py-3 px-4 rounded text-center flex items-center justify-center gap-2 transition-all" title="Bitcoin Proof of IP">
                <Lock size={18} /> Verify IP (.ots)
              </a>
            </div>
          </div>

          {/* SECURE COMMS */}
          <div className="bg-[#181a20] border border-[#2b3139] rounded-lg p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <Lock size={20} className="text-green-500" /> End-to-End Encrypted Comms
            </h2>
            <div className="space-y-4 font-mono text-sm">
              <div className="bg-[#0b0e14] p-4 rounded border border-[#2b3139]">
                <span className="text-gray-500 block mb-1">Matrix (Element) Protocol:</span>
                <span className="text-yellow-500 select-all cursor-pointer">@77krsna:matrix.org</span>
              </div>
              <div className="bg-[#0b0e14] p-4 rounded border border-[#2b3139]">
                <span className="text-gray-500 block mb-1">Session ID (Anonymous Routing):</span>
                <span className="text-green-500 select-all cursor-pointer break-all">05bd... [05b75ddc9041ae15e6f9a7af0800fdd8481a6cf612f1811a4e31c34cea0093ab05]</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WEB3 TREASURY */}
        <div className="bg-[#181a20] border border-[#2b3139] rounded-lg p-8 h-full flex flex-col">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
            <Send size={20} className="text-blue-500" /> Web3 Treasury Vaults
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Directly fund the R&D treasury via non-custodial smart contracts. All transfers are cryptographically logged as SAFE pre-seed allocations. Accepted: USDC, USDT, ETH, SOL.
          </p>

          <div className="space-y-6 flex-grow">
            {/* ETHEREUM / EVM */}
            <div className="border border-[#2b3139] rounded p-5 hover:border-blue-500/50 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-bold">EVM Network (MetaMask)</span>
                <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">ERC-20</span>
              </div>
              <p className="text-gray-400 text-xs mb-2">For Ethereum, Arbitrum, or Base deposits.</p>
              <div className="bg-[#0b0e14] p-3 rounded font-mono text-sm text-gray-300 select-all cursor-pointer break-all border border-[#2b3139]">
                0x... [0xf7df69A45146979B44136a2EC57946e556c05172]
              </div>
            </div>

            {/* SOLANA */}
            <div className="border border-[#2b3139] rounded p-5 hover:border-purple-500/50 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-bold">Solana Network (Phantom)</span>
                <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded">SPL</span>
              </div>
              <p className="text-gray-400 text-xs mb-2">For ultra-low latency USDC/USDT deposits.</p>
              <div className="bg-[#0b0e14] p-3 rounded font-mono text-sm text-gray-300 select-all cursor-pointer break-all border border-[#2b3139]">
                ... [4rfkfG6CKw4iSrVF4uaNULVNziUpdS4gMbvn3oYrod6M]
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-gray-600 border-t border-[#2b3139] pt-6">
            By transferring funds to these vaults, you acknowledge the high-risk nature of cryptographic R&D and algorithmic development. This is not a solicitation for retail investment. 
          </div>
        </div>

      </div>
    </div>
  );
}