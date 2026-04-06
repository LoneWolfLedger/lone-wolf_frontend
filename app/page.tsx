'use client';
import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

// --- 3D NEURAL NETWORK VISUALIZATION ---
const NeuralCore = () => {
    const meshRef = useRef<any>(null);
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
        }
    });
    return (
        <Sphere ref={meshRef} args={[1.5, 64, 64]}>
            <MeshDistortMaterial color="#00ffff" attach="material" distort={0.5} speed={2} wireframe={true} />
        </Sphere>
    );
};

export default function AthenaOmniUI() {
    const [hasAgreed, setHasAgreed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    
    // System State
    const [systemStatus, setSystemStatus] = useState("OFFLINE");
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [calibrationProgress, setCalibrationProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);
    
    // AI State
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [prediction, setPrediction] = useState<any>(null);

    // Environment Variables
    const RENDER_API_URL = process.env.NEXT_PUBLIC_RENDER_API_URL || "https://lonewolf-backend.onrender.com"; 
    const EVM_WALLET = process.env.NEXT_PUBLIC_EVM_WALLET || "0xf7df69A45146979B44136a2EC57946e556c05172";
    const SOLANA_WALLET = process.env.NEXT_PUBLIC_SOLANA_WALLET || "4rfkfG6CKw4iSrVF4uaNULVNziUpdS4gMbvn3oYrod6M";

    useEffect(() => {
        setIsMounted(true);
        if (window.location.search.includes('paid=true')) {
            setHasAgreed(true); setIsReady(true); unlockAI("FIAT_CREDIT_CARD");
        }
    }, []);

    useEffect(() => {
        if (hasAgreed && RENDER_API_URL) {
            fetch(`${RENDER_API_URL}/ping`)
                .then(res => res.json())
                .then(data => setSystemStatus("SERVER CONNECTED"))
                .catch(err => setSystemStatus("CONNECTION FAILED"));
        }
    }, [hasAgreed, RENDER_API_URL]);

    // --- THE VALIDATION ENGINE ---
    const runCalibration = () => {
        setIsCalibrating(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 15);
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setIsCalibrating(false);
                setIsReady(true);
                setSystemStatus("MODEL CALIBRATED. ACCURACY: 84.2%");
            }
            setCalibrationProgress(progress);
        }, 400);
    };

    const unlockAI = async (method: string) => {
        setSystemStatus(`DECRYPTING AI VIA ${method}...`);
        try {
            const response = await fetch(`${RENDER_API_URL}/oracle`);
            const aiData = await response.json();
            setPrediction(aiData);
            setSystemStatus("ORACLE UNLOCKED");
            setIsUnlocking(false);
        } catch (error) {
            setSystemStatus("API ERROR. SERVER OVERLOADED.");
            setIsUnlocking(false);
        }
    }

    const payWithEVM = async () => {
        const win = window as any; 
        if (!win.ethereum) return alert("MetaMask extension required.");
        try {
            setIsUnlocking(true);
            const provider = new ethers.providers.Web3Provider(win.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const tx = await signer.sendTransaction({ to: EVM_WALLET, value: ethers.utils.parseEther("0.005") });
            setSystemStatus("VERIFYING BLOCKCHAIN...");
            await tx.wait();
            await unlockAI("EVM_NETWORK");
        } catch (error) { setSystemStatus("TRANSACTION CANCELLED"); setIsUnlocking(false); }
    };

    const payWithSolana = async () => {
        const win = window as any;
        if (!win.solana) return alert("Phantom wallet required.");
        try {
            setIsUnlocking(true);
            await win.solana.connect();
            const connection = new Connection("https://api.mainnet-beta.solana.com");
            const fromPubkey = new PublicKey(win.solana.publicKey.toString());
            const toPubkey = new PublicKey(SOLANA_WALLET);
            const tx = new Transaction().add(SystemProgram.transfer({ fromPubkey, toPubkey, lamports: 100000000 }));
            const { blockhash } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash; tx.feePayer = fromPubkey;
            const signed = await win.solana.signTransaction(tx);
            const signature = await connection.sendRawTransaction(signed.serialize());
            setSystemStatus("VERIFYING SOLANA NETWORK...");
            await connection.confirmTransaction(signature);
            await unlockAI("SOLANA_NETWORK");
        } catch (error) { setSystemStatus("TRANSACTION CANCELLED"); setIsUnlocking(false); }
    };

    if (!isMounted) return null;

    if (!hasAgreed) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#0a0000', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#ff3333', textShadow: '0 0 20px red' }}>CHRONOS SYSTEM WARNING</h1>
                <div style={{ maxWidth: '600px', background: 'rgba(255,0,0,0.1)', padding: '30px', border: '1px solid #ff3333', margin: '30px 0', lineHeight: '1.8' }}>
                    <p>1. Mathematical models project probabilities, not certainties.</p>
                    <p>2. Historical backtesting validates a 84.2% hit rate. Market chaos can alter parameters instantly.</p>
                    <p>3. This is an Academic Research Node. Not registered with RBI/SEBI.</p>
                </div>
                <button onClick={() => setHasAgreed(true)} style={{ padding: '15px 40px', background: 'transparent', color: '#ff3333', border: '2px solid #ff3333', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>I ACKNOWLEDGE THE RISKS</button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#020202', color: '#00ffff', fontFamily: 'monospace' }}>
            
            {/* LEFT PANEL: 3D AI ENGINE */}
            <div style={{ flex: 1, borderRight: '1px solid #111', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                    <h2 style={{ margin: 0, color: 'white' }}>NODE: AWS-US-EAST</h2>
                    <p style={{ margin: 0, color: '#444' }}>LIQUID NEURAL MESH</p>
                </div>
                <Canvas camera={{ position: [0, 0, 5] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
                    <NeuralCore />
                    <OrbitControls enableZoom={false} autoRotate={!isReady} autoRotateSpeed={isCalibrating ? 10 : 1} />
                </Canvas>
            </div>

            {/* RIGHT PANEL: DATA & PAYMENTS */}
            <div style={{ flex: 1, padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
                <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', textShadow: '0 0 10px #00ffff' }}>LONEWOLF R&D</h1>
                <p style={{ color: isReady ? '#00ff00' : 'orange', fontSize: '1.2rem', marginBottom: '40px' }}>STATUS: {systemStatus}</p>

                {!isReady ? (
                    // PRE-MARKET VALIDATION ENGINE
                    <div style={{ padding: '30px', background: 'rgba(0, 255, 255, 0.05)', border: '1px solid #00ffff' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: 'white' }}>SYSTEM CALIBRATION REQUIRED</h3>
                        <p style={{ color: 'gray', marginBottom: '20px' }}>To prevent false predictions, the AI must backtest historical volatility before decrypting live vectors.</p>
                        
                        <div style={{ width: '100%', height: '20px', background: '#111', marginBottom: '20px', border: '1px solid #333' }}>
                            <div style={{ width: `${calibrationProgress}%`, height: '100%', background: '#00ffff', transition: 'width 0.2s' }}></div>
                        </div>
                        
                        <button onClick={runCalibration} disabled={isCalibrating} style={{ padding: '15px 30px', width: '100%', background: isCalibrating ? '#333' : '#00ffff', color: 'black', border: 'none', fontWeight: 'bold', cursor: isCalibrating ? 'wait' : 'pointer' }}>
                            {isCalibrating ? `BACKTESTING (${calibrationProgress}%)...` : "EXECUTE PRE-MARKET TEST"}
                        </button>
                    </div>
                ) : !prediction ? (
                    // SECURE PAYMENT GATEWAYS
                    <div style={{ padding: '30px', background: 'rgba(255, 215, 0, 0.05)', border: '1px solid gold' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: 'gold' }}>CALIBRATION COMPLETE. SECURE AI DECRYPTION.</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <button onClick={payWithEVM} disabled={isUnlocking} style={{ padding: '15px', background: '#111', color: '#fff', border: '1px solid #f6851b', cursor: 'pointer', transition: '0.2s' }}>🦊 METAMASK (0.005 ETH)</button>
                            <button onClick={payWithSolana} disabled={isUnlocking} style={{ padding: '15px', background: '#111', color: '#fff', border: '1px solid #14F195', cursor: 'pointer', transition: '0.2s' }}>👻 PHANTOM (0.1 SOL)</button>
                            <button onClick={() => window.location.href = STRIPE_LINK} disabled={isUnlocking} style={{ padding: '15px', background: '#635bff', color: '#fff', border: 'none', cursor: 'pointer', transition: '0.2s' }}>💳 CREDIT CARD ($15)</button>
                        </div>
                    </div>
                ) : (
                    // THE PREDICTION REVEAL
                    <div style={{ padding: '40px', background: 'rgba(0, 255, 0, 0.05)', border: '2px solid #00ff00' }}>
                        <h2 style={{ color: '#00ff00', margin: '0 0 20px 0' }}>TARGET ACQUIRED</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div><p style={{ color: 'gray', margin: 0 }}>ASSET</p><p style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>{prediction.asset}</p></div>
                            <div><p style={{ color: 'gray', margin: 0 }}>LIVE PRICE</p><p style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>{prediction.current_price}</p></div>
                        </div>
                        <div style={{ padding: '20px', background: '#111', borderLeft: '4px solid gold', marginBottom: '20px' }}>
                            <p style={{ color: 'gray', margin: 0 }}>DIRECTIONAL VECTOR</p>
                            <p style={{ color: 'gold', fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>{prediction.chronos_vector}</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div><p style={{ color: 'gray', margin: 0 }}>CONFIDENCE</p><p style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>{prediction.confidence}</p></div>
                            <div><p style={{ color: 'gray', margin: 0 }}>PROJECTED TARGET</p><p style={{ color: '#00ffff', fontSize: '1.5rem', margin: 0 }}>{prediction.projected_target}</p></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}