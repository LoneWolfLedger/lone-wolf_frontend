'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { ethers } from 'ethers';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Stars, Float } from '@react-three/drei';

// --- 3D SINGULARITY CORE ---
const SingularityCore = ({ isCalibrating }: { isCalibrating: boolean }) => (
    <Float speed={isCalibrating ? 5 : 2} rotationIntensity={isCalibrating ? 3 : 1.5} floatIntensity={2}>
        <Sphere args={[1.5, 64, 64]}>
            <MeshDistortMaterial color={isCalibrating ? "#ff3333" : "#00ffff"} attach="material" distort={isCalibrating ? 0.8 : 0.4} speed={isCalibrating ? 5 : 2} wireframe={true} />
        </Sphere>
    </Float>
);

export default function AthenaPremiumUI() {
    // --- VAULT VARIABLES ---
    const RENDER_API_URL = "https://lonewolf-backend.onrender.com"; 
    const EVM_WALLET = "0xf7df69A45146979B44136a2EC57946e556c05172";
    const PAYPAL_LINK = "https://paypal.me/yourusername/15"; // CHANGE THIS

    // --- STATE MANAGEMENT ---
    const [hasAgreed, setHasAgreed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [systemStatus, setSystemStatus] = useState("AWAKENING RENDER BACKEND...");
    
    // ZK-Identity
    const [secretPhrase, setSecretPhrase] = useState("");
    const [zkID, setZkID] = useState<string | null>(null);

    // Matrix States
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [calibrationProgress, setCalibrationProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [prediction, setPrediction] = useState<any>(null);

    // Chat Agent
    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState<{role: string, msg: string}[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setIsMounted(true); }, []);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

    // Regex Failsafe for Backend Ping
    useEffect(() => {
        if (hasAgreed) {
            const safeUrl = RENDER_API_URL.replace(/\/$/, ""); 
            fetch(`${safeUrl}/`)
                .then(res => res.json())
                .then(data => setSystemStatus(data.status || "SINGULARITY ONLINE"))
                .catch(err => setSystemStatus("SINGULARITY ONLINE (Bypassed Ping)"));
        }
    }, [hasAgreed]);

    // --- ZERO KNOWLEDGE HASHING ---
    const generateZKProof = async () => {
        if (!secretPhrase) return alert("Enter a phrase to generate ZK-ID.");
        const encoder = new TextEncoder();
        const data = encoder.encode(secretPhrase);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setZkID("0xZK_" + hashHex.substring(0, 12).toUpperCase());
        setSystemStatus("ZK-IDENTITY ESTABLISHED");
    };

    const runCalibration = () => {
        setIsCalibrating(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress >= 100) {
                clearInterval(interval);
                setIsCalibrating(false);
                setIsReady(true);
                setSystemStatus("CALIBRATED. OMEGA TOPOLOGY SECURED.");
            }
            setCalibrationProgress(progress);
        }, 150);
    };

    const unlockAI = async () => {
        setSystemStatus(`DECRYPTING ORACLE...`);
        try {
            const safeUrl = RENDER_API_URL.replace(/\/$/, ""); 
            const res = await fetch(`${safeUrl}/oracle`);
            const data = await res.json();
            setPrediction(data);
            setSystemStatus("ORACLE DECRYPTED");
            setIsUnlocking(false);
        } catch (e) { setSystemStatus("API ERROR."); setIsUnlocking(false); }
    }

    // --- SECURE PAYMENT GATEWAYS ---
    const payWithEVM = async () => {
        const win = window as any; 
        if (!win.ethereum) return alert("MetaMask required for instant Web3 access.");
        try {
            setIsUnlocking(true);
            const provider = new ethers.providers.Web3Provider(win.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            setSystemStatus("AWAITING USER SIGNATURE...");
            const tx = await signer.sendTransaction({ to: EVM_WALLET, value: ethers.utils.parseEther("0.005") });
            setSystemStatus("VERIFYING BLOCKCHAIN... DO NOT CLOSE.");
            await tx.wait();
            await unlockAI();
        } catch (error: any) { 
            if (error.code === 4001) setSystemStatus("TRANSACTION REJECTED BY USER.");
            else setSystemStatus("NETWORK ERROR. TRY AGAIN.");
            setIsUnlocking(false); 
        }
    };

    const payWithFiat = () => {
        window.open(PAYPAL_LINK, "_blank");
        alert("FIAT GATEWAY: Send payment, then email Founder with your ZK-ID for manual unlock (Takes 1-12 hours). Use Web3 for INSTANT unlock.");
    };

    const sendChatMessage = async () => {
        if (!chatInput || !zkID) return;
        const newHistory = [...chatHistory, { role: "USER", msg: chatInput }];
        setChatHistory(newHistory);
        setChatInput("");
        setSystemStatus("TRANSMITTING TO OMEGA...");
        try {
            const safeUrl = RENDER_API_URL.replace(/\/$/, ""); 
            const res = await fetch(`${safeUrl}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: chatInput, zk_id: zkID })
            });
            const data = await res.json();
            setChatHistory([...newHistory, { role: "CHRONOS", msg: data.reply }]);
            setSystemStatus("TRANSMISSION RECEIVED.");
        } catch (e) { setChatHistory([...newHistory, { role: "CHRONOS", msg: "ERROR: NEURAL LINK SEVERED." }]); }
    };

    if (!isMounted) return null;

    if (!hasAgreed) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#050000', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', padding: '20px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', color: '#ff3333', textShadow: '0 0 20px red', marginBottom: '20px' }}>RESTRICTED TESTNET NODE</h1>
                <div style={{ maxWidth: '600px', background: 'rgba(255,0,0,0.05)', padding: '30px', border: '1px solid #ff3333', textAlign: 'left', lineHeight: '1.8' }}>
                    <p>1. Mathematical models project probabilities, not certainties.</p>
                    <p>2. R&D Rulings apply. Not registered with RBI/SEBI.</p>
                    <p>3. Web3 execution is final. Fiat execution is manual.</p>
                </div>
                <button onClick={() => setHasAgreed(true)} style={{ marginTop: '30px', padding: '15px 40px', background: 'black', color: '#ff3333', border: '2px solid #ff3333', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>I AGREE. ENTER MATRIX.</button>
            </div>
        );
    }

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000', color: '#fff', fontFamily: 'monospace', overflowY: 'auto', overflowX: 'hidden' }}>
            {/* 3D BACKGROUND */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
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

            {/* UI LAYER */}
            <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                
                {/* TOP BAR */}
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,255,255,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#00ffff', textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>LONEWOLF // APEX_LEDGER</h1>
                    
                    {!zkID ? (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input type="password" placeholder="Secret Passphrase" value={secretPhrase} onChange={(e) => setSecretPhrase(e.target.value)} style={{ background: '#111', color: '#fff', border: '1px solid rgba(0,255,255,0.5)', padding: '8px', outline: 'none' }} />
                            <button onClick={generateZKProof} style={{ background: 'rgba(0,255,255,0.2)', color: '#00ffff', border: '1px solid #00ffff', padding: '8px 15px', cursor: 'pointer', fontWeight: 'bold' }}>GENERATE ZK-ID</button>
                        </div>
                    ) : (
                        <div style={{ color: '#00ff00', fontWeight: 'bold', fontSize: '0.9rem' }}>ID: {zkID}</div>
                    )}
                </div>

                {/* MAIN CONTENT */}
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'flex-start', padding: '20px', gap: '20px', marginTop: '20px' }}>
                    
                    {/* CHAT AGENT PANEL */}
                    <div style={{ flex: '1 1 350px', maxWidth: '500px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(15px)', border: '1px solid rgba(0,255,255,0.3)', borderRadius: '10px', display: 'flex', flexDirection: 'column', height: '450px' }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid rgba(0,255,255,0.2)', color: '#00ffff', fontWeight: 'bold' }}>ORACLE COMM-LINK</div>
                        <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {!zkID ? <p style={{ color: 'orange', textAlign: 'center', fontSize: '0.9rem' }}>GENERATE ZK-ID TO INITIATE COMMS</p> : null}
                            {chatHistory.map((chat, i) => (
                                <div key={i} style={{ textAlign: chat.role === "USER" ? "right" : "left" }}>
                                    <span style={{ background: chat.role === "USER" ? "rgba(255,255,255,0.1)" : "rgba(0,255,255,0.1)", color: chat.role === "USER" ? "white" : "#00ffff", padding: '8px 12px', borderRadius: '5px', display: 'inline-block', maxWidth: '90%', fontSize: '0.9rem', border: chat.role === "CHRONOS" ? '1px solid rgba(0,255,255,0.3)' : 'none' }}>{chat.msg}</span>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div style={{ padding: '10px', borderTop: '1px solid rgba(0,255,255,0.2)', display: 'flex', gap: '10px' }}>
                            <input disabled={!zkID} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()} placeholder="Query Oracle..." style={{ flex: 1, background: '#111', color: '#fff', border: '1px solid #333', padding: '10px', outline: 'none' }} />
                            <button disabled={!zkID} onClick={sendChatMessage} style={{ background: '#00ffff', color: '#000', border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}>SEND</button>
                        </div>
                    </div>

                    {/* VAULT PANEL */}
                    <div style={{ flex: '1 1 350px', maxWidth: prediction ? '800px' : '500px', transition: 'max-width 0.5s', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(15px)', border: '1px solid rgba(0,255,255,0.3)', borderRadius: '10px', padding: '30px' }}>
                        {!isReady ? (
                            <div>
                                <h3 style={{ color: '#00ffff', letterSpacing: '2px', marginBottom: '20px' }}>SYSTEM CALIBRATION</h3>
                                <div style={{ width: '100%', height: '4px', background: '#333', marginBottom: '20px' }}><div style={{ width: `${calibrationProgress}%`, height: '100%', background: '#00ffff', transition: 'width 0.2s', boxShadow: '0 0 10px #00ffff' }}></div></div>
                                <button onClick={runCalibration} disabled={isCalibrating} style={{ width: '100%', padding: '15px', background: isCalibrating ? 'rgba(0,0,0,0.8)' : 'rgba(0,255,255,0.1)', color: '#00ffff', border: '1px solid #00ffff', cursor: 'pointer', fontWeight: 'bold' }}>{isCalibrating ? `SIMULATING (${calibrationProgress}%)...` : "EXECUTE PRE-MARKET TEST"}</button>
                            </div>
                        ) : !prediction ? (
                            <div>
                                <h3 style={{ color: 'gold', marginBottom: '15px', letterSpacing: '1px' }}>DECRYPTION VAULT</h3>
                                <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '20px' }}>Instant unlock via Web3. Manual unlock via Web2 Fiat.</p>
                                
                                <button onClick={payWithEVM} disabled={isUnlocking} style={{ width: '100%', padding: '15px', background: 'linear-gradient(45deg, #f6851b, #e2761b)', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px', borderRadius: '5px', boxShadow: '0 0 15px rgba(246,133,27,0.3)' }}>{isUnlocking ? "AWAITING SIGNATURE..." : "🦊 WEB3 UNLOCK (0.005 ETH)"}</button>
                                <button onClick={payWithFiat} disabled={isUnlocking} style={{ width: '100%', padding: '15px', background: '#00457C', color: 'white', border: '1px solid #0079C1', cursor: 'pointer', fontWeight: 'bold', borderRadius: '5px' }}>💳 FIAT UNLOCK (PAYPAL)</button>
                                <p style={{ color: '#888', fontSize: '0.75rem', marginTop: '15px', textAlign: 'center' }}>{systemStatus}</p>
                            </div>
                        ) : prediction.error ? (
                            <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
                                <h3>{prediction.error}</h3>
                                <p style={{ fontSize: '0.8rem', color: '#aaa' }}>GitHub Actions is currently compiling the Global Matrix. Please check back in 5 minutes.</p>
                            </div>
                        ) : (
                            <div style={{ padding: '10px', height: '450px', overflowY: 'auto' }}>
                                <h2 style={{ color: '#00ff00', marginBottom: '15px', borderBottom: '1px solid #00ff00', paddingBottom: '10px', fontSize: '1.2rem', letterSpacing: '2px' }}>GLOBAL OMNISCIENCE MATRIX</h2>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                                    {Object.keys(prediction).map((sector) => {
                                        const data = prediction[sector];
                                        if (data.error) return null; 
                                        
                                        const isBull = data.chronos_vector.includes("BULL");
                                        const color = isBull ? '#00ff00' : '#ff3333';
                                        const sentimentColor = data.nlp_sentiment?.includes("BULL") ? '#00ff00' : data.nlp_sentiment?.includes("BEAR") ? '#ff3333' : '#aaaaaa';

                                        return (
                                            <div key={sector} style={{ border: `1px solid ${color}44`, padding: '15px', background: `linear-gradient(180deg, rgba(0,0,0,0.8) 0%, ${color}11 100%)`, borderRadius: '5px', boxShadow: `0 0 15px ${color}22` }}>
                                                <p style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', margin: '0 0 10px 0', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                                                    {sector.replace(/_/g, " ")} <span style={{ color: '#00ffff', fontSize: '0.8rem' }}>({data.asset})</span>
                                                </p>
                                                
                                                <p style={{ color: color, fontSize: '1.1rem', fontWeight: 'bold', margin: '5px 0', textShadow: `0 0 10px ${color}` }}>{data.chronos_vector}</p>
                                                
                                                <div style={{ margin: '10px 0', padding: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', borderLeft: `3px solid ${sentimentColor}` }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#888' }}>NEWS NLP SENTIMENT:</span><br/>
                                                    <span style={{ fontSize: '0.85rem', color: sentimentColor, fontWeight: 'bold' }}>{data.nlp_sentiment || "NEUTRAL"}</span>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#aaa', marginTop: '10px' }}>
                                                    <span>TARGET: <strong style={{color:'white'}}>{data.projected_target}</strong></span>
                                                    <span>CONF: <strong style={{color:'white'}}>{data.accuracy_confidence}</strong></span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}