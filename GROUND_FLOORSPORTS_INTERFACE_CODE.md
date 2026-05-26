# GroundfloorSports Interface Code Handoff

Use this file as a copy/paste handoff for Claude design exploration.

## Marketplace Interface (React + Tailwind example)

```tsx
import React from 'react';

export function MarketplaceInterface() {
  const featured = [
    { id: 1, title: 'Duncanville vs DeSoto', clips: 148, seller: 'SR', status: 'Live' },
    { id: 2, title: 'Pylon 7v7 Dallas', clips: 92, seller: 'PY', status: 'Hot' },
    { id: 3, title: 'Allen Spring Scrimmage', clips: 76, seller: 'SM', status: 'New' },
  ];

  const cards = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    title: `Game ${i + 1}`,
    meta: 'May 2026 · Football',
    clips: 40 + i * 9,
    seller: i % 2 === 0 ? 'SR' : 'SM',
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-xl font-bold tracking-widest">GROUNDFLOORSPORTS</div>
          <nav className="flex items-center gap-3">
            <button className="rounded-full border border-white/20 px-4 py-2 text-sm">Creator Login</button>
            <button className="rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-slate-900">Fan/Athlete Login</button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-pink-300">Marketplace</p>
            <h1 className="mt-2 text-4xl font-black uppercase leading-none">Find Your Game.</h1>
            <p className="mt-3 text-white/80">Search by player, jersey, team, or event to instantly find clips.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <input className="rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2" placeholder="Player/Jersey" />
              <input className="rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2" placeholder="Team/School" />
              <button className="rounded-xl bg-pink-500 px-4 py-2 font-semibold text-slate-900">Find Clips</button>
            </div>
          </div>

          <aside className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <h2 className="text-lg font-bold uppercase tracking-wider">Featured Drops</h2>
            <div className="mt-4 space-y-3">
              {featured.map((item) => (
                <article key={item.id} className="rounded-xl border border-white/15 bg-slate-900/60 p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className="rounded-full border border-pink-300/50 px-2 py-1 text-xs text-pink-200">{item.status}</span>
                  </div>
                  <div className="mt-2 text-sm text-white/70">{item.clips} clips · Seller {item.seller}</div>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article key={card.id} className="overflow-hidden rounded-2xl border border-white/15 bg-white/5">
              <div className="h-36 bg-gradient-to-br from-sky-500/40 to-pink-500/30" />
              <div className="p-4">
                <h3 className="font-semibold">{card.title}</h3>
                <p className="mt-1 text-sm text-white/70">{card.meta}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span>{card.clips} clips</span>
                  <span className="text-pink-200">{card.seller}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
```

## Groundfloor Admin Interface (React + Tailwind example)

```tsx
import React from 'react';

export function GroundfloorAdminInterface() {
  const users = [
    { id: 1, name: 'Greg Creator', email: 'greg@example.com', role: 'seller', created: 'May 1, 2026', lastSignIn: 'May 22, 2026' },
    { id: 2, name: 'Avery Athlete', email: 'avery@example.com', role: 'athlete', created: 'May 4, 2026', lastSignIn: 'May 21, 2026' },
    { id: 3, name: 'Fran Fan', email: 'fan@example.com', role: 'fan', created: 'May 7, 2026', lastSignIn: 'May 20, 2026' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-xl font-bold tracking-widest">GROUNDFLOOR ADMIN</div>
          <div className="flex gap-3">
            <button className="rounded-full border border-white/20 px-4 py-2 text-sm">Back to Site</button>
            <button className="rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-slate-900">Export CSV</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-pink-300">Monitoring</p>
          <h1 className="mt-2 text-4xl font-black uppercase leading-none">Account Operations</h1>
          <p className="mt-3 text-white/80">Track creators, athletes, and fans with role-based filters and sign-in visibility.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/15 bg-slate-900/60 p-4"><p className="text-3xl font-black">432</p><p className="text-xs uppercase tracking-wider text-white/70">Total</p></div>
            <div className="rounded-xl border border-white/15 bg-slate-900/60 p-4"><p className="text-3xl font-black">72</p><p className="text-xs uppercase tracking-wider text-white/70">Creators</p></div>
            <div className="rounded-xl border border-white/15 bg-slate-900/60 p-4"><p className="text-3xl font-black">118</p><p className="text-xs uppercase tracking-wider text-white/70">Athletes</p></div>
            <div className="rounded-xl border border-white/15 bg-slate-900/60 p-4"><p className="text-3xl font-black">242</p><p className="text-xs uppercase tracking-wider text-white/70">Fans</p></div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {['All Roles', 'seller', 'athlete', 'fan'].map((role) => (
              <button key={role} className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-wider">
                {role}
              </button>
            ))}
            <input className="ml-auto min-w-64 rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2" placeholder="Search name or email" />
          </div>

          <div className="mt-5 overflow-auto rounded-xl border border-white/15">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900/70 text-white/80">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Last Sign In</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-white/10">
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3 text-white/75">{user.email}</td>
                    <td className="px-4 py-3"><span className="rounded-full border border-pink-300/50 px-2 py-1 text-xs uppercase text-pink-200">{user.role}</span></td>
                    <td className="px-4 py-3 text-white/75">{user.created}</td>
                    <td className="px-4 py-3 text-white/75">{user.lastSignIn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
```
