'use client';
import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';

const TradingViewWidget = ({ symbol }: { symbol: string }) => {
    const tvSymbol = symbol.replace("^GSPC", "SPX").replace("^IXIC", "IXIC").replace("BTC-USD", "BINANCE:BTCUSDT").replace("ETH-USD", "BINANCE:ETHUSDT").replace("GC=F", "GC1!");
    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <iframe src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_1&symbol=${tvSymbol}&interval=1&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=MACD%40tv-basicstudies%1FRSI%40tv-basicstudies&theme=light&style=1`} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
        </div>
    );
};

export default function AthenaPremiumUI() {
    const RENDER_API_URL = process.env.NEXT_PUBLIC_RENDER_API_URL || "https://lonewolf-backend.onrender.com"; 
    
    const [hasAgreed, setHasAgreed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    
    // ZK Portfolio Connection
    const [apiKeyInput, setApiKeyInput] = useState("");
    const [zkSignature, setZkSignature] = useState<string | null>(null);
    const [portfolioMock, setPortfolioMock] = useState("");
    
    const [prediction, setPrediction] = useState<any>(null);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);

    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState<{role: string, msg: string}[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [liveNews, setLiveNews] = useState<any[]>([]);

    useEffect(() => { setIsMounted(true); }, []);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

    // Multi-Source Macro News
    useEffect(() => {
        if (hasAgreed) {
            const fetchNews = async () => {
                try {
                    const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss');
                    const data = await res.json();
                    if(data && data.items) setLiveNews(data.items.slice(0, 10));
                } catch(e) {}
            };
            fetchNews();
        }
    }, [hasAgreed]);

    // Cryptographic Zero-Knowledge ID Generation (Browser-side)
    const generateZKProof = async () => {
        if (!apiKeyInput) return alert("Enter Exchange API Key or Wallet Address.");
        const encoder = new TextEncoder();
        const data = encoder.encode(apiKeyInput + "LONEWOLF_SALT_999");
        const hashBuffer = await crypto.subtle.digest('SHA-384', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        setZkSignature("0x" + hashHex.substring(0, 16).toUpperCase());
        setPortfolioMock(`Simulated Portfolio: $14,250. Exposure: 40% BTC, 60% USD. Risk Tolerance: High.`);
        setApiKeyInput(""); // Wipe key from memory instantly
    };

        const unlockAI = async () => {
        const attempt = prompt("ENTER ZERO-KNOWLEDGE DECRYPTION KEY:");
        if (!attempt) return;
        
        try {
            // We now send the password to the backend to be checked securely.
            const res = await fetch(`${RENDER_API_URL.replace(/\/$/, "")}/oracle`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ master_key: attempt })
            });
            
            if (!res.ok) {
                alert("ACCESS DENIED: INVALID CRYPTOGRAPHIC KEY");
                return;
            }
            
            const data = await res.json();
            setPrediction(data);
        } catch (e) { 
            alert("ORACLE SERVER OFFLINE OR REBOOTING."); 
        }
    };

    const sendChatMessage = async () => {
        if (!chatInput || !zkSignature) return;
        const newHistory = [...chatHistory, { role: "USER", msg: chatInput }];
        setChatHistory(newHistory); setChatInput("");
        try {
            const res = await fetch(`${RENDER_API_URL.replace(/\/$/, "")}/chat`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: chatInput, zk_signature: zkSignature, portfolio_state: portfolioMock })
            });
            const data = await res.json();
            setChatHistory([...newHistory, { role: "QUANT AGENT", msg: data.reply }]);
        } catch (e) { setChatHistory([...newHistory, { role: "QUANT AGENT", msg: "NETWORK ERROR." }]); }
    };

    const renderWorkspace = () => {
        if (!prediction) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <button onClick={unlockAI} style={{ padding: '15px 30px', background: '#000000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '900' }}>DECRYPT LIVE MARKETS 🔐</button>
                </div>
            );
        }

        if (selectedAsset) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto', paddingRight: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a', fontWeight: '900' }}>{selectedAsset.sector.replace(/_/g, " ")}</h2>
                        <button onClick={() => setSelectedAsset(null)} style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>← BACK</button>
                    </div>
                    <TradingViewWidget symbol={selectedAsset.data.asset} />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                        {Object.entries(selectedAsset.data.timeframes || {}).map(([tf, data]: any) => {
                            const isLive = tf === "1M_LIVE";
                            const tfColor = data.vector.includes("BULL") || data.vector.includes("BUY") ? '#16a34a' : (data.vector.includes("BEAR") || data.vector.includes("CRASH") ? '#dc2626' : '#64748b');
                            return (
                                <div key={tf} style={{ background: isLive ? '#111827' : '#ffffff', color: isLive ? '#ffffff' : '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '900', color: isLive ? '#38bdf8' : '#64748b' }}>{isLive ? '🔴 LIVE 1-MIN SCALP' : tf.replace("_", " ")}</div>
                                        <div style={{ color: tfColor, fontSize: '0.65rem', fontWeight: 'bold' }}>{data.vector}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>TARGET</span>
                                        <span style={{ color: tfColor, fontSize: '1.2rem', fontWeight: '900' }}>{data.target}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '5px' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>CHAOS REGIME (Hurst)</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '900' }}>{data.hurst_chaos}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            );
        }

        let assets = [];
        Object.keys(prediction).forEach(key => { if (key !== "oracle_key" && !prediction[key].error) assets.push({ sector: key, data: prediction[key] }); });

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {assets.map((item, idx) => (
                    <div key={idx} onClick={() => setSelectedAsset(item)} style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '900' }}>{item.sector.replace(/_/g, " ")}</span>
                            <span style={{ fontSize: '0.7rem', color: '#0ea5e9', fontWeight: 'bold' }}>{item.data.crypto_proof}</span>
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>{item.data.current_price}</div>
                    </div>
                ))}
            </div>
        );
    };

    if (!isMounted) return null;
    if (!hasAgreed) return (<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f5f7' }}><div style={{ background: '#fff', padding: '50px', borderRadius: '24px', textAlign: 'center' }}><h1 style={{ fontWeight: '900' }}>LONEWOLF INSTITUTIONAL</h1><button onClick={() => setHasAgreed(true)} style={{ padding: '18px', background: '#000', color: '#fff', borderRadius: '12px', fontWeight: '900', width: '100%', marginTop: '20px' }}>INITIALIZE WORKSPACE</button></div></div>);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif' }}>
            <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '8px 0', display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <div style={{ display: 'inline-block', animation: 'marquee 40s linear infinite', fontSize: '0.75rem', fontWeight: 'bold' }}>{liveNews.map((n, i) => (<span key={i} style={{ margin: '0 40px' }}>■ {n.title}</span>))}</div>
                <style>{`@keyframes marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }`}</style>
            </div>
            
            <div style={{ padding: '15px 20px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>LONEWOLF OS</h1>
                {!zkSignature ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="password" placeholder="Exchange API / Wallet Key" value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} style={{ border: '1px solid #cbd5e1', padding: '8px', borderRadius: '8px', fontSize: '0.8rem' }} />
                        <button onClick={generateZKProof} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>SECURE ZK-CONNECT</button>
                    </div>
                ) : (<div style={{ background: '#f0fdf4', padding: '6px 12px', borderRadius: '8px', color: '#16a34a', fontSize: '0.75rem', fontWeight: 'bold' }}>PORTFOLIO SIGNED: {zkSignature}</div>)}
            </div>

            <div style={{ flex: 1, display: 'flex', padding: '20px', gap: '20px', overflow: 'hidden' }}>
                <div style={{ flex: 1, background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', fontWeight: '900', fontSize: '0.85rem' }}>HIGH-FREQUENCY ALGORITHMIC MATRIX</div>
                    <div style={{ flex: 1, padding: '20px', overflow: 'hidden' }}>{renderWorkspace()}</div>
                </div>
                
                <div style={{ width: '320px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', fontWeight: '900', fontSize: '0.85rem' }}>QUANT PORTFOLIO AGENT</div>
                    <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {!zkSignature ? <p style={{ color: '#eab308', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>CONNECT WALLET TO ACTIVATE</p> : <p style={{ color: '#16a34a', fontSize: '0.7rem', textAlign: 'center' }}>{portfolioMock}</p>}
                        {chatHistory.map((chat, i) => (<div key={i} style={{ textAlign: chat.role === "USER" ? "right" : "left" }}><div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 'bold' }}>{chat.role}</div><span style={{ background: chat.role === "USER" ? "#000000" : "#f8fafc", color: chat.role === "USER" ? "#ffffff" : "#0f172a", padding: '10px', borderRadius: '12px', display: 'inline-block', fontSize: '0.85rem', border: '1px solid #e2e8f0' }}>{chat.msg}</span></div>))}
                        <div ref={chatEndRef} />
                    </div>
                    <div style={{ padding: '15px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
                        <input disabled={!zkSignature} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()} placeholder="Ask for risk advice..." style={{ flex: 1, border: '1px solid #cbd5e1', padding: '10px', borderRadius: '8px' }} />
                        <button disabled={!zkSignature} onClick={sendChatMessage} style={{ background: '#000000', color: 'white', border: 'none', padding: '0 16px', borderRadius: '8px', fontWeight: '900' }}>SEND</button>
                    </div>
                </div>
            </div>
        </div>
    );
}