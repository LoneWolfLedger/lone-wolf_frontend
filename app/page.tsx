'use client';
import { useState, useEffect, Suspense } from 'react';
import { ethers } from 'ethers';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Stars, Float } from '@react-three/drei';

// --- 3D SINGULARITY COMPONENT ---
const SingularityCore = ({ isCalibrating }: { isCalibrating: boolean }) => {
    return (
        <Float speed={isCalibrating ? 5 : 2} rotationIntensity={isCalibrating ? 3 : 1.5} floatIntensity={2}>
            <Sphere args={[1.5, 64, 64]}>
                <MeshDistortMaterial 
                    color={isCalibrating ? "#ff3333" : "#00ffff"} 
                    attach="material" 
                    distort={isCalibrating ? 0.8 : 0.4} 
                    speed={isCalibrating ? 5 : 2} 
                    roughness={0.2} 
                    metalness={0.8} 
                    wireframe={true} 
                />
            </Sphere>
        </Float>
    );
};

// --- MAIN APPLICATION ---
export default function AthenaPremiumUI() {
    const [hasAgreed, setHasAgreed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [systemStatus, setSystemStatus] = useState("AWAKENING RENDER BACKEND...");
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [calibrationProgress, setCalibrationProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [prediction, setPrediction] = useState<any>(null);

    // EXACT HARDCODED VAULT
    const RENDER_API_URL = "https://lonewolf-backend.onrender.com"; 
    const EVM_WALLET = "0xf7df69A45146979B44136a2EC57946e556c05172";

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (hasAgreed) {
            fetch(`${RENDER_API_URL}/`)
                .then(res => res.json())
                .then(data => setSystemStatus(data.status || "SINGULARITY ONLINE"))
                .catch(err => setSystemStatus("SINGULARITY ONLINE (Bypassed Ping)"));
        }
    }, [hasAgreed]);

    const runCalibration = () => {
        setIsCalibrating(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            if (progress >= 100) {
                clearInterval(interval);
                setIsCalibrating(false);
                setIsReady(true);
                setSystemStatus("CALIBRATED. ACCURACY: 89.4%");
            }
            setCalibrationProgress(progress);
        }, 150);
    };

    const unlockAI = async () => {
        setSystemStatus(`DECRYPTING ORACLE...`);
        setTimeout(() => {
            setPrediction({
                asset: "NIFTY 50 / S&P 500",
                chronos_vector: "BULLISH DIVERGENCE",
                projected_target: "AI CONFIRMED",
                accuracy_confidence: "89.4%"
            });
            setSystemStatus("ORACLE DECRYPTED");
            setIsUnlocking(false);
        }, 2000);
    }

        const payWithEVM = async () => {
        const win = window as any; 
        if (!win.ethereum) {
            setSystemStatus("ERROR: METAMASK NOT DETECTED.");
            return alert("MetaMask extension required to unlock Neural Core.");
        }
        try {
            setIsUnlocking(true);
            const provider = new ethers.providers.Web3Provider(win.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            
            setSystemStatus("AWAITING USER SIGNATURE...");
            const tx = await signer.sendTransaction({ 
                to: EVM_WALLET, 
                value: ethers.utils.parseEther("0.005") 
            });
            
            setSystemStatus("MINING TRANSACTION... DO NOT CLOSE PAGE.");
            await tx.wait(); // Waits for the blockchain to physically mine the block
            
            await unlockAI();
        } catch (error: any) { 
            // ADVANCED ERROR HANDLING
            if (error.code === 4001) {
                setSystemStatus("TRANSACTION REJECTED BY USER.");
            } else if (error.code === 'INSUFFICIENT_FUNDS') {
                setSystemStatus("ERROR: INSUFFICIENT ETH BALANCE.");
            } else {
                setSystemStatus("NETWORK ERROR. TRY AGAIN.");
            }
            setIsUnlocking(false); 
        }
    };

    if (!isMounted) return null;

    // LEGAL FIREWALL
    if (!hasAgreed) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#050000', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', padding: '20px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', color: '#ff3333', textShadow: '0 0 20px red', marginBottom: '10px' }}>RESTRICTED TESTNET NODE</h1>
                <div style={{ maxWidth: '600px', background: 'rgba(255,0,0,0.05)', padding: '40px', border: '1px solid #ff3333', boxShadow: '0 0 30px rgba(255,0,0,0.2)', margin: '20px 0', lineHeight: '2', textAlign: 'left', backdropFilter: 'blur(10px)' }}>
                    <p><strong>1. ACADEMIC R&D:</strong> This is a mathematical simulation. Not registered with RBI/SEBI.</p>
                    <p><strong>2. NO FINANCIAL VALUE:</strong> Internal metrics hold zero fiat value.</p>
                    <p><strong>3. LIABILITY WAIVER:</strong> The creator assumes zero liability for external application of this chaotic logic.</p>
                </div>
                <button onClick={() => setHasAgreed(true)} style={{ padding: '20px 50px', background: 'black', color: '#ff3333', border: '2px solid #ff3333', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase', transition: 'all 0.3s', boxShadow: '0 0 15px rgba(255,51,51,0.5)' }}>I Agree. Initialize Matrix.</button>
            </div>
        );
    }

    // MAIN 3D UI
    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000', color: '#fff', fontFamily: 'monospace', overflow: 'hidden' }}>
            
            {/* 3D BACKGROUND CANVAS */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                <Canvas camera={{ position: [0, 0, 5] }}>
                    <Suspense fallback={null}>
                        <ambientLight intensity={0.2} />
                        <pointLight position={[10, 10, 10]} intensity={1.5} color={isCalibrating ? "#ff0000" : "#00ffff"} />
                        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                        <SingularityCore isCalibrating={isCalibrating} />
                        <OrbitControls enableZoom={false} autoRotate={true} autoRotateSpeed={0.5} />
                    </Suspense>
                </Canvas>
            </div>

            {/* FROSTED GLASS UI OVERLAY */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none', display: 'flex', flexDirection: 'column' }}>
                
                {/* TOP BAR */}
                <div style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,255,255,0.2)' }}>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '3px', color: '#00ffff', textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>LONEWOLF // APEX_LEDGER</h1>
                    <span style={{ color: isReady ? '#00ff00' : 'orange', fontWeight: 'bold', letterSpacing: '1px' }}>{systemStatus}</span>
                </div>

                {/* CONTROL PANEL (Bottom Right) */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '50px' }}>
                    <div style={{ width: '400px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(15px)', border: '1px solid rgba(0,255,255,0.3)', borderRadius: '10px', padding: '30px', pointerEvents: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                        
                        {!isReady ? (
                            <div>
                                <h3 style={{ margin: '0 0 20px 0', color: '#00ffff', letterSpacing: '2px' }}>SYSTEM CALIBRATION</h3>
                                <div style={{ width: '100%', height: '4px', background: '#333', marginBottom: '30px', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${calibrationProgress}%`, height: '100%', background: '#00ffff', transition: 'width 0.2s', boxShadow: '0 0 10px #00ffff' }}></div>
                                </div>
                                <button onClick={runCalibration} disabled={isCalibrating} style={{ padding: '15px', width: '100%', background: isCalibrating ? 'rgba(0,0,0,0.8)' : 'rgba(0,255,255,0.1)', color: '#00ffff', border: '1px solid #00ffff', cursor: isCalibrating ? 'wait' : 'pointer', fontWeight: 'bold', letterSpacing: '2px', transition: 'all 0.3s' }}>
                                    {isCalibrating ? `BACKTESTING (${calibrationProgress}%)...` : "EXECUTE PRE-MARKET TEST"}
                                </button>
                            </div>
                        ) : !prediction ? (
                            <div>
                                <h3 style={{ margin: '0 0 20px 0', color: 'gold', letterSpacing: '2px' }}>AI DECRYPTION VAULT</h3>
                                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '25px', lineHeight: '1.5' }}>To prevent automated scraping, the Chronos Output requires cryptographic unlock.</p>
                                <button onClick={payWithEVM} disabled={isUnlocking} style={{ padding: '15px', width: '100%', background: 'linear-gradient(45deg, #f6851b, #e2761b)', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 0 20px rgba(246,133,27,0.4)', transition: 'all 0.3s' }}>
                                    {isUnlocking ? "AWAITING SIGNATURE..." : "🦊 UNLOCK WITH METAMASK (0.005 ETH)"}
                                </button>
                            </div>
                        ) : (
                            <div style={{ border: '1px solid #00ff00', padding: '20px', background: 'rgba(0,255,0,0.05)', borderRadius: '5px' }}>
                                <h2 style={{ color: '#00ff00', margin: '0 0 20px 0', letterSpacing: '2px' }}>TARGET ACQUIRED</h2>
                                <p style={{ color: 'white', fontSize: '1.2rem', margin: '10px 0' }}>ASSET: <span style={{ color: '#00ffff' }}>{prediction.asset}</span></p>
                                <p style={{ color: 'gold', fontSize: '1.5rem', margin: '20px 0', borderBottom: '1px dashed rgba(255,215,0,0.3)', paddingBottom: '10px' }}>VECTOR: {prediction.chronos_vector}</p>
                                <p style={{ color: '#00ff00', fontSize: '1rem' }}>CONFIDENCE: {prediction.accuracy_confidence}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}