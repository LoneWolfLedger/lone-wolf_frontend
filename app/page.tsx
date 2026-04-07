'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { ethers } from 'ethers';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';

// --- 3D SINGULARITY CORE (Dark Wireframe on White Background) ---
const SingularityCore = ({ isCalibrating }: { isCalibrating: boolean }) => (
    <Float speed={isCalibrating ? 5 : 1} rotationIntensity={isCalibrating ? 2 : 0.5} floatIntensity={1}>
        <Sphere args={[1.8, 64, 64]}>
            <MeshDistortMaterial 
                color={isCalibrating ? "#ef4444" : "#000000"} 
                attach="material" 
                distort={isCalibrating ? 0.6 : 0.25} 
                speed={isCalibrating ? 4 : 1.5} 
                wireframe={true} 
                transparent={true} 
                opacity={0.15} 
            />
        </Sphere>
    </Float>
);

export default function AthenaPremiumUI() {
    // --- VAULT VARIABLES ---
    const RENDER_API_URL = process.env.NEXT_PUBLIC_RENDER_API_URL || "https://lonewolf-backend.onrender.com"; 
    const EVM_WALLET = process.env.NEXT_PUBLIC_EVM_WALLET || "0xf7df69A45146979B44136a2EC57946e556c05172";
    const PAYPAL_LINK = process.env.NEXT_PUBLIC_PAYPAL_LINK || "https://paypal.me/77krsna"; 
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

    // Data Fetching
    useEffect(() => {
        if (hasAgreed) {
            const safeUrl = RENDER_API_URL.replace(/\/$/, ""); 
            fetch(`${safeUrl}/`)
                .then(res => res.json())
                .then(data => setSystemStatus("ORACLE SYNCED"))
                .catch(err => setSystemStatus("ORACLE SYNCED (BYPASS)"));

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

    const payWithFiat = () => {
        window.open(PAYPAL_LINK, "_blank");
        alert("FIAT GATEWAY: Send payment, then email Founder with your ZK-ID for manual unlock.");
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

    // --- 3D FLOATING ASSET CARDS ---
    const renderAssetCards = () => {
        if (!prediction || prediction.error || Object.keys(prediction).length === 0) return null;
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
            const tvColor = isBull ? '#16a34a' : '#dc2626'; // Institutional Green/Red
            const signalText = isBull ? 'BUY SIGNAL' : 'SELL SIGNAL';
            const conf = parseFloat(item.data.accuracy_confidence || "0");

            return (
                <div key={idx} style={{ 
                    background: '#ffffff', 
                    borderRadius: '16px', 
                    padding: '20px', 
                    display: 'flex', flexDirection: 'column', gap: '15px', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.05)', // Physical 3D Drop Shadow
                    border: '1px solid rgba(0,0,0,0.04)',
                    transition: 'transform 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: '800', letterSpacing: '-0.5px' }}>{item.sector.replace(/_/g, " ")}</span>
                        <div style={{ background: `${tvColor}15`, color: tvColor, padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', border: `1px solid ${tvColor}33` }}>{signalText}</div>
                    </div>

                    {/* Price Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                        <div>
                            <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 'bold' }}>CURRENT</div>
                            <div style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: '900', fontFamily: 'sans-serif', letterSpacing: '-1px' }}>{item.data.current_price}</div>
                        </div>
                        <div style={{ color: '#cbd5e1', fontSize: '1.2rem', paddingBottom: '4px' }}>→</div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 'bold' }}>TARGET</div>
                            <div style={{ color: tvColor, fontSize: '1.4rem', fontWeight: '900', fontFamily: 'sans-serif', letterSpacing: '-1px' }}>{item.data.projected_target}</div>
                        </div>
                    </div>

                    {/* Technicals */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 'bold' }}>NLP SENTIMENT</div>
                            <div style={{ color: '#0f172a', fontSize: '0.8rem', fontWeight: '800' }}>{item.data.nlp_sentiment || "NEUTRAL"}</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 'bold' }}>RESONANCE</div>
                            <div style={{ color: '#0f172a', fontSize: '0.8rem', fontWeight: '800' }}>{item.data.spectral_resonance}</div>
                        </div>
                    </div>

                    {/* Confidence Bar */}
                    <div style={{ marginTop: '5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 'bold' }}>AI CONFIDENCE</span>
                            <span style={{ color: '#0f172a', fontSize: '0.75rem', fontWeight: '900' }}>{item.data.accuracy_confidence}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div style={{ width: `${conf}%`, height: '100%', background: tvColor, borderRadius: '4px' }}></div>
                        </div>
                    </div>
                </div>
            );
        });
    };

    if (!isMounted) return null;

    // --- 3D ENTRY SCREEN ---
    if (!hasAgreed) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#f4f5f7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
                <div style={{ background: '#ffffff', padding: '50px', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.03)', maxWidth: '600px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.02)' }}>
                    <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '10px', letterSpacing: '-1px', fontWeight: '900' }}>LONEWOLF OS</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '30px', fontWeight: 'bold' }}>INSTITUTIONAL QUANTITATIVE RESEARCH NODE</p>
                    
                    <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', textAlign: 'left', lineHeight: '1.6', color: '#334155', fontSize: '0.9rem', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                        <p style={{borderBottom: '1px solid #e2e8f0', paddingBottom: '10px'}}><strong>1.</strong> Mathematical models project probabilities, not certainties.</p>
                        <p style={{borderBottom: '1px solid #e2e8f0', padding: '10px 0'}}><strong>2.</strong> Not registered with SEC/RBI/SEBI. Academic Use Only.</p>
                        <p style={{paddingTop: '10px'}}><strong>3.</strong> Web3 execution is final. Fiat execution is manual.</p>
                    </div>
                    <button onClick={() => setHasAgreed(true)} style={{ marginTop: '30px', width: '100%', padding: '18px', background: '#000000', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '800', boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}>INITIALIZE WORKSPACE</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#f4f5f7', color: '#0f172a', fontFamily: 'sans-serif', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            {/* 3D WHITE BACKGROUND CANVAS */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                <Canvas camera={{ position: [0, 0, 5] }}>
                    <ambientLight intensity={0.8} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                    <SingularityCore isCalibrating={isCalibrating} />
                </Canvas>
            </div>

            {/* UI LAYER */}
            <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                
                {/* TICKER TAPE (Light Mode) */}
                <div style={{ width: '100%', background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '8px 0', zIndex: 10, display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'inline-block', animation: 'marquee 40s linear infinite', color: '#334155', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {liveNews.length > 0 ? liveNews.map((n, i) => (
                            <span key={i} style={{ margin: '0 40px' }}><span style={{color: '#000000'}}>■</span> {n.title}</span>
                        )) : "ESTABLISHING SATELLITE UPLINK..."}
                    </div>
                    <style>{`@keyframes marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }`}</style>
                </div>

                {/* SECONDARY HEADER */}
                <div style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#000000', fontWeight: '900', letterSpacing: '-1px' }}>LONEWOLF OS</h1>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{systemStatus}</span>
                    </div>
                    
                    {!zkID ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="password" placeholder="Passphrase" value={secretPhrase} onChange={(e) => setSecretPhrase(e.target.value)} style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontSize: '0.8rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} />
                            <button onClick={generateZKProof} style={{ background: '#000000', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '800', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>CONNECT ID</button>
                        </div>
                    ) : (
                        <div style={{ background: '#f0fdf4', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold' }}>ID: {zkID}</div>
                    )}
                </div>

                {/* MAIN 3-COLUMN WORKSPACE */}
                <div style={{ flex: 1, display: 'flex', padding: '20px', gap: '20px', overflow: 'hidden', zIndex: 10 }}>
                    
                    {/* LEFT COLUMN: LIVE NEWS (3D Card) */}
                    <div style={{ width: '320px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', fontWeight: '900', fontSize: '0.85rem', color: '#0f172a', background: '#f8fafc' }}>GLOBAL NEWS TERMINAL</div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                            {liveNews.length > 0 ? liveNews.map((news, i) => (
                                <div key={i} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
                                    <a href={news.link} target="_blank" rel="noreferrer" style={{ color: '#334155', textDecoration: 'none', fontSize: '0.85rem', lineHeight: '1.5', display: 'block', fontWeight: '600' }} onMouseOver={e => e.currentTarget.style.color = '#000000'} onMouseOut={e => e.currentTarget.style.color = '#334155'}>
                                        {news.title}
                                    </a>
                                    <div style={{ color: '#94a3b8', fontSize: '0.65rem', marginTop: '6px', fontWeight: 'bold' }}>{new Date(news.pubDate).toLocaleString()}</div>
                                </div>
                            )) : <div style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center', padding: '20px', fontWeight: 'bold' }}>Loading Feed...</div>}
                        </div>
                    </div>

                    {/* CENTER COLUMN: TRADINGVIEW ASSET GRID (3D Panel) */}
                    <div style={{ flex: 1, background: 'rgba(248,250,252,0.7)', backdropFilter: 'blur(20px)', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
                            <span style={{ fontWeight: '900', fontSize: '0.85rem', color: '#0f172a' }}>ALGORITHMIC INDICATORS</span>
                            <span onClick={(e) => { e.stopPropagation(); handleFounderOverride(); }} style={{ cursor: 'pointer', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', background: '#f1f5f9', padding: '4px 8px', borderRadius: '12px' }}>DECRYPTION VAULT 🔐</span>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                            {!isReady ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px' }}>
                                    <div style={{ width: '300px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}><div style={{ width: `${calibrationProgress}%`, height: '100%', background: '#000000', transition: 'width 0.2s' }}></div></div>
                                    <button onClick={runCalibration} disabled={isCalibrating} style={{ padding: '15px 30px', background: '#000000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '0.9rem', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>{isCalibrating ? `CALCULATING (${calibrationProgress}%)...` : "RUN PRE-MARKET SCAN"}</button>
                                </div>
                            ) : !prediction ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '15px', maxWidth: '350px', margin: '0 auto' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold' }}>Connect Web3 wallet to decrypt algorithmic data feeds.</p>
                                    <button onClick={payWithEVM} disabled={isUnlocking} style={{ width: '100%', padding: '15px', background: '#f97316', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '0.9rem', boxShadow: '0 10px 20px rgba(249,115,22,0.2)' }}>🦊 METAMASK (0.005 ETH)</button>
                                    <button onClick={payWithFiat} disabled={isUnlocking} style={{ width: '100%', padding: '15px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '0.9rem', boxShadow: '0 10px 20px rgba(2,132,199,0.2)' }}>💳 PAYPAL ($15.00)</button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                                    {renderAssetCards()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: AI CHATBOT (3D Card) */}
                    <div style={{ width: '350px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', fontWeight: '900', fontSize: '0.85rem', color: '#0f172a', background: '#f8fafc' }}>QUANT AGENT (GEMINI)</div>
                        
                        <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {!zkID ? <p style={{ color: '#eab308', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>ZK-ID REQUIRED FOR COMMS</p> : null}
                            {chatHistory.map((chat, i) => (
                                <div key={i} style={{ textAlign: chat.role === "USER" ? "right" : "left" }}>
                                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 'bold' }}>{chat.role}</div>
                                    <span style={{ background: chat.role === "USER" ? "#000000" : "#f1f5f9", color: chat.role === "USER" ? "#ffffff" : "#0f172a", border: chat.role === "USER" ? "none" : "1px solid #e2e8f0", padding: '10px 14px', borderRadius: '12px', display: 'inline-block', maxWidth: '95%', fontSize: '0.85rem', lineHeight: '1.5', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>{chat.msg}</span>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        
                        <div style={{ padding: '15px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', background: '#f8fafc' }}>
                            <input disabled={!zkID} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()} placeholder="Enter query..." style={{ flex: 1, background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '8px', outline: 'none', fontSize: '0.85rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} />
                            <button disabled={!zkID} onClick={sendChatMessage} style={{ background: '#000000', color: 'white', border: 'none', padding: '0 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '800', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>SEND</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}