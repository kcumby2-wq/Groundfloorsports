# Clerk Next.js Quickstart (Saved Reference)

Source: https://clerk.com/docs/nextjs/getting-started/quickstart  
Saved: 2026-05-22

## 1. Create a new Next.js app
```bash
npm create next-app@latest clerk-nextjs -- --yes
cd clerk-nextjs
npm install
```

## 2. Install Clerk SDK
```bash
npm install @clerk/nextjs
```

## 3. Add Clerk middleware
Create `proxy.ts` (or `middleware.ts` for Next.js <= 15) and export `clerkMiddleware()`.

```ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
}
```

## 4. Add `<ClerkProvider>` to app layout
Wrap app layout with `ClerkProvider` in `app/layout.tsx` and add Clerk UI components like:
- `SignInButton`
- `SignUpButton`
- `UserButton`
- `Show when="signed-in"` and `Show when="signed-out"`

## 5. Run locally
```bash
npm run dev
```

## 6. Create first user
Open http://localhost:3000 and complete sign-up flow.

## Notes
- Routes are public by default until you explicitly protect them.
- Use Clerk dashboard to claim/configure development keys.
- Official example repo: https://github.com/clerk/clerk-nextjs-app-quickstart
