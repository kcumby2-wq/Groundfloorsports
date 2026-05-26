'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ActivateSellerAccessButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function activateSellerAccess() {
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/seller/activate-role', {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to activate seller access.');
      }

      setMessage(data.message || 'Seller role activated.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected seller activation error.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="hero-btn primary"
        onClick={activateSellerAccess}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Activating...' : 'Set Up Seller Account'}
      </button>
      {message && <p className="checkout-success">{message}</p>}
      {error && <p className="game-detail-error">{error}</p>}
    </>
  );
}