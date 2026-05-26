const STORAGE_KEY = 'sr_event_queue';
const MAX_QUEUE_SIZE = 250;
const FUNNEL_SESSION_KEY = 'gfs_marketplace_funnel_session_id';

function canFlushRemotely() {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'http:' || window.location.protocol === 'https:';
}

function readQueue() {
  if (typeof window === 'undefined') return [];

  try {
    const queue = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(queue) ? queue : [];
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE_SIZE)));
  } catch {
    // Ignore storage quota errors and keep UX responsive.
  }
}

function buildFunnelSessionId() {
  return `funnel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getFunnelSessionId() {
  if (typeof window === 'undefined') return '';
  try {
    const existing = window.localStorage.getItem(FUNNEL_SESSION_KEY);
    if (existing) return existing;
    const nextId = buildFunnelSessionId();
    window.localStorage.setItem(FUNNEL_SESSION_KEY, nextId);
    return nextId;
  } catch {
    return '';
  }
}

export function resetFunnelSessionId() {
  if (typeof window === 'undefined') return '';
  try {
    const nextId = buildFunnelSessionId();
    window.localStorage.setItem(FUNNEL_SESSION_KEY, nextId);
    return nextId;
  } catch {
    return '';
  }
}

export function trackClientEvent(eventName, detail = {}, source = 'subjectreport_client') {
  if (typeof window === 'undefined') return;

  const payload = {
    event: eventName,
    detail,
    source,
    page: window.location.pathname,
    timestamp: Date.now(),
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  const queue = readQueue();
  queue.push(payload);
  writeQueue(queue);
}

export async function flushClientEventQueue(reason = 'interval') {
  if (!canFlushRemotely()) return;

  const queue = readQueue();
  if (!queue.length) return;

  const batch = queue.slice(0, 20).map((item) => ({
    ...item,
    flush_reason: reason,
  }));

  try {
    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch }),
      keepalive: reason !== 'interval',
    });

    if (!response.ok) return;
    writeQueue(queue.slice(batch.length));
  } catch {
    // Keep queued events for retry.
  }
}

export function sendBeaconEventFlush(reason = 'beacon') {
  if (!canFlushRemotely() || typeof navigator === 'undefined' || !navigator.sendBeacon) return;

  const queue = readQueue();
  if (!queue.length) return;

  const batch = queue.slice(0, 10).map((item) => ({
    ...item,
    flush_reason: reason,
  }));

  const body = new Blob([JSON.stringify({ events: batch })], { type: 'application/json' });
  const ok = navigator.sendBeacon('/api/analytics/events', body);
  if (ok) writeQueue(queue.slice(batch.length));
}

export function initClientEventAutoFlush(source = 'subjectreport_client') {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const initialTimer = window.setTimeout(() => {
    flushClientEventQueue('initial');
  }, 1500);

  const intervalId = window.setInterval(() => {
    flushClientEventQueue('interval');
  }, 30000);

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      sendBeaconEventFlush('visibility_hidden');
    }
  };

  const onBeforeUnload = () => {
    sendBeaconEventFlush('before_unload');
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('beforeunload', onBeforeUnload);

  trackClientEvent('analytics_auto_flush_init', { source }, source);

  return () => {
    window.clearTimeout(initialTimer);
    window.clearInterval(intervalId);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('beforeunload', onBeforeUnload);
  };
}
