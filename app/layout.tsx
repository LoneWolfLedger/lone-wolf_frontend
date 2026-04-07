import './globals.css';
import Hologram from './components/Hologram';
import Link from 'next/link';

export const metadata = {
  title: 'LONEWOLF | Institutional Swarm',
  description: 'Post-Quantum Decentralized Quant Matrix',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif', background: '#0f172a', color: '#f8fafc', overflow: 'hidden' }}>
        <Hologram />
        
        <div style={{ display: 'flex', height: '100vh', position: 'relative', zIndex: 10 }}>
          <div style={{ width: '260px', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '30px 20px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '2px', color: '#ffffff', marginBottom: '10px' }}>LONEWOLF</div>
            <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '50px' }}>POST-QUANTUM ORACLE</div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
              <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold', padding: '10px', borderRadius: '8px', transition: '0.2s' }}>
                ⎈ TERMINAL MATRIX
              </Link>
              <Link href="/investors" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold', padding: '10px', borderRadius: '8px', transition: '0.2s' }}>
                🏛️ INVESTOR RELATIONS
              </Link>
            </nav>
            
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '10px', fontWeight: 'bold' }}>SYSTEM DIAGNOSTICS</div>
              <a href="mailto:founder@lonewolf.com?subject=Platform Feedback" style={{ display: 'block', background: 'rgba(255,255,255,0.05)', color: '#f8fafc', textDecoration: 'none', fontSize: '0.8rem', textAlign: 'center', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                SUBMIT FEEDBACK ✉️
              </a>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
