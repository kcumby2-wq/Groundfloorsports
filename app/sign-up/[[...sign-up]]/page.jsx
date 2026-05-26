import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import AuthBrandPanel from '@/components/gfs/AuthBrandPanel';
import { clerkAppearance } from '@/components/gfs/clerkAppearance';

const ALLOWED_ROLES = new Set(['fan', 'athlete', 'seller']);

export default async function SignUpPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const roleParam = resolvedSearchParams?.role;
  const role = typeof roleParam === 'string' && ALLOWED_ROLES.has(roleParam) ? roleParam : 'fan';

  return (
    <main className="auth-page">
      <AuthBrandPanel mode="sign-up" />
      <section className="auth-panel">
        <div className="auth-card-wrap">
          <div className="auth-eyebrow">Create Account</div>
          <h2 className="auth-title">Join <span className="magenta">GFS.</span></h2>
          <p className="auth-sub">Set up your account in under a minute.</p>
          <div className="hero-actions">
            <Link href="/" className="hero-btn">Back To Home</Link>
          </div>
          <div className="role-switch-row">
            <a href="/sign-up?role=fan" className={role === 'fan' ? 'role-switch active' : 'role-switch'}>Fan</a>
            <a href="/sign-up?role=athlete" className={role === 'athlete' ? 'role-switch active' : 'role-switch'}>Athlete</a>
            <a href="/sign-up?role=seller" className={role === 'seller' ? 'role-switch active' : 'role-switch'}>Seller</a>
          </div>
          <div className="clerk-shell">
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              forceRedirectUrl={role === 'seller' ? '/seller/onboarding' : role === 'athlete' ? '/athletes/claim-profile' : '/marketplace'}
              unsafeMetadata={{ role }}
              appearance={clerkAppearance}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
