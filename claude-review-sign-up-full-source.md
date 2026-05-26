<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign Up - GroundfloorSports</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<!--
  GFS Sign-Up Page
  Static HTML prototype. Designed for Clerk integration.

  Engineer notes:
  - Page route: /sign-up
  - Clerk components map: <SignUp /> from @clerk/nextjs replaces the form
  - Account type selector (Fan/Seller/Athlete) drives post-signup routing:
      Fan -> /marketplace
      Seller -> /seller/onboarding (requires Stripe Connect setup)
      Athlete -> /athletes/claim-profile (curation workflow)
  - Store account type as Clerk publicMetadata.role at signup
  - Password validation matches Clerk default policy (8+ chars)
-->
<style>
:root{
  --navy:#0a1628;--navy-deep:#050b16;--navy-card:#0e1d33;
  --magenta:#ec4899;--magenta-light:#f472b6;--magenta-dim:rgba(236,72,153,.18);
  --blue:#4db8ff;--coral:#ff7849;--gold:#d4a84a;
  --white:#fff;--muted:rgba(255,255,255,.62);--muted-strong:rgba(255,255,255,.82);
  --line:rgba(255,255,255,.1);--pill-bg:rgba(255,255,255,.04);--pill-border:rgba(255,255,255,.14);
  --input-bg:rgba(255,255,255,.04);--input-border:rgba(255,255,255,.14);
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;color:var(--white);background:var(--navy-deep);line-height:1.55;min-height:100vh}
a{text-decoration:none;color:inherit}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
input,select{font-family:inherit;outline:none}

.page{min-height:100vh;display:grid;grid-template-columns:1.1fr 1fr}

/* LEFT - Brand panel */
.brand-panel{position:relative;padding:60px 56px;display:flex;flex-direction:column;justify-content:space-between;background:
  radial-gradient(ellipse 700px 500px at 30% 30%,rgba(236,72,153,.20) 0%,transparent 60%),
  radial-gradient(ellipse 500px 400px at 80% 80%,rgba(77,184,255,.10) 0%,transparent 50%),
  linear-gradient(135deg,var(--navy-deep) 0%,var(--navy) 100%);
  overflow:hidden}
.brand-panel::before{content:'';position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(236,72,153,.15),transparent 70%);pointer-events:none}
.brand-logo{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.08em;display:flex;align-items:center;gap:10px;position:relative;z-index:2}
.brand-logo span{color:var(--magenta)}
.brand-logo-mark{width:32px;height:32px;border:2px solid var(--magenta);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--magenta);font-size:14px;background:rgba(236,72,153,.08)}

.brand-hero{position:relative;z-index:2;max-width:520px}
.brand-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;letter-spacing:.25em;color:var(--magenta);text-transform:uppercase;font-weight:700;margin-bottom:24px;padding:7px 13px;border:1px solid var(--magenta);border-radius:30px;background:rgba(236,72,153,.06)}
.brand-eyebrow::before{content:'';width:6px;height:6px;background:var(--magenta);border-radius:50%;box-shadow:0 0 12px var(--magenta)}
.brand-headline{font-family:'Bebas Neue',sans-serif;font-size:80px;line-height:.9;letter-spacing:-.005em;text-transform:uppercase;margin-bottom:22px}
.brand-headline .magenta{color:var(--magenta)}
.brand-sub{font-size:16px;color:var(--muted-strong);line-height:1.55;max-width:440px;margin-bottom:32px}

.benefits{display:flex;flex-direction:column;gap:14px;margin-top:8px}
.benefit{display:flex;gap:14px;align-items:flex-start}
.benefit-icon{width:36px;height:36px;border-radius:8px;background:rgba(236,72,153,.12);border:1px solid var(--magenta-dim);display:flex;align-items:center;justify-content:center;color:var(--magenta);flex-shrink:0}
.benefit-icon svg{width:18px;height:18px}
.benefit-text{flex:1}
.benefit-title{font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:.04em;margin-bottom:2px}
.benefit-desc{font-size:12px;color:var(--muted);line-height:1.5}

.brand-footer{position:relative;z-index:2;font-size:11px;color:var(--muted);letter-spacing:.18em;text-transform:uppercase}

