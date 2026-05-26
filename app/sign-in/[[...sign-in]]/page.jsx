import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import AuthBrandPanel from '@/components/gfs/AuthBrandPanel';
import { clerkAppearance } from '@/components/gfs/clerkAppearance';

function getSafeRedirect(nextValue) {
  if (typeof nextValue !== 'string' || !nextValue.trim()) {
    return '/marketplace';
  }

  if (!nextValue.startsWith('/') || nextValue.startsWith('//') || nextValue.includes('://')) {
    return '/marketplace';
  }

  return nextValue;
}

export default async function SignInPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const nextParam = resolvedSearchParams?.next;
  const redirectUrl = getSafeRedirect(nextParam);

  return (
    <main className="auth-page">
      <AuthBrandPanel mode="sign-in" />
      <section className="auth-panel">
        <div className="auth-card-wrap">
          <div className="auth-eyebrow">Sign In</div>
          <h2 className="auth-title">Welcome <span className="magenta">back.</span></h2>
          <p className="auth-sub">Sign in to your GroundfloorSports account to continue.</p>
          <div className="hero-actions">
            <Link href="/" className="hero-btn">Back To Home</Link>
          </div>
          <div className="clerk-shell">
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              forceRedirectUrl={redirectUrl}
              appearance={clerkAppearance}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
