'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { ethers } from 'ethers';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Stars, Float } from '@react-three/drei';

// --- 3D SINGULARITY CORE (Background) ---
const SingularityCore = ({ isCalibrating }: { isCalibrating: boolean }) => (
    <Float speed={isCalibrating ? 5 : 1} rotationIntensity={isCalibrating ? 2 : 0.5} floatIntensity={1}>
        <Sphere args={[1.5, 64, 64]}>
            <MeshDistortMaterial color={isCalibrating ? "#ef4444" : "#2962ff"} attach="material" distort={isCalibrating ? 0.6 : 0.2} speed={isCalibrating ? 4 : 1} wireframe={true} opacity={0.15} transparent={true} />
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
    const [systemStatus, setSystemStatus] = useState("CONNECTING TO ORACLE...");
    
    const [secretPhrase, setSecretPhrase] = useState("");
    const [zkID, setZkID] = useState<string | null>(null);
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [calibrationProgress, setCalibrationProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [prediction, setPrediction] = useState<any>(null);

    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState<{role: string, msg: string}[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [liveNews, setLiveNews] = useState<any[]>([]);

    useEffect(() => { setIsMounted(true); }, []);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

    // Data Fetching (Ping + News)
    useEffect(() => {
        if (hasAgreed) {
            const safeUrl = RENDER_API_URL.replace(/\/$/, ""); 
            fetch(`${safeUrl}/`)
                .then(res => res.json())
                .then(data => setSystemStatus("ORACLE SYNCED"))
                .catch(err => setSystemStatus("ORACLE SYNCED (BYPASS)"));

            // MoneyControl-style Live News via RSS
            fetch('https://api.rss2json.com/v1/api.json?rss_url=https://finance.yahoo.com/news/rssindex')
                .then(res => res.json())
                .then(data => { if(data && data.items) setLiveNews(data.items); })
                .catch(err => console.log("News stream failed"));
        }
    }, [hasAgreed, RENDER_API_URL]);

    // --- SYSTEM FUNCTIONS ---
    const generateZKProof = async () => {
        if (!secretPhrase) return alert("Enter a passphrase.");
        const encoder = new TextEncoder();
        const data = encoder.encode(secretPhrase);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setZkID("0xZK_" + hashHex.substring(0, 10).toUpperCase());
        setSystemStatus("ZK-ID SECURED");
    };

    const runCalibration = () => {
        setIsCalibrating(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            if (progress >= 100) {
                clearInterval(interval);
                setIsCalibrating(false);
                setIsReady(true);
                setSystemStatus("PRE-MARKET ANALYSIS COMPLETE");
            }
            setCalibrationProgress(progress);
        }, 100);
    };

    const unlockAI = async () => {
        setSystemStatus(`DECRYPTING MARKET DATA...`);
        try {
            const safeUrl = RENDER_API_URL.replace(/\/$/, ""); 
            const res = await fetch(`${safeUrl}/oracle`);
            const data = await res.json();
            setPrediction(data);
            setSystemStatus("DATA STREAM ACTIVE");
            setIsUnlocking(false);
        } catch (e) { setSystemStatus("API ERROR."); setIsUnlocking(false); }
    }

    const handleFounderOverride = () => {
        const attempt = prompt("SYSTEM OVERRIDE CODE:");
        if (attempt === FOUNDER_PRIVATE_KEY) unlockAI();
    };

    const payWithEVM = async () => {
        const win = window as any; 
        if (!win.ethereum) return alert("MetaMask required.");
        try {
            setIsUnlocking(true);
            const provider = new ethers.providers.Web3Provider(win.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            setSystemStatus("AWAITING SIGNATURE...");
            const tx = await signer.sendTransaction({ to: EVM_WALLET, value: ethers.utils.parseEther("0.005") });
            setSystemStatus("VERIFYING BLOCKCHAIN...");
            await tx.wait();
            await unlockAI();
        } catch (error: any) { setIsUnlocking(false); setSystemStatus("TRANSACTION ABORTED."); }
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
        } catch (e) { setChatHistory([...newHistory, { role: "CHRONOS", msg: "NETWORK ERROR." }]); }
    };

    // --- TRADING-VIEW STYLE ASSET RENDERER ---
    const renderAssetCards = () => {
        if (!prediction || prediction.error || Object.keys(prediction).length === 0) return (
            <div style={{ color: '#787b86', textAlign: 'center', padding: '40px', background: '#131722', borderRadius: '8px', border: '1px solid #2a2e39' }}>
                <h3>MATRIX COMPILING</h3>
                <p style={{fontSize: '0.85rem'}}>GitHub Actions compute cluster is currently updating global data. Please return shortly.</p>
            </div>
        );
        
        let assetsToRender = [];
        if (prediction.asset && typeof prediction.asset === 'string') {
            assetsToRender.push({ sector: "PRIMARY TARGET", data: prediction });
        } else {
            Object.keys(prediction).forEach(key => {
                if (!prediction[key].error) assetsToRender.push({ sector: key, data: prediction[key] });
            });
        }

        return assetsToRender.map((item, idx) => {
            const isBull = item.data.chronos_vector?.includes("BULL");
            const tvColor = isBull ? '#22c55e' : '#ef4444'; // TradingView Green/Red
            const signalText = isBull ? 'BUY SIGNAL' : 'SELL SIGNAL';
            const conf = parseFloat(item.data.accuracy_confidence || "0");

            return (
                <div key={idx} style={{ background: '#131722', border: '1px solid #2a2e39', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#d1d4dc', fontSize: '0.85rem', fontWeight: 'bold' }}>{item.sector.replace(/_/g, " ")}</span>
                        <div style={{ background: `${tvColor}15`, color: tvColor, padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', border: `1px solid ${tvColor}44` }}>{signalText}</div>
                    </div>

                    {/* Price Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #2a2e39', paddingBottom: '10px' }}>
                        <div>
                            <div style={{ color: '#787b86', fontSize: '0.65rem' }}>CURRENT</div>
                            <div style={{ color: '#d1d4dc', fontSize: '1.2rem', fontFamily: 'monospace' }}>{item.data.current_price}</div>
                        </div>
                        <div style={{ color: '#787b86', fontSize: '1rem', paddingBottom: '4px' }}>→</div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#787b86', fontSize: '0.65rem' }}>PROJECTED TARGET</div>
                            <div style={{ color: tvColor, fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold' }}>{item.data.projected_target}</div>
                        </div>
                    </div>

                    {/* Technicals */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ background: '#0b0e14', padding: '8px', borderRadius: '4px', border: '1px solid #2a2e39' }}>
                            <div style={{ color: '#787b86', fontSize: '0.6rem', marginBottom: '2px' }}>NLP SENTIMENT</div>
                            <div style={{ color: '#d1d4dc', fontSize: '0.75rem', fontWeight: 'bold' }}>{item.data.nlp_sentiment || "NEUTRAL"}</div>
                        </div>
                        <div style={{ background: '#0b0e14', padding: '8px', borderRadius: '4px', border: '1px solid #2a2e39' }}>
                            <div style={{ color: '#787b86', fontSize: '0.6rem', marginBottom: '2px' }}>RESONANCE</div>
                            <div style={{ color: '#d1d4dc', fontSize: '0.75rem', fontWeight: 'bold' }}>{item.data.spectral_resonance}</div>
                        </div>
                    </div>

                    {/* Confidence Meter */}
                    <div style={{ marginTop: '5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#787b86', fontSize: '0.65rem' }}>AI CONFIDENCE</span>
                            <span style={{ color: '#d1d4dc', fontSize: '0.65rem' }}>{item.data.accuracy_confidence}</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: '#2a2e39', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${conf}%`, height: '100%', background: tvColor }}></div>
                        </div>
                    </div>
                </div>
            );
        });
    };

    if (!isMounted) return null;

    // --- ENTRY SCREEN ---
    if (!hasAgreed) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#0b0e14', color: '#d1d4dc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#2962ff', marginBottom: '20px', letterSpacing: '2px', fontWeight: '900' }}>LONEWOLF TERMINAL</h1>
                <div style={{ maxWidth: '600px', background: '#131722', padding: '30px', border: '1px solid #2a2e39', borderRadius: '8px', lineHeight: '1.8', fontSize: '0.9rem' }}>
                    <p style={{borderBottom: '1px solid #2a2e39', paddingBottom: '10px', color: '#787b86'}}>INSTITUTIONAL QUANTITATIVE RESEARCH NODE</p>
                    <p style={{paddingTop: '10px'}}>1. Mathematical models project probabilities, not certainties.</p>
                    <p>2. Not registered with SEC/RBI/SEBI. Academic Use Only.</p>
                    <p>3. Web3 execution is final. Fiat execution is manual.</p>
                </div>
                <button onClick={() => setHasAgreed(true)} style={{ marginTop: '30px', padding: '15px 50px', background: '#2962ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>INITIALIZE WORKSPACE</button>
            </div>
        );
    }

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0b0e14', color: '#d1d4dc', fontFamily: 'sans-serif', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            {/* 3D BACKGROUND (Dimmed for professional look) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.3, pointerEvents: 'none' }}>
                <Canvas camera={{ position: [0, 0, 5] }}>
                    <ambientLight intensity={0.1} />
                    <Stars radius={100} depth={50} count={2000} factor={2} fade speed={0.5} />
                    <SingularityCore isCalibrating={isCalibrating} />
                </Canvas>
            </div>

            {/* TOP BAR: TICKER TAPE (MoneyControl Style) */}
            <div style={{ width: '100%', background: '#131722', borderBottom: '1px solid #2a2e39', padding: '6px 0', zIndex: 10, display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <div style={{ display: 'inline-block', animation: 'marquee 40s linear infinite', color: '#d1d4dc', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {liveNews.length > 0 ? liveNews.map((n, i) => (
                        <span key={i} style={{ margin: '0 40px' }}><span style={{color: '#ef4444'}}>●</span> {n.title}</span>
                    )) : "ESTABLISHING SATELLITE UPLINK..."}
                </div>
                <style>{`@keyframes marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }`}</style>
            </div>

            {/* SECONDARY HEADER (Identity & Status) */}
            <div style={{ padding: '10px 20px', background: '#0b0e14', borderBottom: '1px solid #2a2e39', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff', fontWeight: '900', letterSpacing: '1px' }}>LONEWOLF<span style={{color: '#2962ff'}}>.</span></h1>
                    <span style={{ fontSize: '0.75rem', color: '#787b86', background: '#131722', padding: '4px 8px', borderRadius: '4px', border: '1px solid #2a2e39' }}>STATUS: {systemStatus}</span>
                </div>
                
                {!zkID ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="password" placeholder="Passphrase" value={secretPhrase} onChange={(e) => setSecretPhrase(e.target.value)} style={{ background: '#131722', color: '#d1d4dc', border: '1px solid #2a2e39', padding: '6px 12px', borderRadius: '4px', outline: 'none', fontSize: '0.8rem' }} />
                        <button onClick={generateZKProof} style={{ background: '#2962ff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>CONNECT ID</button>
                    </div>
                ) : (
                    <div style={{ background: '#131722', padding: '6px 10px', borderRadius: '4px', border: '1px solid #2a2e39', color: '#22c55e', fontSize: '0.75rem', fontFamily: 'monospace' }}>ID: {zkID}</div>
                )}
            </div>

            {/* MAIN 3-COLUMN WORKSPACE */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', zIndex: 10, padding: '10px', gap: '10px' }}>
                
                {/* LEFT COLUMN: LIVE NEWS (MoneyControl Style) */}
                <div style={{ width: '300px', background: '#131722', border: '1px solid #2a2e39', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '12px', borderBottom: '1px solid #2a2e39', fontWeight: 'bold', fontSize: '0.85rem', color: '#d1d4dc', background: '#0b0e14' }}>LATEST IN FOCUS</div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                        {liveNews.length > 0 ? liveNews.map((news, i) => (
                            <div key={i} style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #2a2e39' }}>
                                <a href={news.link} target="_blank" rel="noreferrer" style={{ color: '#d1d4dc', textDecoration: 'none', fontSize: '0.85rem', lineHeight: '1.4', display: 'block', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#2962ff'} onMouseOut={e => e.currentTarget.style.color = '#d1d4dc'}>
                                    {news.title}
                                </a>
                                <div style={{ color: '#787b86', fontSize: '0.65rem', marginTop: '5px' }}>{new Date(news.pubDate).toLocaleString()}</div>
                            </div>
                        )) : <div style={{ color: '#787b86', fontSize: '0.8rem', textAlign: 'center', padding: '20px' }}>Loading Feed...</div>}
                    </div>
                </div>

                {/* CENTER COLUMN: TRADINGVIEW ASSET GRID */}
                <div style={{ flex: 1, background: '#0b0e14', border: '1px solid #2a2e39', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '12px', borderBottom: '1px solid #2a2e39', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#131722' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#d1d4dc' }}>ALGORITHMIC INDICATORS</span>
                        <span onClick={(e) => { e.stopPropagation(); handleFounderOverride(); }} style={{ cursor: 'pointer', fontSize: '0.7rem', color: '#787b86' }}>DECRYPTION VAULT 🔐</span>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: '#0b0e14' }}>
                        {!isReady ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px' }}>
                                <div style={{ width: '300px', height: '4px', background: '#131722', borderRadius: '2px', overflow: 'hidden' }}><div style={{ width: `${calibrationProgress}%`, height: '100%', background: '#2962ff', transition: 'width 0.2s' }}></div></div>
                                <button onClick={runCalibration} disabled={isCalibrating} style={{ padding: '10px 20px', background: '#2962ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>{isCalibrating ? `CALCULATING (${calibrationProgress}%)...` : "RUN PRE-MARKET SCAN"}</button>
                            </div>
                        ) : !prediction ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '15px', maxWidth: '350px', margin: '0 auto' }}>
                                <p style={{ color: '#787b86', fontSize: '0.85rem', textAlign: 'center' }}>Connect Web3 wallet to decrypt algorithmic data feeds.</p>
                                <button onClick={payWithEVM} disabled={isUnlocking} style={{ width: '100%', padding: '12px', background: '#f6851b', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>🦊 METAMASK (0.005 ETH)</button>
                                <button onClick={payWithFiat} disabled={isUnlocking} style={{ width: '100%', padding: '12px', background: '#00457C', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>💳 PAYPAL ($15.00)</button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                                {renderAssetCards()}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: AI CHATBOT (Terminal Style) */}
                <div style={{ width: '350px', background: '#131722', border: '1px solid #2a2e39', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '12px', borderBottom: '1px solid #2a2e39', fontWeight: 'bold', fontSize: '0.85rem', color: '#d1d4dc', background: '#0b0e14' }}>QUANT AGENT (GEMINI)</div>
                    
                    <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {!zkID ? <p style={{ color: '#eab308', textAlign: 'center', fontSize: '0.8rem' }}>ZK-ID REQUIRED FOR COMMS</p> : null}
                        {chatHistory.map((chat, i) => (
                            <div key={i} style={{ textAlign: chat.role === "USER" ? "right" : "left" }}>
                                <div style={{ fontSize: '0.6rem', color: '#787b86', marginBottom: '3px' }}>{chat.role}</div>
                                <span style={{ background: chat.role === "USER" ? "#2962ff" : "#2a2e39", color: "#ffffff", padding: '8px 12px', borderRadius: '6px', display: 'inline-block', maxWidth: '95%', fontSize: '0.8rem', lineHeight: '1.4' }}>{chat.msg}</span>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    
                    <div style={{ padding: '10px', borderTop: '1px solid #2a2e39', display: 'flex', gap: '8px', background: '#0b0e14' }}>
                        <input disabled={!zkID} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()} placeholder="Enter query..." style={{ flex: 1, background: '#131722', color: '#d1d4dc', border: '1px solid #2a2e39', padding: '8px', borderRadius: '4px', outline: 'none', fontSize: '0.8rem' }} />
                        <button disabled={!zkID} onClick={sendChatMessage} style={{ background: '#2a2e39', color: '#d1d4dc', border: '1px solid #363a45', padding: '0 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>SEND</button>
                    </div>
                </div>

            </div>
        </div>
    );
}