/* RIGHT - Auth form */
.auth-panel{padding:40px 56px;display:flex;flex-direction:column;justify-content:center;background:var(--navy);overflow-y:auto}
.auth-form{max-width:440px;margin:0 auto;width:100%}
.auth-header{margin-bottom:24px}
.auth-eyebrow{font-size:11px;letter-spacing:.28em;color:var(--magenta);text-transform:uppercase;font-weight:700;margin-bottom:10px}
.auth-title{font-family:'Bebas Neue',sans-serif;font-size:40px;line-height:1;letter-spacing:-.005em;margin-bottom:8px;text-transform:uppercase}
.auth-title .magenta{color:var(--magenta)}
.auth-sub{font-size:14px;color:var(--muted-strong);line-height:1.5}

/* Social */
.social-btns{display:flex;flex-direction:column;gap:10px;margin-bottom:18px}
.social-btn{display:flex;align-items:center;justify-content:center;gap:10px;padding:12px 16px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;font-size:13.5px;color:var(--white);transition:all .2s;width:100%}
.social-btn:hover{border-color:var(--magenta);background:rgba(236,72,153,.04)}
.social-btn svg{width:18px;height:18px}

.divider{display:flex;align-items:center;gap:12px;margin:16px 0;color:var(--muted);font-size:11px;letter-spacing:.2em;text-transform:uppercase}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--line)}

/* Account type selector */
.account-type{margin-bottom:18px}
.account-type-label{font-size:11px;letter-spacing:.18em;color:var(--muted);text-transform:uppercase;font-weight:600;margin-bottom:8px}
.account-type-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
.type-card{background:var(--input-bg);border:1px solid var(--input-border);border-radius:9px;padding:11px 8px;cursor:pointer;text-align:center;transition:all .15s}
.type-card:hover{border-color:rgba(255,255,255,.25)}
.type-card.active{border-color:var(--magenta);background:rgba(236,72,153,.06)}
.type-card.active .type-name{color:var(--magenta)}
.type-name{font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:.06em;color:var(--white);margin-bottom:2px}
.type-desc{font-size:9px;color:var(--muted);line-height:1.3}

/* Form fields */
.field-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
.field{margin-bottom:14px}
.field-label{display:block;font-size:11px;letter-spacing:.18em;color:var(--muted);text-transform:uppercase;font-weight:600;margin-bottom:6px}
.field-label .optional{color:var(--muted);font-size:9px;margin-left:4px;font-weight:400;text-transform:none;letter-spacing:0}
.input{width:100%;padding:12px 14px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;color:var(--white);font-size:14px;transition:border-color .2s}
.input:focus{border-color:var(--magenta);background:rgba(236,72,153,.04)}
.input::placeholder{color:var(--muted)}

.phone-row{display:grid;grid-template-columns:90px 1fr;gap:8px}
.phone-row select{padding:12px 10px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;color:var(--white);font-size:14px;cursor:pointer}

.field-helper{font-size:11px;color:var(--muted);margin-top:6px;line-height:1.4}

/* Submit */
.submit-btn{width:100%;padding:14px 16px;background:var(--magenta);color:var(--navy-deep);font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:.18em;border-radius:10px;text-transform:uppercase;font-weight:700;margin-top:8px;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 0 30px rgba(236,72,153,.3)}
.submit-btn:hover{background:var(--magenta-light);transform:translateY(-1px);box-shadow:0 4px 30px rgba(236,72,153,.45)}
.submit-btn .arrow{font-size:16px}

.terms{font-size:11px;color:var(--muted);text-align:center;margin-top:14px;line-height:1.5}
.terms a{color:var(--magenta);transition:color .2s}
.terms a:hover{color:var(--magenta-light)}

.auth-footer{margin-top:20px;text-align:center;font-size:13px;color:var(--muted-strong)}
.auth-footer a{color:var(--magenta);font-weight:600;transition:color .2s}
.auth-footer a:hover{color:var(--magenta-light)}
.secured-by{margin-top:24px;text-align:center;font-size:10px;color:var(--muted);letter-spacing:.18em;text-transform:uppercase}
.secured-by strong{color:var(--muted-strong);font-weight:600}

