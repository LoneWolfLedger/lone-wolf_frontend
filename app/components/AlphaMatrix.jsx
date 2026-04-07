"use client";
import React from 'react';
import { Activity, BookOpen } from 'lucide-react';

const matrixData = [
  { asset: "BTC/USDT", bias: "BULLISH", probability: "78.4%", target: "$66,200", model: "Navier-Stokes Fluid Flow" },
  { asset: "ETH/USDT", bias: "BEARISH", probability: "61.2%", target: "$3,150", model: "Black-Scholes Delta Swap" },
  { asset: "SOL/USDT", bias: "NEUTRAL", probability: "52.0%", target: "$142.00", model: "Monte Carlo Stochastic" },
];

export default function AlphaMatrix() {
  return (
    <div className="bg-[#181a20] border border-[#2b3139] rounded-lg p-6 w-full mt-6">
      <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
        <Activity className="text-yellow-500" /> T+24h Predictive Alpha Matrix
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-400 text-xs uppercase border-b border-[#2b3139]">
              <th className="pb-3 font-medium">Asset Pair</th>
              <th className="pb-3 font-medium">Directional Bias</th>
              <th className="pb-3 font-medium">T+24h Probability</th>
              <th className="pb-3 font-medium">Volatility Target</th>
              <th className="pb-3 font-medium">Math Provenance</th>
            </tr>
          </thead>
          <tbody>
            {matrixData.map((row, index) => (
              <tr key={index} className="border-b border-[#2b3139] hover:bg-[#2b3139] transition-colors cursor-pointer group">
                <td className="py-4 text-white font-mono font-bold">{row.asset}</td>
                <td className={`py-4 font-bold ${row.bias === 'BULLISH' ? 'text-green-500' : row.bias === 'BEARISH' ? 'text-red-500' : 'text-gray-400'}`}>
                  {row.bias}
                </td>
                <td className="py-4 text-white font-mono">{row.probability}</td>
                <td className="py-4 text-yellow-500 font-mono">{row.target}</td>
                <td className="py-4 text-gray-400 text-sm flex items-center gap-2">
                  <BookOpen size={14} className="text-blue-400 group-hover:text-blue-300" />
                  {row.model}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}