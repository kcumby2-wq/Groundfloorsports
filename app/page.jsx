import Link from 'next/link';
import SiteHeader from '@/components/gfs/SiteHeader';
import SiteFooter from '@/components/gfs/SiteFooter';
import VideoShowcase from '@/components/gfs/VideoShowcase';

export default function HomePage() {
  return (
    <main className="gfs-page">
      <SiteHeader />

      <div className="home-columns-layout">
        <aside className="home-side-column home-side-nav" aria-label="Homepage navigation">
          <p className="home-side-title">Jump to</p>
          <a href="#home-hero" className="home-side-link">Hero</a>
          <a href="#how-it-works" className="home-side-link">How It Works</a>
          <a href="#why-gfs" className="home-side-link">Why GroundfloorSports</a>
          <a href="#founder-note" className="home-side-link">Founder Note</a>
          <a href="#audience-gateway" className="home-side-link">Choose Your Lane</a>
          <a href="#get-started" className="home-side-link">Get Started</a>
        </aside>

        <div className="home-main-column">

      <section className="groundfloorsports-shell" id="home-hero">

        <div className="groundfloorsports-hero-grid">
          <div className="groundfloorsports-hero-copy">
            <p className="hero-eyebrow">Discover</p>
            <h1 className="groundfloorsports-title">Your Highlights. Found, Clipped, Delivered.</h1>
            <p className="groundfloorsports-sub">
              Creators upload game footage, AI analyzes every play, and players get their clips in minutes.
              No back-and-forth. No scrubbing through hours of film. Just highlights, ready to go.
            </p>
            <div className="hero-actions">
              <Link href="/marketplace" className="hero-btn primary">I&apos;m a Player</Link>
              <Link href="/sign-in?next=%2Fseller%2Fonboarding" className="hero-btn">I&apos;m a Creator</Link>
            </div>
            <div className="groundfloorsports-kpis">
              <div className="groundfloorsports-kpi">
                <div className="groundfloorsports-kpi-value">Minutes</div>
                <div className="groundfloorsports-kpi-label">AI Processing Time</div>
              </div>
              <div className="groundfloorsports-kpi">
                <div className="groundfloorsports-kpi-value">15%</div>
                <div className="groundfloorsports-kpi-label">All groundfloorsports Takes</div>
              </div>
              <div className="groundfloorsports-kpi">
                <div className="groundfloorsports-kpi-value">$0</div>
                <div className="groundfloorsports-kpi-label">Upfront Cost</div>
              </div>
            </div>
            <VideoShowcase
              compact
              title="Game Film Everywhere"
              sub="Footage is always in motion so players and creators instantly feel the product value."
              ctaLabel="Browse More Clips"
              ctaHref="/marketplace"
            />
          </div>
          <aside className="groundfloorsports-panel">
            <h3>groundfloorsports — My Uploads</h3>
            <div className="groundfloorsports-flow">Upload <span>→</span> AI Processing <span>→</span> Review <span>→</span> Live</div>
            <div className="groundfloorsports-list">
              <div>Blake Souza #20 - Goal <strong>GOAL $10.00</strong></div>
              <div>Andrew Brim #2 - Goal <strong>GOAL $10.00</strong></div>
              <div>LAMBERT - Play <strong>OTHER $20.00</strong></div>
              <div>#1 - Goal <strong>GOAL $10.00</strong></div>
            </div>
            <div className="groundfloorsports-status">
              <h4>Processing Status</h4>
              <div className="groundfloorsports-status-grid">
                <div><strong>3</strong><span>In Queue</span></div>
                <div><strong>~4 min</strong><span>Est. Time</span></div>
                <div><strong>12</strong><span>Done Today</span></div>
              </div>
              <p>Online. Busy — not broken. Your clips are processing.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="groundfloorsports-section" id="how-it-works">
        <div className="groundfloorsports-wrap">
          <h2>How It Works</h2>
          <p>Four Steps From Game Day to Highlights</p>
          <div className="groundfloorsports-steps">
            <article><span>01</span><h3>Upload Your Film</h3><p>Drop your game footage, add game info, and hit upload.</p></article>
            <article><span>02</span><h3>AI Analyzes Everything</h3><p>AI identifies highlights and suggests player tags from your roster.</p></article>
            <article><span>03</span><h3>Review &amp; Publish</h3><p>Creators verify AI suggestions, make quick corrections, and publish.</p></article>
            <article><span>04</span><h3>Players Get Their Clips</h3><p>Players find clips by name or jersey number and purchase instantly.</p></article>
          </div>
        </div>
      </section>

      <section className="groundfloorsports-section compact" id="why-gfs">
        <div className="groundfloorsports-wrap">
          <h2>Why groundfloorsports</h2>
          <div className="groundfloorsports-grid-2">
            <div className="groundfloorsports-card">
              <h3>For Players</h3>
              <p>Your highlights, straight to your account. Find your plays fast, build recruiting-ready reels, and download HD clips.</p>
              <Link href="/marketplace" className="hero-btn primary">Find My Clips</Link>
            </div>
            <div className="groundfloorsports-card">
              <h3>For Creators</h3>
              <p>Upload once, earn on every clip. groundfloorsports takes 15%, creators keep the rest, and there is no upfront cost.</p>
              <Link href="/sign-in?next=%2Fseller%2Fonboarding" className="hero-btn">Start as a Creator</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="groundfloorsports-section compact" id="founder-note">
        <div className="groundfloorsports-wrap quote">
          <p>
            I&apos;m a sports videographer — filming games is what I do. Kids kept asking for clips,
            and there was never an easy way to deliver them quickly. So I built this flow:
            one upload, AI analyzes, clips go straight to players.
          </p>
          <div>Greg — Founder</div>
        </div>
      </section>

      <section className="groundfloorsports-section compact audience-gateway-shell" id="audience-gateway">
        <div className="groundfloorsports-wrap audience-gateway-wrap">
          <p className="hero-eyebrow">Choose your lane</p>
          <h2>Start as Creator or Athlete/Fan</h2>
          <p className="groundfloorsports-sub">
            Pick the experience that matches you. Creators upload and monetize game film.
            Athletes and fans discover highlights, buy clips, and build collections.
          </p>

          <div className="audience-gateway-grid">
            <article className="audience-gateway-card creators">
              <p className="audience-label">For creators</p>
              <h3>Upload footage. Publish clips. Earn on every play.</h3>
              <p>
                Use the creator dashboard to upload game footage, review AI-assisted clips,
                and push live content to marketplace search.
              </p>
              <div className="hero-actions">
                <Link href="/sign-in?next=%2Fseller%2Fonboarding" className="hero-btn primary">Open Creator Dashboard</Link>
                <Link href="/seller/onboarding?view=setup" className="hero-btn">Creator Setup</Link>
              </div>
            </article>

            <article className="audience-gateway-card athletes-fans">
              <p className="audience-label">For athletes and fans</p>
              <h3>Find your moments. Buy clips. Build your reel.</h3>
              <p>
                Search by player, jersey, or team in the marketplace, then purchase and
                download clips or claim your athlete profile.
              </p>
              <div className="hero-actions">
                <Link href="/marketplace" className="hero-btn primary">Explore Marketplace</Link>
                <Link href="/athletes/claim-profile" className="hero-btn">Claim Athlete Profile</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="groundfloorsports-section cta" id="get-started">
        <div className="groundfloorsports-wrap">
          <h2>One Upload. Everyone Gets What They Want.</h2>
          <p>Creators upload once. AI does the heavy lifting. Players get their clips.</p>
          <div className="hero-actions">
            <Link href="/sign-in?next=%2Fseller%2Fonboarding" className="hero-btn primary">Get Started Free</Link>
            <Link href="/marketplace" className="hero-btn">Explore Marketplace</Link>
          </div>
        </div>
      </section>

        </div>

        <aside className="home-side-column home-side-quick" aria-label="Quick actions">
          <p className="home-side-title">Quick actions</p>
          <Link href="/marketplace" className="home-side-cta">Browse Clips</Link>
          <Link href="/sign-in?next=%2Fseller%2Fonboarding" className="home-side-cta">Creator Dashboard</Link>
          <Link href="/athletes/claim-profile" className="home-side-cta">Claim Athlete Profile</Link>
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}