/* Mobile */
@media(max-width:900px){
  .page{grid-template-columns:1fr}
  .brand-panel{display:none}
  .auth-panel{padding:30px 24px}
  .field-row{grid-template-columns:1fr}
}
</style>
</head>
<body>

<div class="page">

  <!-- BRAND PANEL -->
  <div class="brand-panel">
    <a href="Subjectreport.html" class="brand-logo">
      <span class="brand-logo-mark">G</span>
      GROUNDFLOOR<span>SPORTS</span>
    </a>

    <div class="brand-hero">
      <div class="brand-eyebrow">Get started</div>
      <h1 class="brand-headline">Every play.<br><span class="magenta">Ownable.</span></h1>
      <p class="brand-sub">Create your account to browse clips, build athlete profiles, claim NFT drops, or list your captured footage.</p>

      <div class="benefits">
        <div class="benefit">
          <div class="benefit-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          </div>
          <div class="benefit-text">
            <div class="benefit-title">Find Your Clips</div>
            <div class="benefit-desc">Search 4,000+ tagged clips by jersey number, team, or game</div>
          </div>
        </div>
        <div class="benefit">
          <div class="benefit-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div class="benefit-text">
            <div class="benefit-title">Claim NFT Drops</div>
            <div class="benefit-desc">Own commercial-grade moments. Athlete-favored splits.</div>
          </div>
        </div>
        <div class="benefit">
          <div class="benefit-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.8 1 6.5 2.5"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="benefit-text">
            <div class="benefit-title">Sell Your Footage</div>
            <div class="benefit-desc">Set your own prices. Single clips, season packs, circuit bundles.</div>
          </div>
        </div>
      </div>
    </div>

    <div class="brand-footer">A Subject Ecosystem Brand . SR . SM . TOJ . GFS</div>
  </div>

  <!-- AUTH PANEL -->
  <div class="auth-panel">
    <div class="auth-form">
      <div class="auth-header">
        <div class="auth-eyebrow">Create Account</div>
        <h2 class="auth-title">Join <span class="magenta">GFS.</span></h2>
        <p class="auth-sub">Set up your account in under a minute. You can upgrade to seller or athlete after.</p>
      </div>

      <!-- Social sign-up options -->
      <div class="social-btns">
        <button class="social-btn" type="button" data-clerk-provider="google">
          <svg viewBox="0 0 24 24" fill="none"><path d="M22 12.27c0-.78-.07-1.53-.2-2.27H12v4.5h5.62c-.24 1.3-.97 2.4-2.07 3.14v2.6h3.35c1.96-1.8 3.1-4.47 3.1-7.97z" fill="#4285F4"/><path d="M12 22c2.8 0 5.15-.93 6.87-2.52l-3.35-2.6c-.93.62-2.12.99-3.52.99-2.71 0-5-1.83-5.82-4.29H2.74v2.69A10 10 0 0 0 12 22z" fill="#34A853"/><path d="M6.18 13.58A6 6 0 0 1 5.86 12c0-.55.1-1.08.32-1.58V7.73H2.74A10 10 0 0 0 2 12c0 1.61.38 3.14 1.06 4.5l3.12-2.92z" fill="#FBBC05"/><path d="M12 5.94c1.53 0 2.9.52 3.97 1.55l2.97-2.97A9.84 9.84 0 0 0 12 2 10 10 0 0 0 2.74 7.73l3.43 2.69A6 6 0 0 1 12 5.94z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
        <button class="social-btn" type="button" data-clerk-provider="apple">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.04c-.03-3 2.45-4.45 2.56-4.52-1.4-2.04-3.57-2.32-4.34-2.35-1.85-.19-3.61 1.09-4.55 1.09-.95 0-2.4-1.06-3.95-1.03C4.7 5.27 2.85 6.43 1.85 8.27c-1.97 3.42-.5 8.46 1.4 11.22.94 1.36 2.04 2.87 3.5 2.82 1.4-.06 1.94-.91 3.64-.91 1.69 0 2.18.91 3.67.88 1.52-.03 2.48-1.37 3.4-2.74 1.07-1.57 1.51-3.1 1.54-3.18-.03-.01-2.97-1.14-3-4.52zM14.5 4.07c.76-.94 1.28-2.23 1.13-3.51-1.1.05-2.43.74-3.22 1.67-.71.82-1.33 2.14-1.17 3.4 1.23.1 2.49-.62 3.26-1.56z"/></svg>
          Continue with Apple
        </button>
      </div>

      <div class="divider">or use email</div>

      <!-- Account type selector -->
      <div class="account-type">
        <div class="account-type-label">I'm here to</div>
        <div class="account-type-grid">
          <button type="button" class="type-card active" data-role="fan">
            <div class="type-name">Buy &amp; Browse</div>
            <div class="type-desc">Find clips of my athlete</div>
          </button>
          <button type="button" class="type-card" data-role="athlete">
            <div class="type-name">Claim Profile</div>
            <div class="type-desc">I'm an athlete</div>
          </button>
          <button type="button" class="type-card" data-role="seller">
            <div class="type-name">Sell Footage</div>
            <div class="type-desc">Capture brand or circuit</div>
          </button>
        </div>
      </div>

      <!-- Name fields -->
      <div class="field-row">
        <div class="field">
          <label class="field-label">First name</label>
          <input type="text" class="input" placeholder="First" autocomplete="given-name">
        </div>
        <div class="field">
          <label class="field-label">Last name</label>
          <input type="text" class="input" placeholder="Last" autocomplete="family-name">
        </div>
      </div>

      <!-- Email -->
      <div class="field">
        <label class="field-label">Email address</label>
        <input type="email" class="input" placeholder="you@example.com" autocomplete="email">
      </div>

      <!-- Phone (optional) -->
      <div class="field">
        <label class="field-label">Phone number <span class="optional">(optional)</span></label>
        <div class="phone-row">
          <select aria-label="Country code">
            <option value="+1">+1 US</option>
            <option value="+44">+44 UK</option>
            <option value="+61">+61 AU</option>
            <option value="+1">+1 CA</option>
          </select>
          <input type="tel" class="input" placeholder="(555) 123-4567" autocomplete="tel">
        </div>
      </div>

      <!-- Password -->
      <div class="field">
        <label class="field-label">Password</label>
        <input type="password" class="input" placeholder="........" autocomplete="new-password">
        <div class="field-helper">Must contain 8 or more characters.</div>
      </div>

      <button class="submit-btn" type="submit">Create Account <span class="arrow">-></span></button>

      <div class="terms">
        By signing up, you agree to our <a href="preview-route.html?path=%2Fterms">Terms</a>, <a href="preview-route.html?path=%2Fprivacy">Privacy Policy</a>, and <a href="preview-route.html?path=%2Fnil">NIL Policy</a>.
      </div>

      <div class="auth-footer">
        Already have an account? <a href="sign-in.html">Sign in</a>
      </div>

      <div class="secured-by">Secured by <strong>Clerk</strong></div>
    </div>
  </div>

