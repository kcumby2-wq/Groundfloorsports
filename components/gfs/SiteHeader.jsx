import Link from 'next/link';

export default function SiteHeader({ active = '' }) {
  return (
    <nav className="gfs-nav">
      <Link href="/" className="gfs-logo">
        <span className="gfs-logo-mark">G</span>
        GROUNDFLOOR<span>SPORTS</span>
      </Link>

      <div className="gfs-nav-links">
        <Link href="/" className={active === 'home' ? 'gfs-nav-link active' : 'gfs-nav-link'}>
          Home
        </Link>
        <Link href="/marketplace" className={active === 'marketplace' ? 'gfs-nav-link active' : 'gfs-nav-link'}>
          Marketplace
        </Link>
        <Link href="/demo" className={active === 'demo' ? 'gfs-nav-link active' : 'gfs-nav-link'}>
          Demo
        </Link>
        <Link href="/athletes/claim-profile" className="gfs-nav-link">Athletes</Link>
        <a href="#" className="gfs-nav-link">NFT Drops</a>
        <a href="#" className="gfs-nav-link">For Brands</a>
        <Link href="/seller/onboarding" className="gfs-nav-link">
          Creator Setup
        </Link>
        <Link href="/admin" className="gfs-nav-link">
          Groundfloor Admin
        </Link>
      </div>

      <div className="gfs-nav-auth-links">
        <Link href="/sign-in?next=%2Fseller%2Fonboarding" className={active === 'sign-in' ? 'gfs-nav-cta active' : 'gfs-nav-cta'}>
          Creator Login
        </Link>
        <Link href="/sign-in?next=%2Fmarketplace" className="gfs-nav-cta secondary">
          Fan/Athlete Login
        </Link>
      </div>
    </nav>
  );
}
