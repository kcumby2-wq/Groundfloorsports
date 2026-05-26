import Link from 'next/link';
import VideoShowcase from '@/components/gfs/VideoShowcase';

export default function AuthBrandPanel({ mode = 'sign-in' }) {
  const isSignUp = mode === 'sign-up';

  return (
    <aside className="brand-panel">
      <Link href="/" className="brand-logo">
        <span className="brand-logo-mark">G</span>
        GROUNDFLOOR<span>SPORTS</span>
      </Link>

      <div className="brand-hero">
        <div className="brand-eyebrow">{isSignUp ? 'Get started' : 'Welcome back'}</div>
        <h1 className="brand-headline">
          {isSignUp ? 'Every play.' : 'Own the'}
          <br />
          <span className="magenta">{isSignUp ? 'Ownable.' : 'play.'}</span>
        </h1>
        <p className="brand-sub">
          {isSignUp
            ? 'Create your account to browse clips, claim athlete moments, and sell your footage.'
            : 'Sign in to browse clips, manage your athlete profile, and track sales.'}
        </p>
        <VideoShowcase
          compact
          title={isSignUp ? 'Creator + Athlete Highlights' : 'Fresh Clips Loading'}
          sub="Video previews run continuously so the platform feels active before you even sign in."
        />

        {isSignUp ? (
          <div className="benefits">
            <div className="benefit">
              <div className="benefit-icon">★</div>
              <div>
                <div className="benefit-title">Find Your Clips</div>
                <div className="benefit-desc">Search tagged clips by jersey number, team, or game.</div>
              </div>
            </div>
            <div className="benefit">
              <div className="benefit-icon">◆</div>
              <div>
                <div className="benefit-title">Claim NFT Drops</div>
                <div className="benefit-desc">Own commercial-grade moments with athlete-first splits.</div>
              </div>
            </div>
            <div className="benefit">
              <div className="benefit-icon">✓</div>
              <div>
                <div className="benefit-title">Sell Your Footage</div>
                <div className="benefit-desc">List single clips, season packs, and event bundles.</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="float-cards">
            <div className="float-card fc1">
              <div className="float-card-name">Tre'Sean Holloway</div>
              <div className="float-card-meta">Allen HS · TX · QB · Class of '27</div>
              <div className="float-card-bottom">
                <span>Season Pack</span>
                <span className="float-card-price">$79</span>
              </div>
            </div>
            <div className="float-card fc2">
              <div className="float-card-name">Rated 7v7 · Dallas</div>
              <div className="float-card-meta">Spring Series · 48 Teams · Event Bundle</div>
              <div className="float-card-bottom">
                <span>Circuit Pack</span>
                <span className="float-card-price">$899</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="brand-footer">A Subject Ecosystem Brand · SR · SM · TOJ · GFS</div>
    </aside>
  );
}