</div>

<script>
  // Simple account type selector for the prototype
  // In production, this maps to Clerk publicMetadata.role on signup
  document.querySelectorAll('.type-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.type-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  (function () {
    if (window.location.protocol !== 'file:') return;

    const map = {
      '/forgot-password': 'preview-route.html?path=%2Fforgot-password',
      '/terms': 'preview-route.html?path=%2Fterms',
      '/privacy': 'preview-route.html?path=%2Fprivacy',
      '/nil': 'preview-route.html?path=%2Fnil'
    };

    document.querySelectorAll('a[href^="/"]').forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (map[href]) {
        link.setAttribute('href', map[href]);
      }
    });
  })();
</script>

</body>
</html>

`

## Prompt For Claude
`	ext
Review this full HTML source (structure + CSS + JS) for the page.

Please evaluate:
1. UX clarity and conversion flow
2. Accessibility (semantic structure, keyboard behavior, focus flow, contrast)
3. CSS maintainability and responsiveness
4. JavaScript reliability and edge cases
5. Security/privacy risks (especially for auth/admin pages)
6. Performance opportunities

Return:
1. Top 12 improvements ranked by impact
2. Quick wins under 30 minutes
3. Medium improvements (1-3 hours)
4. High-risk refactors to defer
5. Concrete code-level suggestions for top 3 issues
`
"@;

   = @"
# Sign-Up Full Source Review Packet

## Source File
- sign-up.html

## Full HTML Source
`html

