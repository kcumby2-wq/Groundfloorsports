'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/gfs/SiteHeader';
import SiteFooter from '@/components/gfs/SiteFooter';
import { getFunnelSessionId, initClientEventAutoFlush, trackClientEvent } from '@/lib/clientEventTracker';

const TRACKING_SOURCE = 'gfs_marketplace_app';

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function ClipPurchasePage({ slug, clipId }) {
  const [payload, setPayload] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutState, setCheckoutState] = useState({
    isSubmitting: false,
    message: '',
    error: '',
  });

  function trackMarketEvent(eventName, detail = {}) {
    const funnelSessionId = getFunnelSessionId();
    trackClientEvent(eventName, {
      ...detail,
      funnelSessionId,
      route: '/marketplace/games/[slug]/clips/[clipId]',
      gameSlug: slug,
      clipId,
    }, TRACKING_SOURCE);
  }

  useEffect(() => {
    const stopAutoFlush = initClientEventAutoFlush(TRACKING_SOURCE);
    return stopAutoFlush;
  }, []);

  async function handlePurchase(purchaseKind) {
    trackMarketEvent('marketplace_purchase_intent', {
      intent: 'checkout_start',
      purchaseKind,
      location: 'clip_purchase_page',
    });

    setCheckoutState({ isSubmitting: true, message: '', error: '' });

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameSlug: slug,
          clipId,
          purchaseKind,
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
        throw new Error(data.error || 'Checkout request failed.');
      }

      if (data?.checkout?.url) {
        trackMarketEvent('marketplace_checkout_redirected', {
          purchaseKind,
          orderId: data?.order?.id || null,
          checkoutProvider: data?.checkout?.provider || 'stripe',
        });
        window.location.href = data.checkout.url;
        return;
      }

      trackMarketEvent('marketplace_checkout_completed', {
        purchaseKind,
        orderId: data?.order?.id || null,
        totalAmount: data?.order?.total_amount || null,
      });

      setCheckoutState({
        isSubmitting: false,
        message: `${data.message} Order ID: ${data.order.id}`,
        error: '',
      });
    } catch (err) {
      trackMarketEvent('marketplace_checkout_failed', {
        purchaseKind,
        message: err instanceof Error ? err.message : 'Unexpected checkout error.',
      });

      setCheckoutState({
        isSubmitting: false,
        message: '',
        error: err instanceof Error ? err.message : 'Unexpected checkout error.',
      });
    }
  }

  useEffect(() => {
    let canceled = false;

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/games/${slug}?clip_id=${clipId}`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Unable to load clip purchase data.');
        }

        const data = await response.json();
        if (!canceled) {
          setPayload(data);
        }
      } catch (err) {
        if (!canceled) {
          setError(err instanceof Error ? err.message : 'Unexpected error while loading clip details.');
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
  }, [slug, clipId]);

  const recruitingIntel = payload?.recruitingIntel || {
    score: 80,
    gameMoment: 'Game context loading...',
    coachFit: 'Coach-fit insights loading...',
    confidence: 'Quality metrics loading...',
    projectedWatchTime: 'Watch-time estimate loading...',
    tags: ['GFS intel'],
  };

  const coachEvidenceTimeline = payload?.coachEvidenceTimeline || [];

  return (
    <main className="gfs-page">
      <SiteHeader active="marketplace" />
      <section className="clip-page-shell">
        {isLoading && <p className="game-detail-loading">Loading clip purchase details...</p>}
        {error && <p className="game-detail-error">{error}</p>}

        {!isLoading && !error && payload && (
          <>
            <p className="hero-eyebrow">Single Clip Purchase</p>
            <h1 className="clip-page-title">{payload.clip.title}</h1>

            <section className="clip-preview-shell" aria-label="Watermarked preview">
              <div className={`clip-preview-frame ${payload.clip.mediaType}`}>
                <div
                  className={`clip-preview-badge ${payload.clip.mediaType === 'photo' ? 'photo' : 'video'}`}
                  aria-label={payload.clip.mediaType === 'photo' ? 'Photo preview' : 'Video preview'}
                >
                  <span className="clip-preview-badge-icon" aria-hidden="true">
                    {payload.clip.mediaType === 'photo' ? 'P' : '>'}
                  </span>
                  <span>{payload.clip.mediaType === 'photo' ? 'Photo Preview' : 'Video Preview'}</span>
                </div>
                {payload.clip.mediaType === 'video' && payload.clip.previewVideo ? (
                  <video
                    className="clip-preview-media"
                    src={payload.clip.previewVideo}
                    poster={payload.clip.previewImage}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img className="clip-preview-media" src={payload.clip.previewImage} alt={`${payload.clip.title} preview`} />
                )}
                <div className="gfs-watermark-layer" aria-hidden="true">
                  <span>GFS PREVIEW</span>
                  <span>GFS PREVIEW</span>
                  <span>GFS PREVIEW</span>
                  <span>GFS PREVIEW</span>
                  <span>GFS PREVIEW</span>
                  <span>GFS PREVIEW</span>
                  <span>GFS PREVIEW</span>
                  <span>GFS PREVIEW</span>
                </div>
              </div>
            </section>

            <div className="clip-meta-grid">
              <span>{payload.clip.clipCode}</span>
              <span className="clip-badge">{payload.clip.clipType}</span>
              <span>Jersey: {payload.clip.jersey}</span>
              <span>{payload.clip.playersMention}</span>
              <span>{payload.clip.capturedDate}</span>
              <span>By {payload.clip.creator}</span>
              <span>{payload.clip.sport}</span>
            </div>

            <section className="intel-shell" aria-label="Recruiting Intel">
              <div className="intel-header">
                <p className="hero-eyebrow">Recruiting Intel</p>
                <strong className="intel-score">Impact Score: {recruitingIntel.score}</strong>
              </div>
              <div className="intel-grid">
                <article className="intel-card">
                  <p className="intel-label">Game Moment</p>
                  <p className="intel-value">{recruitingIntel.gameMoment}</p>
                </article>
                <article className="intel-card">
                  <p className="intel-label">Coach Fit</p>
                  <p className="intel-value">{recruitingIntel.coachFit}</p>
                </article>
                <article className="intel-card">
                  <p className="intel-label">Delivery Confidence</p>
                  <p className="intel-value">{recruitingIntel.confidence}</p>
                </article>
                <article className="intel-card">
                  <p className="intel-label">Projected Watch Time</p>
                  <p className="intel-value">{recruitingIntel.projectedWatchTime}</p>
                </article>
              </div>
              <div className="intel-tags">
                {recruitingIntel.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </section>

            <section className="timeline-shell" aria-label="Coach Evidence Timeline">
              <div className="timeline-header">
                <p className="hero-eyebrow">Coach Evidence Timeline</p>
                <span className="timeline-subhead">Built to match how college staff evaluate clips</span>
              </div>
              <div className="timeline-list">
                {coachEvidenceTimeline.map((item) => (
                  <article className="timeline-item" key={item.id}>
                    <div className="timeline-left">
                      <span className="timeline-time">{item.timecode}</span>
                      <span className="timeline-grade">{item.grade}</span>
                    </div>
                    <div className="timeline-right">
                      <p className="timeline-phase">{item.phase}</p>
                      <p className="timeline-note">{item.coachNote}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <div className="purchase-options-grid">
              <article className="purchase-card">
                <p className="purchase-tier">{payload.purchaseOptions.standardClip.label}</p>
                <p className="purchase-price">{formatMoney(payload.purchaseOptions.standardClip.price)}</p>
                <ul className="purchase-bullets">
                  {payload.purchaseOptions.standardClip.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <button
                  className="hero-btn primary"
                  type="button"
                  onClick={() => handlePurchase('standard_clip')}
                  disabled={checkoutState.isSubmitting}
                >
                  {checkoutState.isSubmitting ? 'Processing...' : 'Buy Standard Clip'}
                </button>
              </article>

              <article className="purchase-card recommended">
                <p className="purchase-recommended">Recommended</p>
                <p className="purchase-tier">{payload.purchaseOptions.reel.label}</p>
                <p className="purchase-price">{formatMoney(payload.purchaseOptions.reel.price)}</p>
                <p className="purchase-fee-note">
                  Clip price + ${payload.purchaseOptions.reel.editingFee} editing fee
                </p>
                <ul className="purchase-bullets">
                  {payload.purchaseOptions.reel.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <button
                  className="hero-btn primary"
                  type="button"
                  onClick={() => handlePurchase('reel')}
                  disabled={checkoutState.isSubmitting}
                >
                  {checkoutState.isSubmitting ? 'Processing...' : 'Buy the Reel'}
                </button>
              </article>
            </div>

            {checkoutState.message && <p className="checkout-success">{checkoutState.message}</p>}
            {checkoutState.error && <p className="game-detail-error">{checkoutState.error}</p>}

            <p className="clip-delivery-note">{payload.note}</p>

            <section className="related-content">
              <h2 className="related-title">Related Content</h2>
              <div className="related-grid">
                {payload.relatedContent.map((related) => (
                  <Link
                    className="related-card"
                    key={related.id}
                    href={`/marketplace/games/${slug}/clips/${related.id}`}
                  >
                    <div className={`related-thumb ${related.mediaType}`}>
                      <img src={related.previewImage} alt={`${related.title} preview`} />
                      <span className={`related-type ${related.mediaType === 'photo' ? 'photo' : 'video'}`}>
                        {related.mediaType === 'photo' ? 'Photo' : 'Video'}
                      </span>
                      <span className="related-watermark" aria-hidden="true">GFS</span>
                    </div>
                    <p className="related-card-title">{related.title}</p>
                    <div className="related-card-bottom">
                      <span>{formatMoney(related.price)}</span>
                      <span>{related.clipType}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <div className="hero-actions">
              <Link href={`/marketplace/games/${slug}`} className="hero-btn">Back To Game Folder</Link>
              <Link href="/marketplace" className="hero-btn">Back To Marketplace</Link>
            </div>
          </>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
