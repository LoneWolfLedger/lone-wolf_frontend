'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function AthenaOmniUI() {
    const [hasAgreed, setHasAgreed] = useState(false);
    const [status, setStatus] = useState("Pinging Singularity...");
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [aiData, setAiData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Replace this with your actual Render URL
    const RENDER_API_URL = "https://lonewolf-backend.onrender.com"; 

    useEffect(() => {
        if (hasAgreed) {
            fetch(`${RENDER_API_URL}/`)
                .then(res => res.json())
                .then(data => setStatus(data.status))
                .catch(err => setStatus("SYSTEM OFFLINE"));
        }
    }, [hasAgreed]);

    const handlePayment = async () => {
        const win = window as any; 
        if (!win.ethereum) {
            alert("A Web3 Wallet (Phantom, Trust Wallet, MetaMask) is required.");
            return;
        }
        try {
            setLoading(true);
            const provider = new ethers.providers.Web3Provider(win.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const tx = await signer.sendTransaction({
                // !!! REPLACE WITH YOUR 0x WALLET ADDRESS !!!
                to: "0xf7df69A45146979B44136a2EC57946e556c05172", 
                value: ethers.utils.parseEther("0.005") 
            });
            
            setStatus("VERIFYING ON BLOCKCHAIN...");
            const receipt = await tx.wait(); // Waits for blockchain confirmation
            
            // 1. Send proof to Render Backend
            await fetch(`${RENDER_API_URL}/verify_transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tx_hash: receipt.transactionHash })
            });

            // 2. Fetch the AI Prediction
            const aiResponse = await fetch(`${RENDER_API_URL}/chronos_oracle`);
            const oracleData = await aiResponse.json();
            
            setAiData(oracleData);
            setIsUnlocked(true);
            setLoading(false);

        } catch (error) {
            console.error("Payment failed", error);
            alert("Transaction Rejected.");
            setLoading(false);
            setStatus("SINGULARITY ONLINE");
        }
    };

    // UI: THE LEGAL FIREWALL
    if (!hasAgreed) {
        return (
            <div style={{ width: '100vw', minHeight: '100vh', background: 'darkred', color: 'white', padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontFamily: 'monospace' }}>
                <h1 style={{ fontSize: '3rem', borderBottom: '2px solid white', paddingBottom: '10px' }}>RESTRICTED R&D TESTNET</h1>
                <div style={{ maxWidth: '800px', textAlign: 'left', background: 'rgba(0,0,0,0.6)', padding: '30px', marginTop: '30px', borderRadius: '10px' }}>
                    <p><strong>1. JURISDICTIONAL NOTICE:</strong> This is an Academic R&D Testnet. NOT regulated by RBI/SEBI.</p>
                    <p><strong>2. CHRONOS AI DISCLAIMER:</strong> Predictions do NOT constitute financial advice. Proceed at your own risk.</p>
                </div>
                <button onClick={() => setHasAgreed(true)} style={{ padding: '20px 50px', background: 'black', color: 'red', border: '3px solid red', cursor: 'pointer', marginTop: '40px', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    I AGREE. ENTER SYSTEM.
                </button>
            </div>
        );
    }

    // UI: THE UNLOCKED AI DASHBOARD (Shows after payment)
    if (isUnlocked && aiData) {
        return (
            <div style={{ width: '100vw', minHeight: '100vh', background: '#050505', color: '#00ff00', padding: '50px', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ fontSize: '3rem', color: '#00ff00', textShadow: '0 0 10px #00ff00' }}>CHRONOS ORACLE UNLOCKED</h1>
                <p style={{ color: 'gray', marginBottom: '40px' }}>Transaction Verified. Ledger Secured.</p>
                
                <div style={{ border: '1px solid #00ff00', padding: '40px', background: 'rgba(0, 255, 0, 0.05)', width: '100%', maxWidth: '800px', borderRadius: '5px' }}>
                    <h2 style={{ color: 'white', borderBottom: '1px solid #333', paddingBottom: '10px' }}>MARKET VECTOR ANALYSIS</h2>
                    <p style={{ fontSize: '1.2rem', marginTop: '20px' }}>TARGET ASSET: <strong style={{ color: 'cyan' }}>{aiData.target_asset}</strong></p>
                    <p style={{ fontSize: '1.2rem' }}>CHRONOS VECTOR: <strong style={{ color: aiData.chronos_vector.includes("BULL") ? '#00ff00' : 'red' }}>{aiData.chronos_vector}</strong></p>
                    <p style={{ fontSize: '1.2rem' }}>CHAOS VOLATILITY INDEX: <strong style={{ color: 'yellow' }}>{aiData.chaos_volatility_index}</strong></p>
                    <p style={{ fontSize: '1.2rem' }}>CONFIDENCE LEVEL: <strong style={{ color: 'white' }}>{aiData.accuracy_confidence}</strong></p>
                    
                    <div style={{ marginTop: '40px', padding: '20px', background: '#111', borderLeft: '5px solid cyan' }}>
                        <p style={{ margin: 0, color: 'cyan' }}>SYSTEM MESSAGE: {aiData.message}</p>
                    </div>
                </div>
            </div>
        );
    }

    // UI: THE PAYMENT GATEWAY (Shows before payment)
    return (
        <div style={{ width: '100vw', minHeight: '100vh', background: 'black', color: 'cyan', padding: '50px', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '4rem', margin: '0', textShadow: '0 0 20px cyan' }}>LONEWOLF: OMNI UI</h1>
            <h2 style={{ fontSize: '1.5rem', color: 'white', marginTop: '20px' }}>
                BACKEND STATUS: <span style={{ color: status.includes("OFFLINE") ? 'red' : '#00ff00' }}>{status}</span>
            </h2>
            
            <div style={{ marginTop: '50px', padding: '40px', border: '1px solid cyan', background: 'rgba(0, 255, 255, 0.05)', textAlign: 'center', maxWidth: '600px', borderRadius: '10px' }}>
                <h3 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '20px' }}>CHRONOS EQUITIES AI</h3>
                <p style={{ color: 'gray', marginBottom: '40px', fontSize: '1.1rem' }}>The Neural Network is locked. Pay the compute fee to decrypt the market mapping.</p>
                
                <button 
                    onClick={handlePayment} 
                    disabled={loading}
                    style={{ padding: '20px 40px', background: loading ? 'gray' : 'linear-gradient(90deg, #d4af37, #ffdf00)', color: 'black', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1.2rem', fontWeight: '900', borderRadius: '5px' }}>
                    {loading ? "PROCESSING ON LEDGER..." : "PAY 0.005 ETH TO UNLOCK AI"}
                </button>
            </div>
        </div>
    );
}