import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'LONEWOLF | Institutional',
  description: 'Decentralized Quant Terminal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#181a20', color: '#EAECEF', overflow: 'hidden' }}>
        
        {/* PURE CSS HOVER EFFECTS (Bypasses React Server Component Error) */}
        <style>{`
          .nav-link { color: #848E9C; text-decoration: none; font-size: 0.95rem; font-weight: 600; padding: 12px 15px; border-radius: 8px; transition: 0.2s; }
          .nav-link:hover { color: #EAECEF; background: #2B3139; }
          .nav-link.active { color: #EAECEF; background: #2B3139; }
          .support-btn { display: block; background: transparent; color: #848E9C; text-decoration: none; font-size: 0.85rem; font-weight: 600; text-align: center; padding: 12px; border-radius: 8px; border: 1px solid #2B3139; transition: 0.2s; }
          .support-btn:hover { color: #FCD535; border-color: #FCD535; }
        `}</style>
        
        <div style={{ display: 'flex', height: '100vh', position: 'relative', zIndex: 10 }}>
          {/* SOLID INSTITUTIONAL SIDEBAR */}
          <div style={{ width: '260px', background: '#1e2329', borderRight: '1px solid #2B3139', display: 'flex', flexDirection: 'column', padding: '30px 20px' }}>
            
            {/* LOGO */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
              <div style={{ width: '24px', height: '24px', background: '#FCD535', borderRadius: '4px' }}></div>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#EAECEF', letterSpacing: '1px' }}>LONEWOLF</div>
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#848E9C', fontWeight: '600', marginBottom: '10px', marginTop: '10px' }}>PLATFORM</div>
              <Link href="/" className="nav-link active">
                📊 Markets Matrix
              </Link>
              <Link href="/investors" className="nav-link">
                🏛️ Investor Relations
              </Link>
            </nav>
            
            {/* SUPPORT */}
            <div style={{ borderTop: '1px solid #2B3139', paddingTop: '20px' }}>
              <a href="mailto:founder@lonewolf.com?subject=Support" className="support-btn">
                🎧 Contact Support
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
