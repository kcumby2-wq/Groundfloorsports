'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '@/components/gfs/SiteHeader';
import SiteFooter from '@/components/gfs/SiteFooter';
import { getFunnelSessionId, initClientEventAutoFlush, trackClientEvent } from '@/lib/clientEventTracker';

const TRACKING_SOURCE = 'gfs_marketplace_app';

function applyFilters(router, pathname, params, overrides = {}) {
  const next = new URLSearchParams(params.toString());
  const currentPlayer = params.get('player') || 'all';
  const currentClipType = params.get('clip_type') || 'All clips';

  const playerValue = Object.prototype.hasOwnProperty.call(overrides, 'player') ? overrides.player : currentPlayer;
  const clipTypeValue = Object.prototype.hasOwnProperty.call(overrides, 'clipType') ? overrides.clipType : currentClipType;

  if (!playerValue || playerValue === 'all') {
    next.delete('player');
  } else {
    next.set('player', playerValue);
  }

  if (!clipTypeValue || clipTypeValue === 'All clips') {
    next.delete('clip_type');
  } else {
    next.set('clip_type', clipTypeValue);
  }

  next.delete('page');
  const query = next.toString();
  router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
}

export default function GameDetailPage({ slug }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [fullGameCheckout, setFullGameCheckout] = useState({
    isSubmitting: false,
    message: '',
    error: '',
  });

  const player = searchParams.get('player') || 'all';
  const clipType = searchParams.get('clip_type') || 'All clips';

  function trackMarketEvent(eventName, detail = {}) {
    const funnelSessionId = getFunnelSessionId();
    trackClientEvent(eventName, {
      ...detail,
      funnelSessionId,
      route: '/marketplace/games/[slug]',
      gameSlug: slug,
    }, TRACKING_SOURCE);
  }

  useEffect(() => {
    const stopAutoFlush = initClientEventAutoFlush(TRACKING_SOURCE);
    return stopAutoFlush;
  }, []);

  useEffect(() => {
    const query = new URLSearchParams();
    if (player && player !== 'all') {
      query.set('player', player);
    }
    if (clipType && clipType !== 'All clips') {
      query.set('clip_type', clipType);
    }

    const endpoint = `/api/games/${slug}${query.toString() ? `?${query.toString()}` : ''}`;
    let canceled = false;

    async function load() {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(endpoint, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Unable to load game data.');
        }
        const data = await response.json();
        if (!canceled) {
          setPayload(data);
        }
      } catch (err) {
        if (!canceled) {
          setError(err instanceof Error ? err.message : 'Unexpected error while loading game data.');
        }
      } finally {
        if (!canceled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      canceled = true;
    };
  }, [slug, player, clipType]);

  const players = payload?.players || [];
  const clipTypes = payload?.clipTypes || [];
  const clips = payload?.clips || [];

  const activePlayerName = useMemo(() => {
    if (player === 'all') {
      return 'All players';
    }
    const selected = players.find((item) => item.id === player);
    return selected ? selected.name : 'All players';
  }, [player, players]);

  function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleWatchGameClick() {
    applyFilters(router, pathname, searchParams, {
      player: 'all',
      clipType: 'All clips',
    });
    scrollToSection('game-clips-list');
  }

  function handlePlayerInsightsClick() {
    applyFilters(router, pathname, searchParams, {
      player: 'all',
      clipType: 'All clips',
    });
    scrollToSection('game-player-insights');
  }

  async function handleFullGamePurchase() {
    trackMarketEvent('marketplace_purchase_intent', {
      intent: 'checkout_start',
      purchaseKind: 'full_game',
      location: 'game_detail_full_game_offer',
    });

    trackMarketEvent('marketplace_purchase_intent', {
      intent: 'buy_full_game_click',
      location: 'game_detail_full_game_offer',
    });

    setFullGameCheckout({ isSubmitting: true, message: '', error: '' });

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameSlug: slug,
          purchaseKind: 'full_game',
          returnPath: `${window.location.pathname}${window.location.search}`,
        }),
      });

      if (response.status === 401) {
        const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/sign-in?redirect_url=${redirectUrl}`;
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to create full game order.');
      }

      if (data?.checkout?.url) {
        trackMarketEvent('marketplace_checkout_redirected', {
          purchaseKind: 'full_game',
          orderId: data?.order?.id || null,
          checkoutProvider: data?.checkout?.provider || 'stripe',
        });
        window.location.href = data.checkout.url;
        return;
      }

      trackMarketEvent('marketplace_checkout_completed', {
        purchaseKind: 'full_game',
        orderId: data?.order?.id || null,
        totalAmount: data?.order?.total_amount || null,
      });

      setFullGameCheckout({
        isSubmitting: false,
        message: `${data.message} Order ID: ${data.order.id}`,
        error: '',
      });
    } catch (err) {
      trackMarketEvent('marketplace_checkout_failed', {
        purchaseKind: 'full_game',
        message: err instanceof Error ? err.message : 'Unexpected full game checkout error.',
      });

      setFullGameCheckout({
        isSubmitting: false,
        message: '',
        error: err instanceof Error ? err.message : 'Unexpected full game checkout error.',
      });
    }
  }

  return (
    <main className="gfs-page">
      <SiteHeader active="marketplace" />
      <section className="game-detail-shell">
        <p className="hero-eyebrow">Game Folder</p>

        {isLoading && <p className="game-detail-loading">Loading game data...</p>}
        {error && <p className="game-detail-error">{error}</p>}

        {!isLoading && !error && payload && (
          <>
            <div className="game-detail-headline">
              <p className="game-detail-sport">{payload.game.sport}</p>
              <h1 className="game-detail-title">{payload.game.name}</h1>
              <p className="game-detail-date">{payload.game.dateLabel}</p>
            </div>

            <div className="game-kpi-row">
              <div className="game-kpi"><strong>{payload.game.clipsCount}</strong><span>Clips</span></div>
              <div className="game-kpi"><strong>{payload.game.photosCount}</strong><span>Photos</span></div>
              <div className="game-kpi"><strong>{payload.game.playersCount}</strong><span>Players</span></div>
            </div>

            <div className="game-action-row">
              <button className="hero-btn primary" type="button" onClick={handleWatchGameClick}>Watch Game</button>
              <button className="hero-btn" type="button" onClick={handlePlayerInsightsClick}>Player Insights</button>
            </div>

            <div className="game-layout">
              <aside className="game-sidebar" id="game-player-insights">
                <p className="game-sidebar-title">Players</p>
                <button
                  type="button"
                  className={player === 'all' ? 'player-filter active' : 'player-filter'}
                  onClick={() => applyFilters(router, pathname, searchParams, { player: 'all', clipType: 'All clips' })}
                >
                  All players <span>{players.length}</span>
                </button>

                {players.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={player === item.id ? 'player-filter active' : 'player-filter'}
                    onClick={() => applyFilters(router, pathname, searchParams, { player: item.id, clipType: 'All clips' })}
                  >
                    <span>#{item.jersey} {item.name}</span>
                    <span>{item.clipCount}</span>
                  </button>
                ))}
              </aside>

              <section className="game-main">
                <div className="game-clip-filters">
                  {clipTypes.map((label) => (
                    <button
                      key={label}
                      type="button"
                      className={clipType === label ? 'filter-pill active' : 'filter-pill'}
                      onClick={() => applyFilters(router, pathname, searchParams, { clipType: label })}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <p className="results-status">{payload.visibleClips} clips visible for {activePlayerName}</p>

                <div className="clip-list" id="game-clips-list">
                  {clips.map((clip) => (
                    <article className="clip-row" key={clip.id}>
                      <div>
                        <Link
                          className="clip-title-link"
                          href={`/marketplace/games/${slug}/clips/${clip.id}`}
                          onClick={() => {
                            trackMarketEvent('marketplace_purchase_intent', {
                              intent: 'open_clip_detail',
                              clipId: clip.id,
                              clipType: clip.clipType,
                              location: 'clip_title',
                            });
                          }}
                        >
                          <p className="clip-title">{clip.title}</p>
                        </Link>
                        <p className="clip-meta">#{clip.jersey} · {clip.playerName} · {clip.eventType}</p>
                      </div>
                      <div className="clip-price-wrap">
                        <span className="clip-price">${clip.price.toFixed(2)}</span>
                        <Link
                          className="clip-add"
                          href={`/marketplace/games/${slug}/clips/${clip.id}`}
                          onClick={() => {
                            trackMarketEvent('marketplace_purchase_intent', {
                              intent: 'open_clip_purchase',
                              clipId: clip.id,
                              clipType: clip.clipType,
                              location: 'clip_add_button',
                            });
                          }}
                        >
                          Add
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <section className="full-game-offer">
              <div>
                <p className="hero-eyebrow">Whole Game Offer</p>
                <h2 className="page-title game-offer-title">{payload.game.fullGameOffer.title}</h2>
                <p className="page-sub">Bundle all clips from this game into one purchase for families and coaches.</p>
              </div>
              <div className="offer-buy">
                <span className="offer-price">${payload.game.fullGameOffer.price.toFixed(2)}</span>
                <button
                  type="button"
                  className="hero-btn primary"
                  onClick={handleFullGamePurchase}
                  disabled={fullGameCheckout.isSubmitting}
                >
                  {fullGameCheckout.isSubmitting ? 'Processing...' : 'Buy Full Game'}
                </button>
              </div>
            </section>

            {fullGameCheckout.message && <p className="checkout-success">{fullGameCheckout.message}</p>}
            {fullGameCheckout.error && <p className="game-detail-error">{fullGameCheckout.error}</p>}
          </>
        )}

        <div className="hero-actions">
          <Link href="/marketplace" className="hero-btn">Back To Marketplace</Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
