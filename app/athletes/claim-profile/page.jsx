import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/gfs/SiteHeader';
import SiteFooter from '@/components/gfs/SiteFooter';
import AthleteClaimForm from '@/components/gfs/AthleteClaimForm';
import { getRoleFromClaims, hasRequiredRole } from '@/lib/roleAccess';

export default async function ClaimAthleteProfilePage() {
  const hasClerkEnv = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );

  if (!hasClerkEnv) {
    return (
      <main className="gfs-page">
        <SiteHeader />
        <section className="hero-shell">
          <p className="hero-eyebrow">Athlete Access</p>
          <h1 className="hero-title">Configure Clerk</h1>
          <p className="hero-sub">Add Clerk keys in .env.local before testing protected athlete routes.</p>
          <div className="hero-actions">
            <Link className="hero-btn primary" href="/sign-up?role=athlete">Open Athlete Sign Up</Link>
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const role = getRoleFromClaims(sessionClaims);

  return (
    <main className="gfs-page">
      <SiteHeader />
      <section className="hero-shell">
        <p className="hero-eyebrow">Athlete Access</p>
        <h1 className="hero-title">Claim your profile</h1>
        {!hasRequiredRole(role, ['athlete']) ? (
          <>
            <p className="hero-sub">
              Your current role is <span className="magenta">{role}</span>. This route requires <span className="magenta">athlete</span> metadata.
            </p>
            <div className="hero-actions">
              <Link className="hero-btn primary" href="/sign-up?role=athlete">Switch To Athlete Sign Up</Link>
              <Link className="hero-btn" href="/marketplace">Back To Marketplace</Link>
            </div>
          </>
        ) : (
          <>
            <p className="hero-sub">
              Role check passed. Fill out your partner profile template exactly once. You can return to update it anytime.
            </p>
            <AthleteClaimForm />
          </>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
