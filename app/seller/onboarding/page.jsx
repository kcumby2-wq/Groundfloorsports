import Link from 'next/link';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/gfs/SiteHeader';
import SiteFooter from '@/components/gfs/SiteFooter';
import { getRoleFromClaims, hasRequiredRole } from '@/lib/roleAccess';
import CreatorUploadConsole from '@/app/seller/onboarding/CreatorUploadConsole';
import ActivateSellerAccessButton from '@/app/seller/onboarding/ActivateSellerAccessButton';
import VideoShowcase from '@/components/gfs/VideoShowcase';

export default async function SellerOnboardingPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const showSetupView = resolvedSearchParams?.view === 'setup';
  const hasClerkEnv = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );

  if (!hasClerkEnv) {
    return (
      <main className="gfs-page">
        <SiteHeader />
        <section className="hero-shell">
          <p className="hero-eyebrow">Seller Portal</p>
          <h1 className="hero-title">Configure Clerk</h1>
          <p className="hero-sub">Add Clerk keys in .env.local before testing protected seller routes.</p>
          <div className="hero-actions">
            <Link className="hero-btn primary" href="/sign-up?role=seller">Open Seller Sign Up</Link>
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

  let role = getRoleFromClaims(sessionClaims);

  if (!hasRequiredRole(role, ['seller'])) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const liveRole =
      (typeof user.publicMetadata?.role === 'string' && user.publicMetadata.role)
      || (typeof user.unsafeMetadata?.role === 'string' && user.unsafeMetadata.role)
      || role;
    role = liveRole;
  }

  return (
    <main className="gfs-page">
      <SiteHeader />
      <section className="hero-shell">
        <p className="hero-eyebrow">Seller Portal</p>
        <h1 className="hero-title">Seller onboarding</h1>
        <VideoShowcase
          compact
          title="Creator Broadcast Wall"
          sub="Active game footage up front so creators can instantly see what kind of moments sell best."
        />
        {!hasRequiredRole(role, ['seller']) || showSetupView ? (
          <>
            {!hasRequiredRole(role, ['seller']) ? (
              <>
                <p className="hero-sub">
                  Your current role is <span className="magenta">{role}</span>. This route requires <span className="magenta">seller</span> metadata.
                </p>
                <div className="hero-actions">
                  <ActivateSellerAccessButton />
                  <Link className="hero-btn" href="/marketplace">Back To Marketplace</Link>
                </div>
              </>
            ) : (
              <>
                <p className="hero-sub">
                  You are viewing creator setup. Use this screen any time you want to return to the pre-upload dashboard.
                </p>
                <div className="hero-actions">
                  <Link className="hero-btn primary" href="/seller/onboarding">Go To Upload Console</Link>
                  <Link className="hero-btn" href="/marketplace">Back To Marketplace</Link>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <p className="hero-sub">
              Role check passed. Upload clips as draft or publish them directly to marketplace search.
            </p>
            <div className="hero-actions">
              <Link className="hero-btn" href="/seller/onboarding?view=setup">Back To Creator Setup</Link>
              <Link className="hero-btn" href="/marketplace">Back To Marketplace</Link>
            </div>
            <CreatorUploadConsole />
          </>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
