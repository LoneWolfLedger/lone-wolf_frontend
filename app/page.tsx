import React, { useState } from 'react';
import Web3Paywall from './components/Web3Paywall';
import AlphaMatrix from './components/AlphaMatrix';

export default function App() {
  // This state controls the Web3 Paywall. False = Locked. True = Unlocked.
  const [isUnlocked, setIsUnlocked] = useState(false);

  // If NOT unlocked, show the Web3 Wallet Signature screen
  if (!isUnlocked) {
    return <Web3Paywall onUnlock={() => setIsUnlocked(true)} />;
  }

  // If UNLOCKED, show the Main Institutional Dashboard
  return (
    <div className="min-h-screen bg-[#0b0e14] text-white p-6 font-sans">
      
      {/* TOP NAVBAR */}
      <header className="flex justify-between items-center mb-8 border-b border-[#2b3139] pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-yellow-500">LONEWOLF</span> MATRIX
        </h1>
        <div className="bg-[#181a20] border border-green-900 text-green-500 px-4 py-2 rounded font-mono text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          VIP ACCESS VERIFIED
        </div>
      </header>

      {/* MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT & CENTER: CHARTS AND PREDICTIONS (Takes up 2/3 of screen) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PASTE YOUR EXISTING TRADINGVIEW CHART COMPONENT HERE */}
          <div className="bg-[#181a20] border border-[#2b3139] rounded-lg p-6 h-[400px] flex items-center justify-center text-gray-500">
            [ YOUR LIVE TRADINGVIEW CHART GOES HERE ]
          </div>

          {/* THE NEW T+24h ALPHA MATRIX TABLE */}
          <AlphaMatrix />
          
          {/* PASTE YOUR EXISTING LITERATURE MAPPING COMPONENT HERE */}
          <div className="bg-[#181a20] border border-[#2b3139] rounded-lg p-6">
            [ YOUR ACADEMIC LITERATURE MAPPING GOES HERE ]
          </div>

        </div>

        {/* RIGHT SIDEBAR: VIP QUANT CHATBOT (Takes up 1/3 of screen) */}
        <div className="bg-[#181a20] border border-[#2b3139] rounded-lg p-6 h-[800px] flex flex-col">
          <h2 className="text-xl font-bold mb-4 border-b border-[#2b3139] pb-2">VIP Quant Support</h2>
          <div className="flex-grow flex items-center justify-center text-gray-500 text-sm">
            [ YOUR AI CHATBOT COMPONENT GOES HERE ]
          </div>
        </div>

      </div>
    </div>
  );
}