'use client';

export default function InvestorRelations() {
    return (
        <div style={{ padding: '60px', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#ffffff', marginBottom: '10px' }}>ENTER THE MATRIX.</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '50px' }}>
                Project LoneWolf is a 0-to-1 leap in quantitative finance. By combining Post-Quantum Cryptographic ledgers, Liquid Neural Networks, and Topological Data Analysis, we have constructed a fully decentralized, literature-backed predictive swarm. We are currently opening our seed round to select strategic partners.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '50px' }}>
                {/* WHITEPAPER 1 */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '30px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '900', letterSpacing: '1px', marginBottom: '10px' }}>WHITEPAPER I</div>
                    <h2 style={{ fontSize: '1.4rem', color: '#ffffff', marginTop: 0 }}>The Retail Alpha Swarm</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>A mathematical breakdown of how our 5-node autonomous agent framework achieves ~85% conditional accuracy using Fama's Efficient Market Hypothesis.</p>
                    <button onClick={() => alert("Whitepaper PDF compiling... Check back soon.")} style={{ background: '#ffffff', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>READ WHITEPAPER</button>
                </div>

                {/* WHITEPAPER 2 */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '30px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '900', letterSpacing: '1px', marginBottom: '10px' }}>WHITEPAPER II</div>
                    <h2 style={{ fontSize: '1.4rem', color: '#ffffff', marginTop: 0 }}>Decentralized Quant Infrastructure</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>An architectural deep-dive into our O(1) Memory Vault, Thread-Safe Routing, and SHA-384 Zero-Knowledge Rollup Simulation for institutional compliance.</p>
                    <button onClick={() => alert("Whitepaper PDF compiling... Check back soon.")} style={{ background: '#ffffff', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>READ WHITEPAPER</button>
                </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(15, 23, 42, 0.5))', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
                <h2 style={{ color: '#ffffff', margin: '0 0 10px 0' }}>Strategic Funding & Collaboration</h2>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '20px', maxWidth: '600px', margin: '0 auto 30px' }}>
                    We are actively seeking Web3 researchers, Fintech innovators, and Angel Capital to transition this architecture from Render/Vercel into a fully on-chain Ethereum Smart Contract Oracle.
                </p>
                <a href="mailto:invest@lonewolf.com?subject=Seed Round Inquiry - Project LoneWolf" style={{ display: 'inline-block', background: '#38bdf8', color: '#0f172a', textDecoration: 'none', padding: '15px 40px', borderRadius: '8px', fontWeight: '900', fontSize: '1.1rem' }}>
                    CONTACT FOUNDER
                </a>
            </div>
        </div>
    );
}