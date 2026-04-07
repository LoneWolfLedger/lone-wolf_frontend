'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { ethers } from 'ethers';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';

// --- 3D GLOBE ---
const GlobalHologram = ({ isCalibrating }: { isCalibrating: boolean }) => (
    <Float speed={isCalibrating ? 5 : 1} rotationIntensity={isCalibrating ? 2 : 0.5} floatIntensity={1}>
        <Sphere args={[1.8, 64, 64]}>
            <MeshDistortMaterial color={isCalibrating ? "#ef4444" : "#000000"} attach="material" distort={isCalibrating ? 0.6 : 0.25} speed={isCalibrating ? 4 : 1.5} wireframe={true} transparent={true} opacity={0.15} />
        </Sphere>
    </Float>
);

// --- TRADINGVIEW WIDGET ---
const TradingViewWidget = ({ symbol }: { symbol: string }) => {
    const tvSymbol = symbol.replace("^GSPC", "SPX").replace("^IXIC", "IXIC").replace("^NSEI", "NIFTY").replace("BTC-USD", "BINANCE:BTCUSDT").replace("ETH-USD", "BINANCE:ETHUSDT").replace("GC=F", "GC1!");
    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <iframe src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_1&symbol=${tvSymbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=MACD%40tv-basicstudies%1FRSI%40tv-basicstudies&theme=light&style=1`} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
        </div>
    );
};

export default function AthenaPremiumUI() {
    const RENDER_API_URL = process.env.NEXT_PUBLIC_RENDER_API_URL || ""; 
    const EVM_WALLET = process.env.NEXT_PUBLIC_EVM_WALLET || "";
    const PAYPAL_LINK = process.env.NEXT_PUBLIC_PAYPAL_LINK || ""; 
    const FOUNDER_PRIVATE_KEY = process.env.NEXT_PUBLIC_FOUNDER_KEY || ""; 

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
    const [selectedAsset, setSelectedAsset] = useState<any>(null);

    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState<{role: string, msg: string}[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [liveNews, setLiveNews] = useState<any[]>([]);

    useEffect(() => { setIsMounted(true); }, []);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

    useEffect(() => {
        if (hasAgreed) {
            fetch(`${RENDER_API_URL.replace(/\/$/, "")}/`)
                .then(res => res.json())
                .then(data => setSystemStatus("ORACLE SYNCED"))
                .catch(err => setSystemStatus("ORACLE SYNCED (BYPASS)"));

            fetch('https://api.rss2json.com/v1/api.json?rss_url=https://finance.yahoo.com/news/rssindex')
                .then(res => res.json())
                .then(data => { if(data && data.items) setLiveNews(data.items); })
                .catch(err => console.log("News stream failed"));
        }
    }, [hasAgreed, RENDER_API_URL]);

    const generateZKProof = async () => {
        if (!secretPhrase) return alert("Enter a passphrase.");
        const encoder = new TextEncoder();
        const data = encoder.encode(secretPhrase);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        setZkID("0xZK_" + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 10).toUpperCase());
        setSystemStatus("ZK-ID SECURED");
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
                setSystemStatus("GLOBAL MAPPING COMPLETE");
            }
            setCalibrationProgress(progress);
        }, 100);
    };

    const unlockAI = async () => {
        setSystemStatus(`DECRYPTING MARKET DATA...`);
        try {
            const res = await fetch(`${RENDER_API_URL.replace(/\/$/, "")}/oracle`);
            const data = await res.json();
            setPrediction(data);
            setSystemStatus("DATA STREAM ACTIVE");
            setIsUnlocking(false);
        } catch (e) { setSystemStatus("API ERROR."); setIsUnlocking(false); }
    }

    const handleFounderOverride = () => {
        const attempt = prompt("SYSTEM OVERRIDE CODE:");
        if (attempt === FOUNDER_PRIVATE_KEY) unlockAI();
        else if (attempt !== null) alert("ACCESS DENIED.");
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
            const res = await fetch(`${RENDER_API_URL.replace(/\/$/, "")}/chat`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: chatInput, zk_id: zkID })
            });
            const data = await res.json();
            setChatHistory([...newHistory, { role: "CHRONOS", msg: data.reply }]);
        } catch (e) { setChatHistory([...newHistory, { role: "CHRONOS", msg: "NETWORK ERROR." }]); }
    };

    const renderWorkspace = () => {
        if (!isReady) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px' }}>
                    <div style={{ width: '300px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${calibrationProgress}%`, height: '100%', background: '#000000', transition: 'width 0.2s' }}></div></div>
                    <button onClick={runCalibration} disabled={isCalibrating} style={{ padding: '15px 30px', background: '#000000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800' }}>{isCalibrating ? `MAPPING GLOBE (${calibrationProgress}%)...` : "RUN GLOBAL SCAN"}</button>
                </div>
            );
        }

        if (!prediction) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '15px', maxWidth: '350px', margin: '0 auto' }}>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold' }}>Connect Web3 wallet to decrypt global datasets.</p>
                    <button onClick={payWithEVM} disabled={isUnlocking} style={{ width: '100%', padding: '15px', background: '#f97316', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800' }}>🦊 METAMASK (0.005 ETH)</button>
                    <button onClick={() => window.open(PAYPAL_LINK, "_blank")} style={{ width: '100%', padding: '15px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800' }}>💳 PAYPAL ($15.00)</button>
                </div>
            );
        }

        if (prediction.error) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                    <h2 style={{ color: '#ef4444', fontWeight: '900' }}>ORACLE VAULT COMPILING</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{prediction.error}</p>
                </div>
            );
        }

        if (selectedAsset) {
            const isBull = selectedAsset.data.chronos_vector?.includes("BULL");
            const color = isBull ? '#16a34a' : '#dc2626';

            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto', paddingRight: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a', fontWeight: '900' }}>{selectedAsset.sector.replace(/_/g, " ")}</h2>
                        <button onClick={() => setSelectedAsset(null)} style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}>← BACK TO GRID</button>
                    </div>
                    <TradingViewWidget symbol={selectedAsset.data.asset} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '10px' }}>AI QUANTITATIVE VECTOR</div>
                            <div style={{ color: color, fontSize: '1.4rem', fontWeight: '900' }}>{selectedAsset.data.chronos_vector}</div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '10px' }}>PRICE METRICS</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#64748b', fontWeight: 'bold' }}>Current:</span><span style={{ color: '#0f172a', fontWeight: '900' }}>{selectedAsset.data.current_price}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b', fontWeight: 'bold' }}>Target:</span><span style={{ color: color, fontWeight: '900' }}>{selectedAsset.data.projected_target}</span></div>
                        </div>
                    </div>
                </div>
            );
        }

        let assetsToRender = [];
        Object.keys(prediction).forEach(key => {
            if (key !== "oracle_key" && !prediction[key].error) assetsToRender.push({ sector: key, data: prediction[key] });
        });

        return (
            <div style={{ height: '100%', overflowY: 'auto', paddingRight: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    {assetsToRender.map((item, idx) => {
                        const isBull = item.data.chronos_vector?.includes("BULL");
                        const tvColor = isBull ? '#16a34a' : '#dc2626';

                        return (
                            <div key={idx} onClick={() => setSelectedAsset(item)} style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: '900' }}>{item.sector.replace(/_/g, " ")}</span>
                                    <div style={{ background: `${tvColor}15`, color: tvColor, padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '900' }}>{isBull ? 'BUY' : 'SELL'}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                                    <div><div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 'bold' }}>CURRENT</div><div style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: '900' }}>{item.data.current_price}</div></div>
                                    <div style={{ color: '#cbd5e1', fontSize: '1.2rem', paddingBottom: '4px' }}>→</div>
                                    <div style={{ textAlign: 'right' }}><div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 'bold' }}>TARGET</div><div style={{ color: tvColor, fontSize: '1.2rem', fontWeight: '900' }}>{item.data.projected_target}</div></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (!isMounted) return null;

    if (!hasAgreed) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#f4f5f7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
                <div style={{ background: '#ffffff', padding: '50px', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.08)', maxWidth: '600px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.02)' }}>
                    <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '10px', fontWeight: '900' }}>LONEWOLF OS</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '30px', fontWeight: 'bold' }}>GLOBAL INTELLIGENCE NODE</p>
                    <button onClick={() => setHasAgreed(true)} style={{ width: '100%', padding: '18px', background: '#000000', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '900' }}>INITIALIZE WORKSPACE</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                <Canvas camera={{ position: [0, 0, 6] }}><ambientLight intensity={0.8} /><GlobalHologram isCalibrating={isCalibrating} /></Canvas>
            </div>
            <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%', background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '8px 0', display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    <div style={{ display: 'inline-block', animation: 'marquee 40s linear infinite', color: '#334155', fontSize: '0.75rem', fontWeight: 'bold' }}>{liveNews.length > 0 ? liveNews.map((n, i) => (<span key={i} style={{ margin: '0 40px' }}><span style={{color: '#000000'}}>■</span> {n.title}</span>)) : "ESTABLISHING SATELLITE UPLINK..."}</div>
                    <style>{`@keyframes marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }`}</style>
                </div>
                <div style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#000000', fontWeight: '900' }}>LONEWOLF OS</h1>
                    {!zkID ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="password" placeholder="Passphrase" value={secretPhrase} onChange={(e) => setSecretPhrase(e.target.value)} style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontSize: '0.8rem' }} />
                            <button onClick={generateZKProof} style={{ background: '#000000', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '900' }}>CONNECT ID</button>
                        </div>
                    ) : (<div style={{ background: '#f0fdf4', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '0.75rem', fontWeight: 'bold' }}>ID: {zkID}</div>)}
                </div>
                <div style={{ flex: 1, display: 'flex', padding: '20px', gap: '20px', overflow: 'hidden' }}>
                    <div style={{ width: '300px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', fontWeight: '900', fontSize: '0.85rem' }}>GLOBAL NEWS</div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                            {liveNews.length > 0 ? liveNews.map((news, i) => (<div key={i} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}><a href={news.link} target="_blank" rel="noreferrer" style={{ color: '#334155', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700' }}>{news.title}</a></div>)) : "Loading..."}
                        </div>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(248,250,252,0.85)', backdropFilter: 'blur(20px)', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '900', fontSize: '0.85rem' }}>{selectedAsset ? "ASSET DEEP DIVE" : "ALGORITHMIC INDICATORS"}</span>
                            <span onClick={(e) => { e.stopPropagation(); handleFounderOverride(); }} style={{ cursor: 'pointer', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold' }}>DECRYPTION VAULT 🔐</span>
                        </div>
                        <div style={{ flex: 1, padding: '20px', overflow: 'hidden' }}>{renderWorkspace()}</div>
                    </div>
                    <div style={{ width: '320px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', fontWeight: '900', fontSize: '0.85rem' }}>QUANT AGENT</div>
                        <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {!zkID ? <p style={{ color: '#eab308', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>ZK-ID REQUIRED</p> : null}
                            {chatHistory.map((chat, i) => (<div key={i} style={{ textAlign: chat.role === "USER" ? "right" : "left" }}><div style={{ fontSize: '0.6rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 'bold' }}>{chat.role}</div><span style={{ background: chat.role === "USER" ? "#000000" : "#f1f5f9", color: chat.role === "USER" ? "#ffffff" : "#0f172a", border: chat.role === "USER" ? "none" : "1px solid #e2e8f0", padding: '10px 14px', borderRadius: '12px', display: 'inline-block', maxWidth: '95%', fontSize: '0.85rem' }}>{chat.msg}</span></div>))}
                            <div ref={chatEndRef} />
                        </div>
                        <div style={{ padding: '15px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
                            <input disabled={!zkID} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()} placeholder="Query..." style={{ flex: 1, background: '#ffffff', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '8px', outline: 'none', fontSize: '0.85rem' }} />
                            <button disabled={!zkID} onClick={sendChatMessage} style={{ background: '#000000', color: 'white', border: 'none', padding: '0 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '900' }}>SEND</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}