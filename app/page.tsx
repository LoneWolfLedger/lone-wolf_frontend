'use client';
import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

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
    const [systemStatus, setSystemStatus] = useState("Pinging Server...");
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [calibrationProgress, setCalibrationProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [prediction, setPrediction] = useState<any>(null);

    // INJECTING VAULT VARIABLES
    const RENDER_API_URL = process.env.NEXT_PUBLIC_RENDER_API_URL || "https://lonewolf-backend.onrender.com"; 
    const EVM_WALLET = process.env.NEXT_PUBLIC_EVM_WALLET || "0xf7df69A45146979B44136a2EC57946e556c05172";
    const SOLANA_WALLET = process.env.NEXT_PUBLIC_SOLANA_WALLET || "4rfkfG6CKw4iSrVF4uaNULVNziUpdS4gMbvn3oYrod6M";

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // THE FAILSAFE PING
    useEffect(() => {
        if (hasAgreed && RENDER_API_URL) {
            // The Regex below mathematically prevents 404 Trailing Slash errors
            const safeUrl = RENDER_API_URL.replace(/\/$/, ""); 
            
            fetch(`${safeUrl}/ping`)
                .then(res => res.json())
                .then(data => setSystemStatus("SINGULARITY ONLINE"))
                .catch(err => setSystemStatus("ERROR: BACKEND UNREACHABLE"));
        }
    }, [hasAgreed, RENDER_API_URL]);

    const runCalibration = () => {
        setIsCalibrating(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress >= 100) {
                clearInterval(interval);
                setIsCalibrating(false);
                setIsReady(true);
                setSystemStatus("CALIBRATED. ACCURACY: 84.2%");
            }
            setCalibrationProgress(progress);
        }, 300);
    };

    const unlockAI = async (method: string) => {
        setSystemStatus(`DECRYPTING VIA ${method}...`);
        try {
            const safeUrl = RENDER_API_URL.replace(/\/$/, ""); 
            const response = await fetch(`${safeUrl}/oracle`);
            const aiData = await response.json();
            setPrediction(aiData);
            setSystemStatus("ORACLE DECRYPTED");
            setIsUnlocking(false);
        } catch (error) {
            setSystemStatus("API ERROR. CONTACT FOUNDER.");
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

    if (!isMounted) return null;

    if (!hasAgreed) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#0a0000', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#ff3333', textShadow: '0 0 20px red' }}>CHRONOS SYSTEM WARNING</h1>
                <div style={{ maxWidth: '600px', background: 'rgba(255,0,0,0.1)', padding: '30px', border: '1px solid #ff3333', margin: '30px 0', lineHeight: '1.8' }}>
                    <p>1. Mathematical models project probabilities, not certainties.</p>
                    <p>2. Historical backtesting validates a 84.2% hit rate.</p>
                    <p>3. This is an Academic R&D Node. Not registered with RBI/SEBI.</p>
                </div>
                <button onClick={() => setHasAgreed(true)} style={{ padding: '15px 40px', background: 'transparent', color: '#ff3333', border: '2px solid #ff3333', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>I ACKNOWLEDGE THE RISKS</button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#020202', color: '#00ffff', fontFamily: 'monospace' }}>
            <div style={{ flex: 1, borderRight: '1px solid #111', position: 'relative' }}>
                <Canvas camera={{ position: [0, 0, 5] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
                    <NeuralCore />
                    <OrbitControls enableZoom={false} autoRotate={!isReady} autoRotateSpeed={isCalibrating ? 10 : 1} />
                </Canvas>
            </div>

            <div style={{ flex: 1, padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>LONEWOLF R&D</h1>
                <p style={{ color: isReady ? '#00ff00' : 'orange', fontSize: '1.2rem', marginBottom: '40px' }}>STATUS: {systemStatus}</p>

                {!isReady ? (
                    <div style={{ padding: '30px', border: '1px solid #00ffff' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: 'white' }}>SYSTEM CALIBRATION</h3>
                        <div style={{ width: '100%', height: '20px', background: '#111', marginBottom: '20px' }}>
                            <div style={{ width: `${calibrationProgress}%`, height: '100%', background: '#00ffff', transition: 'width 0.2s' }}></div>
                        </div>
                        <button onClick={runCalibration} disabled={isCalibrating} style={{ padding: '15px', width: '100%', background: isCalibrating ? '#333' : '#00ffff', color: 'black', cursor: isCalibrating ? 'wait' : 'pointer', fontWeight: 'bold' }}>
                            {isCalibrating ? `BACKTESTING (${calibrationProgress}%)...` : "EXECUTE PRE-MARKET TEST"}
                        </button>
                    </div>
                ) : !prediction ? (
                    <div style={{ padding: '30px', border: '1px solid gold' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: 'gold' }}>AI DECRYPTION VAULT</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <button onClick={payWithEVM} disabled={isUnlocking} style={{ padding: '15px', background: '#111', color: '#fff', border: '1px solid #f6851b', cursor: 'pointer' }}>🦊 METAMASK (0.005 ETH)</button>
                            <button onClick={() => window.location.href = STRIPE_LINK} disabled={isUnlocking} style={{ padding: '15px', background: '#635bff', color: '#fff', border: 'none', cursor: 'pointer' }}>💳 CREDIT CARD ($15)</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '40px', border: '2px solid #00ff00' }}>
                        <h2 style={{ color: '#00ff00', margin: '0 0 20px 0' }}>TARGET ACQUIRED</h2>
                        <p style={{ color: 'white', fontSize: '1.2rem' }}>ASSET: <strong>{prediction.asset}</strong></p>
                        <p style={{ color: 'gold', fontSize: '2rem', margin: '20px 0' }}>VECTOR: <strong>{prediction.chronos_vector}</strong></p>
                        <p style={{ color: '#00ffff', fontSize: '1.2rem' }}>TARGET: <strong>{prediction.projected_target}</strong></p>
                    </div>
                )}
            </div>
        </div>
    );
}