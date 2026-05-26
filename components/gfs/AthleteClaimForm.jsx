'use client';

import { useEffect, useMemo, useState } from 'react';

const EMPTY_FORM = {
  jerseyNumber: '',
  firstName: '',
  lastName: '',
  position: '',
  email: '',
  classYear: '',
  height: '',
  weight: '',
  stateProvince: '',
  schoolTeam: '',
  recTeam: '',
  instagram: '',
  xTwitter: '',
  tikTok: '',
  videoUrl: '',
};

const FIELD_GROUPS = [
  { key: 'jerseyNumber', label: 'Jersey #', required: true },
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'position', label: 'Position', required: true },
  { key: 'email', label: 'Email', required: true, type: 'email' },
  { key: 'classYear', label: 'Class/Yr', required: true },
  { key: 'height', label: 'Height', required: true },
  { key: 'weight', label: 'Weight', required: true },
  { key: 'stateProvince', label: 'State/Province', required: true },
  { key: 'schoolTeam', label: 'School/Team', required: true },
  { key: 'recTeam', label: 'Rec Team' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'xTwitter', label: 'X (Twitter)' },
  { key: 'tikTok', label: 'TikTok' },
  { key: 'videoUrl', label: 'Video Url', type: 'url' },
];

function toFormShape(claim) {
  return {
    jerseyNumber: claim?.jerseyNumber || '',
    firstName: claim?.firstName || '',
    lastName: claim?.lastName || '',
    position: claim?.position || '',
    email: claim?.email || '',
    classYear: claim?.classYear || '',
    height: claim?.height || '',
    weight: claim?.weight || '',
    stateProvince: claim?.stateProvince || '',
    schoolTeam: claim?.schoolTeam || '',
    recTeam: claim?.recTeam || '',
    instagram: claim?.instagram || '',
    xTwitter: claim?.xTwitter || '',
    tikTok: claim?.tikTok || '',
    videoUrl: claim?.videoUrl || '',
  };
}

export default function AthleteClaimForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const requiredCount = useMemo(
    () => FIELD_GROUPS.filter((field) => field.required).length,
    [],
  );

  useEffect(() => {
    let canceled = false;

    async function loadClaim() {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('/api/athletes/claim', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Unable to load your existing template.');
        }

        const data = await response.json();
        if (!canceled) {
          setForm(toFormShape(data.claim));
        }
      } catch (err) {
        if (!canceled) {
          setError(err instanceof Error ? err.message : 'Unexpected load error.');
        }
      } finally {
        if (!canceled) {
          setIsLoading(false);
        }
      }
    }

    loadClaim();
    return () => {
      canceled = true;
    };
  }, []);

  function onFieldChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/athletes/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to save template.');
      }

      setForm(toFormShape(data.claim));
      setMessage('Template saved. Coaches and staff can now use this profile schema.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected save error.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="claim-template-shell" aria-label="Prospect Edge athlete template">
      <div className="claim-template-head">
        <p className="hero-eyebrow">Partner Template</p>
        <h2>Athlete Intake Template</h2>
        <p>Complete the exact profile fields used by your Prospect Edge workflow.</p>
      </div>

      {isLoading && <p className="game-detail-loading">Loading template...</p>}
      {error && <p className="game-detail-error">{error}</p>}

      {!isLoading && (
        <form className="claim-form-grid" onSubmit={onSubmit}>
          {FIELD_GROUPS.map((field) => (
            <label key={field.key} className="claim-field">
              <span>
                {field.label}
                {field.required ? ' *' : ''}
              </span>
              <input
                name={field.key}
                type={field.type || 'text'}
                value={form[field.key]}
                onChange={onFieldChange}
                required={Boolean(field.required)}
              />
            </label>
          ))}

          <div className="claim-actions">
            <button className="hero-btn primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Athlete Template'}
            </button>
            <span>{requiredCount} required fields</span>
          </div>

          {message && <p className="checkout-success">{message}</p>}
        </form>
      )}
    </section>
  );
}
