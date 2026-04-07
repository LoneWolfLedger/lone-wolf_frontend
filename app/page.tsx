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
    const RENDER_API_URL = process.env.NEXT_PUBLIC_RENDER_API_URL || ""; 
    const EVM_WALLET = process.env.NEXT_PUBLIC_EVM_WALLET || "";
    const PAYPAL_LINK = process.env.NEXT_PUBLIC_PAYPAL_LINK || ""; 
    const FOUNDER_PRIVATE_KEY = process.env.NEXT_PUBLIC_FOUNDER_KEY || ""; 

    // --- STATE MANAGEMENT ---
    const [hasAgreed, setHasAgreed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [systemStatus, setSystemStatus] = useState("AWAKENING RENDER BACKEND...");
    
    // ZK-Identity & Matrix
    const [secretPhrase, setSecretPhrase] = useState("");
    const [zkID, setZkID] = useState<string | null>(null);
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [calibrationProgress, setCalibrationProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [prediction, setPrediction] = useState<any>(null);

    // Chat & News
    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState<{role: string, msg: string}[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [liveNews, setLiveNews] = useState<any[]>([]);

    useEffect(() => { setIsMounted(true); }, []);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

    useEffect(() => {
        if (hasAgreed) {
            const safeUrl = RENDER_API_URL.replace(/\/$/, ""); 
            fetch(`${safeUrl}/`)
                .then(res => res.json())
                .then(data => setSystemStatus(data.status || "SINGULARITY ONLINE"))
                .catch(err => setSystemStatus("SINGULARITY ONLINE (Bypassed Ping)"));

            // Live Bloomberg/MoneyControl Style Ticker Feed
            fetch('https://api.rss2json.com/v1/api.json?rss_url=https://finance.yahoo.com/news/rssindex')
                .then(res => res.json())
                .then(data => { if(data && data.items) setLiveNews(data.items.slice(0, 10)); })
                .catch(err => console.log("Satellite News Link Severed"));
        }
    }, [hasAgreed, RENDER_API_URL]);

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
        } catch (e) { setSystemStatus("API ERROR. CHECK RENDER."); setIsUnlocking(false); }
    }

    const handleFounderOverride = () => {
        const attempt = prompt("ENTER OMEGA CLEARANCE CODE:");
        if (attempt === FOUNDER_PRIVATE_KEY) {
            setSystemStatus("FOUNDER OVERRIDE ACCEPTED.");
            unlockAI();
        } else if (attempt !== null) alert("ACCESS DENIED.");
    };

    const sendChatMessage = async () => {
        if (!chatInput || !zkID) return;
        const newHistory = [...chatHistory, { role: "USER", msg: chatInput }];
        setChatHistory(newHistory);
        setChatInput("");
        try {
            const safeUrl = RENDER_API_URL.replace(/\/$/, ""); 
            const res = await fetch(`${safeUrl}/chat`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: chatInput, zk_id: zkID })
            });
            const data = await res.json();
            setChatHistory([...newHistory, { role: "CHRONOS", msg: data.reply }]);
        } catch (e) { setChatHistory([...newHistory, { role: "CHRONOS", msg: "ERROR: NEURAL LINK SEVERED." }]); }
    };

    // --- TRADING-VIEW ASSET RENDERER (ADAPTS TO SINGLE OR MULTI ASSET JSON) ---
    const renderAssetCards = () => {
        if (!prediction) return null;
        
        let assetsToRender = [];
        // Detect if JSON is single asset (from Colab) or multi-asset (from GitHub Actions)
        if (prediction.asset && typeof prediction.asset === 'string') {
            assetsToRender.push({ sector: "PRIMARY TARGET", data: prediction });
        } else {
            Object.keys(prediction).forEach(key => {
                if (!prediction[key].error) assetsToRender.push({ sector: key, data: prediction[key] });
            });
        }

        return assetsToRender.map((item, idx) => {
            const isBull = item.data.chronos_vector?.includes("BULL");
            const color = isBull ? '#22c55e' : '#ef4444'; // TradingView Green/Red
            const conf = parseFloat(item.data.accuracy_confidence || "0");

            return (
                <div key={idx} style={{ background: '#131722', border: `1px solid #2a2e39`, borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                    {/* Header: Sector & Asset */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a2e39', paddingBottom: '10px' }}>
                        <span style={{ color: '#d1d4dc', fontSize: '0.85rem', fontWeight: 'bold' }}>{item.sector.replace(/_/g, " ")}</span>
                        <span style={{ color: '#2962ff', fontSize: '0.85rem', fontWeight: 'bold', background: 'rgba(41,98,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{item.data.asset}</span>
                    </div>

                    {/* Main Price Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ color: '#787b86', fontSize: '0.75rem', textTransform: 'uppercase' }}>Current</div>
                            <div style={{ color: '#d1d4dc', fontSize: '1.4rem', fontWeight: 'bold', fontFamily: 'sans-serif' }}>{item.data.current_price}</div>
                        </div>
                        <div style={{ color: '#787b86', fontSize: '1.2rem' }}>➔</div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#787b86', fontSize: '0.75rem', textTransform: 'uppercase' }}>Target</div>
                            <div style={{ color: color, fontSize: '1.4rem', fontWeight: 'bold', fontFamily: 'sans-serif' }}>{item.data.projected_target}</div>
                        </div>
                    </div>

                    {/* Vector & Sentiment Badges */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, background: `${color}22`, color: color, padding: '8px', borderRadius: '4px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold', border: `1px solid ${color}44` }}>
                            {item.data.chronos_vector}
                        </div>
                        {item.data.nlp_sentiment && (
                            <div style={{ flex: 1, background: '#2a2e39', color: '#d1d4dc', padding: '8px', borderRadius: '4px', textAlign: 'center', fontSize: '0.75rem', border: '1px solid #363a45' }}>
                                NLP: {item.data.nlp_sentiment}
                            </div>
                        )}
                    </div>

                    {/* Technicals Data Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#0b0e14', padding: '10px', borderRadius: '4px', border: '1px solid #2a2e39' }}>
                        <div>
                            <div style={{ color: '#787b86', fontSize: '0.65rem' }}>EPISTEMIC UNCERTAINTY</div>
                            <div style={{ color: '#d1d4dc', fontSize: '0.85rem', fontFamily: 'monospace' }}>{item.data.epistemic_uncertainty}</div>
                        </div>
                        <div>
                            <div style={{ color: '#787b86', fontSize: '0.65rem' }}>SPECTRAL RESONANCE</div>
                            <div style={{ color: '#d1d4dc', fontSize: '0.85rem', fontFamily: 'monospace' }}>{item.data.spectral_resonance}</div>
                        </div>
                    </div>

                    {/* Confidence Progress Bar */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ color: '#787b86', fontSize: '0.7rem' }}>CONFIDENCE RATING</span>
                            <span style={{ color: '#d1d4dc', fontSize: '0.7rem', fontWeight: 'bold' }}>{item.data.accuracy_confidence}</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#2a2e39', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${conf}%`, height: '100%', background: conf > 80 ? '#22c55e' : conf > 50 ? '#eab308' : '#ef4444' }}></div>
                        </div>
                    </div>
                </div>
            );
        });
    };

    if (!isMounted) return null;

    if (!hasAgreed) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#0b0e14', color: '#d1d4dc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: '20px', letterSpacing: '2px' }}>RESTRICTED TERMINAL</h1>
                <div style={{ maxWidth: '600px', background: '#131722', padding: '30px', border: '1px solid #2a2e39', borderRadius: '8px', lineHeight: '1.6' }}>
                    <p style={{borderBottom: '1px solid #2a2e39', paddingBottom: '10px'}}>1. Mathematical models project probabilities, not certainties.</p>
                    <p style={{borderBottom: '1px solid #2a2e39', padding: '10px 0'}}>2. Not registered with SEC/RBI/SEBI. Academic Use Only.</p>
                    <p style={{paddingTop: '10px'}}>3. Web3 execution is final. Fiat execution is manual.</p>
                </div>
                <button onClick={() => setHasAgreed(true)} style={{ marginTop: '30px', padding: '15px 40px', background: '#2962ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#1e4ebd'} onMouseOut={e => e.currentTarget.style.background = '#2962ff'}>I AGREE. LAUNCH TERMINAL.</button>
            </div>
        );
    }

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0b0e14', color: '#d1d4dc', fontFamily: 'sans-serif', overflowY: 'auto', overflowX: 'hidden' }}>
            
            {/* BACKGROUND CANVAS */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.4 }}>
                <Canvas camera={{ position: [0, 0, 5] }}>
                    <Suspense fallback={null}>
                        <ambientLight intensity={0.2} />
                        <pointLight position={[10, 10, 10]} intensity={1.5} color={isCalibrating ? "#ef4444" : "#2962ff"} />
                        <Stars radius={100} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />
                        <SingularityCore isCalibrating={isCalibrating} />
                        <OrbitControls enableZoom={false} autoRotate={true} autoRotateSpeed={0.3} />
                    </Suspense>
                </Canvas>
            </div>

            {/* UI LAYER */}
            <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                
                {/* TRADING-VIEW STYLE HEADER */}
                <div style={{ padding: '15px 20px', background: '#131722', borderBottom: '1px solid #2a2e39', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#d1d4dc', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#2962ff' }}>⬡</span> LONEWOLF TERMINAL
                    </h1>
                    
                    {!zkID ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="password" placeholder="Terminal Passphrase" value={secretPhrase} onChange={(e) => setSecretPhrase(e.target.value)} style={{ background: '#0b0e14', color: '#d1d4dc', border: '1px solid #2a2e39', padding: '6px 12px', borderRadius: '4px', outline: 'none', fontSize: '0.85rem' }} />
                            <button onClick={generateZKProof} style={{ background: '#2a2e39', color: '#d1d4dc', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>CONNECT ZK-ID</button>
                        </div>
                    ) : (
                        <div style={{ background: '#1e222d', padding: '5px 10px', borderRadius: '4px', border: '1px solid #2a2e39', color: '#22c55e', fontSize: '0.8rem', fontFamily: 'monospace' }}>ID: {zkID}</div>
                    )}
                </div>

                {/* MONEYCONTROL STYLE TICKER TAPE */}
                <div style={{ width: '100%', background: '#0b0e14', borderBottom: '1px solid #2a2e39', padding: '8px 0', overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex' }}>
                    <div style={{ display: 'inline-block', animation: 'marquee 30s linear infinite', color: '#787b86', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {liveNews.length > 0 ? liveNews.map((n, i) => (
                            <span key={i} style={{ margin: '0 30px' }}><span style={{color: '#2962ff'}}>■</span> {n.title}</span>
                        )) : "ESTABLISHING SATELLITE UPLINK..."}
                    </div>
                </div>

                <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>

                {/* MAIN CONTENT WORKSPACE */}
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', padding: '20px', gap: '20px' }}>
                    
                    {/* LEFT PANEL: CHAT AGENT */}
                    <div style={{ flex: '1 1 300px', maxWidth: '400px', background: '#131722', border: '1px solid #2a2e39', borderRadius: '8px', display: 'flex', flexDirection: 'column', height: '550px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid #2a2e39', color: '#d1d4dc', fontWeight: 'bold', fontSize: '0.9rem' }}>QUANTITATIVE AGENT (GEMINI)</div>
                        
                        <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {!zkID ? <p style={{ color: '#eab308', textAlign: 'center', fontSize: '0.85rem' }}>ZK-ID REQUIRED FOR COMMS</p> : null}
                            {chatHistory.map((chat, i) => (
                                <div key={i} style={{ textAlign: chat.role === "USER" ? "right" : "left" }}>
                                    <div style={{ fontSize: '0.65rem', color: '#787b86', marginBottom: '4px' }}>{chat.role}</div>
                                    <span style={{ background: chat.role === "USER" ? "#2962ff" : "#2a2e39", color: "#d1d4dc", padding: '10px 12px', borderRadius: '6px', display: 'inline-block', maxWidth: '90%', fontSize: '0.85rem', lineHeight: '1.4', fontFamily: chat.role === "USER" ? 'sans-serif' : 'monospace' }}>{chat.msg}</span>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        
                        <div style={{ padding: '15px', borderTop: '1px solid #2a2e39', display: 'flex', gap: '10px', background: '#0b0e14', borderRadius: '0 0 8px 8px' }}>
                            <input disabled={!zkID} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()} placeholder="Query Oracle..." style={{ flex: 1, background: '#131722', color: '#d1d4dc', border: '1px solid #2a2e39', padding: '10px', borderRadius: '4px', outline: 'none', fontSize: '0.85rem' }} />
                            <button disabled={!zkID} onClick={sendChatMessage} style={{ background: '#2962ff', color: 'white', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>SEND</button>
                        </div>
                    </div>

                    {/* RIGHT PANEL: TERMINAL DATA DISPLAY */}
                    <div style={{ flex: '1 1 500px', background: '#0b0e14', border: '1px solid #2a2e39', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                        
                        {/* HEADER CONTROLS */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #2a2e39' }}>
                            <h2 style={{ margin: 0, color: '#d1d4dc', fontSize: '1.1rem' }}>ALGORITHMIC PREDICTIONS</h2>
                            <span onClick={(e) => { e.stopPropagation(); handleFounderOverride(); }} style={{ cursor: 'pointer', color: '#eab308', fontSize: '0.8rem', background: 'rgba(234,179,8,0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(234,179,8,0.3)' }}>DECRYPTION VAULT 🔐</span>
                        </div>

                        {/* PRE-UNLOCK / CALIBRATION */}
                        {!isReady ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px' }}>
                                <div style={{ color: '#787b86' }}>AWAITING INITIALIZATION</div>
                                <div style={{ width: '80%', maxWidth: '400px', height: '6px', background: '#131722', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: `${calibrationProgress}%`, height: '100%', background: '#2962ff', transition: 'width 0.2s' }}></div></div>
                                <button onClick={runCalibration} disabled={isCalibrating} style={{ padding: '12px 30px', background: '#2a2e39', color: '#d1d4dc', border: '1px solid #363a45', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{isCalibrating ? `SIMULATING (${calibrationProgress}%)...` : "RUN PRE-MARKET ANALYSIS"}</button>
                            </div>
                        ) : !prediction ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
                                <p style={{ color: '#787b86', fontSize: '0.9rem', textAlign: 'center', marginBottom: '10px' }}>Terminal locked. Connect Web3 wallet or utilize Fiat gateway to decrypt algorithmic outputs.</p>
                                <button onClick={() => {}} style={{ width: '100%', padding: '15px', background: '#f6851b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>🦊 UNLOCK VIA METAMASK (0.005 ETH)</button>
                                <button onClick={() => {}} style={{ width: '100%', padding: '15px', background: '#00457C', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>💳 UNLOCK VIA PAYPAL ($15.00)</button>
                            </div>
                        ) : prediction.error ? (
                            <div style={{ color: '#ef4444', textAlign: 'center', padding: '40px' }}>
                                <h3>DATA STREAM ERROR</h3>
                                <p style={{ fontSize: '0.85rem', color: '#787b86', marginTop: '10px' }}>{prediction.error}</p>
                            </div>
                        ) : (
                            /* THE NEW TRADING VIEW GRID RENDERER */
                            <div style={{ height: '450px', overflowY: 'auto', paddingRight: '10px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                    {renderAssetCards()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}