"use client";
import React, { useState } from 'react';
import { Shield, Zap } from 'lucide-react';

export default function Web3Paywall({ onUnlock }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnectAndPay = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Check if a Web3 Wallet (MetaMask/Phantom) is installed
      if (!window.ethereum) {
        throw new Error("No Web3 provider detected. Please install MetaMask.");
      }
      
      // 2. Request Wallet Connection
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];

      // 3. Request Cryptographic Signature (Zero Gas Cost)
      const message = `LONEWOLF INSTITUTIONAL GATEWAY\n\nI am authorizing access to the Quant Matrix.\nWallet: ${walletAddress}\nCost: 100 USDC / Month (Simulated for Beta)`;
      
      await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      // 4. Unlock the Matrix upon successful signature
      onUnlock();
    } catch (err) {
      setError(err.message || "User denied signature.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0b0e14] flex items-center justify-center z-50">
      <div className="bg-[#181a20] border border-[#2b3139] p-8 rounded-lg max-w-md w-full shadow-2xl">
        <div className="flex justify-center mb-6">
          <Shield className="text-yellow-500 w-12 h-12" />
        </div>
        <h2 className="text-white text-2xl font-bold text-center mb-2">Institutional Access</h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          The predictive matrix is gated. Connect your Web3 wallet and authorize the USDC subscription protocol to access T+24h Alpha.
        </p>
        
        <div className="bg-[#2b3139] rounded-md p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Current Tier:</span>
            <span className="text-red-500 font-semibold">RESTRICTED</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Subscription Fee:</span>
            <span className="text-white font-mono">100 USDC / Month</span>
          </div>
        </div>

        {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}

        <button 
          onClick={handleConnectAndPay}
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Verifying On-Chain..." : <><Zap size={18} /> Connect Wallet & Unlock</>}
        </button>
      </div>
    </div>
  );
}