'use client';

import { useEffect, useMemo, useState } from 'react';
import SellerAnalyticsDashboard from './SellerAnalyticsDashboard';
import CreatorApprovalAdmin from '../admin/CreatorApprovalAdmin';

const initialForm = {
  sellerName: '',
  eventName: '',
  team: '',
  sport: 'Football',
  eventType: 'Highlight',
  mediaType: 'video',
  eventDate: new Date().toISOString().slice(0, 10),
  clipTags: '',
  clipCount: '1',
  clipPrice: '10',
  notes: '',
};

const suggestedPrices = [5, 10, 15, 25, 40];

function statusClass(status) {
  return status === 'published' ? 'creator-status published' : 'creator-status';
}

function getPipelineStatus(upload) {
  if (upload.pipelineStatus === 'queued' || upload.pipelineStatus === 'processing' || upload.pipelineStatus === 'live') {
    return upload.pipelineStatus;
  }

  return upload.status === 'published' ? 'live' : 'queued';
}

function pipelineChipClass(upload, chipStatus) {
  return getPipelineStatus(upload) === chipStatus ? 'creator-pipeline-chip active' : 'creator-pipeline-chip';
}

// Enhanced error and progress state
const [stage, setStage] = useState('idle'); // idle, chunk, scan, meta, thumb, save, done, error
const [stageProgress, setStageProgress] = useState(0);

export default function CreatorUploadConsole() {
  const [form, setForm] = useState(initialForm);
  const [mediaFile, setMediaFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState({
    eventName: '',
    team: '',
    sport: 'Football',
    eventType: 'Highlight',
    eventDate: '',
    clipTags: '',
    clipCount: '1',
    clipPrice: '10',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingPipelineId, setUpdatingPipelineId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const mediaAccept = form.mediaType === 'video' ? 'video/*' : 'image/*';

  function isSuggestedPriceActive(value, price) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && Math.abs(parsed - price) < 0.001;
  }

  async function fetchUploads() {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/seller/uploads', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load creator uploads.');
      }

      setUploads(Array.isArray(data.uploads) ? data.uploads : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected upload history error.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUploads();
  }, []);

  const publishedCount = useMemo(
    () => uploads.filter((upload) => getPipelineStatus(upload) === 'live').length,
    [uploads],
  );

  // Storage usage and quota
  const [storageUsage, setStorageUsage] = useState(null);
  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch('/api/seller/uploads/storage-usage');
        if (res.ok) {
          const data = await res.json();
          setStorageUsage(data);
        }
      } catch {}
    }
    fetchUsage();
  }, [uploads.length]);

  async function submitUpload(intent) {
    if (!mediaFile) {
      setError('Select a media file before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');
    setStage('chunk');
    setStageProgress(0);

    try {
      // 1. Create a unique uploadId
      const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const chunkSize = 5 * 1024 * 1024; // 5MB
      const totalChunks = Math.ceil(mediaFile.size / chunkSize);
      let uploadedChunks = 0;
      let lastError = null;

      // 2. Upload chunks sequentially (can be parallelized for speed)
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(mediaFile.size, (i + 1) * chunkSize);
        const chunk = mediaFile.slice(start, end);
        const formData = new FormData();
        formData.set('uploadId', uploadId);
        formData.set('chunkIndex', i);
        formData.set('totalChunks', totalChunks);
        formData.set('chunk', chunk);
        let success = false;
        let attempts = 0;
        while (!success && attempts < 3) {
          try {
            const res = await fetch('/api/seller/uploads/chunk', {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Chunk upload failed');
            success = true;
            uploadedChunks++;
            setStageProgress(Math.round((uploadedChunks / totalChunks) * 100));
            setMessage(`Uploading... (${uploadedChunks}/${totalChunks})`);
          } catch (err) {
            attempts++;
            lastError = err;
            if (attempts >= 3) throw err;
          }
        }
      }

      setStage('scan');
      setStageProgress(0);
      setMessage('All chunks uploaded. Scanning for viruses...');
      // 3. Trigger virus scan
      const scanRes = await fetch('/api/seller/uploads/virus-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId }),
      });
      const scanData = await scanRes.json();
      if (!scanRes.ok || !scanData.clean) {
        setStage('error');
        throw new Error(scanData.scanResult || 'Virus scan failed or file is not clean.');
      }
      setStageProgress(100);

      setStage('meta');
      setStageProgress(0);
      setMessage('Virus scan passed. Extracting metadata...');
      // 4. Extract metadata
      await fetch('/api/seller/uploads/metadata-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId }),
      });
      setStageProgress(100);

      setStage('thumb');
      setStageProgress(0);
      setMessage('Metadata extracted. Generating thumbnail...');
      // 5. Generate thumbnail
      await fetch('/api/seller/uploads/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId }),
      });
      setStageProgress(100);

      setStage('save');
      setStageProgress(0);
      setMessage('Processing complete. Saving upload record...');
      // 6. Save upload record (call original POST with uploadId as reference)
      const payload = new FormData();
      payload.set('sellerName', form.sellerName);
      payload.set('eventName', form.eventName);
      payload.set('team', form.team);
      payload.set('sport', form.sport);
      payload.set('eventType', form.eventType);
      payload.set('mediaType', form.mediaType);
      payload.set('eventDate', form.eventDate);
      payload.set('clipTags', form.clipTags);
      payload.set('clipCount', form.clipCount);
      payload.set('clipPrice', form.clipPrice);
      payload.set('notes', form.notes);
      payload.set('intent', intent);
      payload.set('uploadId', uploadId);
      // No mediaFile, as file is already uploaded

      const response = await fetch('/api/seller/uploads', {
        method: 'POST',
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        setStage('error');
        throw new Error(data.error || 'Upload failed.');
      }

      setUploads((current) => [data.upload, ...current]);
      const queueMessage = data.transcodeJob ? ' Video queued for transcoding.' : '';
      setMessage(`${data.message || 'Upload saved.'}${queueMessage}`);
      setForm((current) => ({
        ...current,
        eventName: '',
        team: '',
        clipTags: '',
        clipCount: '1',
        notes: '',
      }));
      setMediaFile(null);
      setStage('done');
      setStageProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected upload error.');
      setStage('error');
      setStageProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEdit(upload) {
    setEditingId(upload.id);
    setEditForm({
      eventName: upload.eventName || '',
      team: upload.team || '',
      sport: upload.sport || 'Football',
      eventType: upload.eventType || 'Highlight',
      eventDate: upload.eventDate || '',
      clipTags: Array.isArray(upload.tags) ? upload.tags.join(', ') : '',
      clipCount: String(upload.clipCount || '1'),
      clipPrice: String(upload.clipPrice || '10'),
      notes: upload.notes || '',
    });
  }

  function cancelEdit() {
    setEditingId('');
  }

  function applyUploadUpdate(updatedUpload) {
    setUploads((current) => current.map((upload) => (upload.id === updatedUpload.id ? updatedUpload : upload)));
  }

  async function saveEdit(uploadId) {
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/seller/uploads/${uploadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: editForm.eventName,
          team: editForm.team,
          sport: editForm.sport,
          eventType: editForm.eventType,
          eventDate: editForm.eventDate,
          clipTags: editForm.clipTags,
          clipCount: editForm.clipCount,
          clipPrice: editForm.clipPrice,
          notes: editForm.notes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to update upload.');
      }

      applyUploadUpdate(data.upload);
      setEditingId('');
      setMessage(data.message || 'Upload updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected update error.');
    }
  }

  async function setPipelineStatus(upload, pipelineStatus) {
    if (!upload?.id || updatingPipelineId) {
      return;
    }

    if (getPipelineStatus(upload) === pipelineStatus) {
      return;
    }

    setError('');
    setMessage('');
    setUpdatingPipelineId(upload.id);

    try {
      const response = await fetch(`/api/seller/uploads/${upload.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to update upload status.');
      }

      applyUploadUpdate(data.upload);
      setMessage('Upload status updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected status update error.');
    } finally {
      setUpdatingPipelineId('');
    }
  }

  async function deleteUpload(uploadId) {
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/seller/uploads/${uploadId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to delete upload.');
      }

      setUploads((current) => current.filter((upload) => upload.id !== uploadId));
      if (editingId === uploadId) {
        setEditingId('');
      }
      setMessage('Upload deleted.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected delete error.');
    }
  }

  return (
    <section className="creator-upload-shell">
      <div className="creator-upload-head">
        <div>
          <p className="hero-eyebrow">Creator Upload System</p>
          <h2 className="creator-upload-title">Upload, review, publish</h2>
          <p className="creator-upload-sub">Draft clips privately or publish them live to marketplace search.</p>
        </div>
        <div className="creator-kpis">
          <div><strong>{uploads.length}</strong><span>Total uploads</span></div>
          <div><strong>{publishedCount}</strong><span>Published</span></div>
          {storageUsage && (
            <div>
              <strong>{(storageUsage.usage / (1024 * 1024)).toFixed(1)}MB</strong>
              <span>Storage used ({storageUsage.percent}% of quota)</span>
              {storageUsage.percent > 90 && <span style={{ color: 'red', fontWeight: 'bold' }}>Quota nearly full!</span>}
            </div>
          )}
        </div>
      </div>

      <form
        className="creator-upload-form"
        onSubmit={(event) => {
          event.preventDefault();
          submitUpload('draft');
        }}
      >
        <div className="creator-grid two">
          <label>
            Seller label
            <input
              type="text"
              value={form.sellerName}
              onChange={(event) => setForm((current) => ({ ...current, sellerName: event.target.value }))}
              placeholder="GroundFloorSports Creator"
            />
          </label>
          <label>
            Event name
            <input
              type="text"
              value={form.eventName}
              onChange={(event) => setForm((current) => ({ ...current, eventName: event.target.value }))}
              placeholder="Duncanville vs DeSoto"
              required
            />
          </label>
        </div>

        <div className="creator-grid four">
          <label>
            Team
            <input
              type="text"
              value={form.team}
              onChange={(event) => setForm((current) => ({ ...current, team: event.target.value }))}
              placeholder="Duncanville"
              required
            />
          </label>
          <label>
            Sport
            <select value={form.sport} onChange={(event) => setForm((current) => ({ ...current, sport: event.target.value }))}>
              <option>Football</option>
              <option>7v7</option>
              <option>Lacrosse</option>
              <option>Basketball</option>
              <option>Soccer</option>
            </select>
          </label>
          <label>
            Event type
            <input
              type="text"
              value={form.eventType}
              onChange={(event) => setForm((current) => ({ ...current, eventType: event.target.value }))}
              placeholder="Highlight"
              required
            />
          </label>
          <label>
            Event date
            <input
              type="date"
              value={form.eventDate}
              onChange={(event) => setForm((current) => ({ ...current, eventDate: event.target.value }))}
              required
            />
          </label>
          <label>
            Clip tags
            <input
              type="text"
              value={form.clipTags}
              onChange={(event) => setForm((current) => ({ ...current, clipTags: event.target.value }))}
              placeholder="goal, assist, tackle, #12"
            />
            <small>Comma-separated tags improve clip search results.</small>
          </label>
        </div>

        <div className="creator-grid four">
          <label>
            Media type
            <select value={form.mediaType} onChange={(event) => setForm((current) => ({ ...current, mediaType: event.target.value }))}>
              <option value="video">Video</option>
              <option value="photo">Photo</option>
            </select>
          </label>
          <label>
            Clip count
            <input
              type="number"
              min="1"
              value={form.clipCount}
              onChange={(event) => setForm((current) => ({ ...current, clipCount: event.target.value }))}
              required
            />
          </label>
          <label>
            Clip price (USD)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.clipPrice}
              onChange={(event) => setForm((current) => ({ ...current, clipPrice: event.target.value }))}
              required
            />
            <div className="creator-price-suggestions" role="group" aria-label="Suggested clip pricing">
              {suggestedPrices.map((price) => (
                <button
                  key={price}
                  type="button"
                  className={isSuggestedPriceActive(form.clipPrice, price) ? 'creator-price-chip active' : 'creator-price-chip'}
                  onClick={() => setForm((current) => ({ ...current, clipPrice: price.toFixed(2) }))}
                >
                  ${price}
                </button>
              ))}
            </div>
          </label>
          <label>
            Media file
            <input
              type="file"
              accept={mediaAccept}
              onChange={(event) => setMediaFile(event.target.files?.[0] || null)}
              required
            />
            <small>{form.mediaType === 'video' ? 'Upload MP4, MOV, WEBM, AVI, or MPEG (max 250MB).' : 'Upload JPG, PNG, WEBP, or HEIC.'}</small>
          </label>
        </div>

        <label>
          Notes
          <textarea
            rows={3}
            value={form.notes}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            placeholder="Optional notes about this upload"
          />
        </label>

        <div className="hero-actions">
          <button type="submit" className="hero-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            className="hero-btn primary"
            disabled={isSubmitting}
            onClick={() => submitUpload('publish')}
          >
            {isSubmitting ? 'Publishing...' : 'Publish To Marketplace'}
          </button>
        </div>
      </form>

      {message && <p className="checkout-success">{message}</p>}
      {error && <p className="game-detail-error">{error}</p>}
      {/* Progress bar for each stage */}
      <div style={{ margin: '10px 0' }}>
        {stage !== 'idle' && stage !== 'done' && stage !== 'error' && (
          <div style={{ width: '100%', background: '#eee', borderRadius: 4, height: 10 }}>
            <div style={{ width: `${stageProgress}%`, background: '#a0e', height: 10, borderRadius: 4, transition: 'width 0.2s' }} />
          </div>
        )}
        {stage === 'error' && <span style={{ color: 'red' }}>Upload failed. Please retry.</span>}
        {stage === 'done' && <span style={{ color: 'green' }}>Upload complete!</span>}
      </div>

      <div className="creator-history">
        <h3>My uploads</h3>
        {isLoading && <p className="creator-empty">Loading uploads...</p>}
        {!isLoading && uploads.length === 0 && <p className="creator-empty">No uploads yet. Start with your first game file.</p>}
        {!isLoading && uploads.length > 0 && (
          <div className="creator-list">
            {uploads.map((upload) => (
              <article key={upload.id} className="creator-row">
                {editingId === upload.id ? (
                  <div className="creator-edit-grid">
                    <label>
                      Event
                      <input
                        type="text"
                        value={editForm.eventName}
                        onChange={(event) => setEditForm((current) => ({ ...current, eventName: event.target.value }))}
                      />
                    </label>
                    <label>
                      Team
                      <input
                        type="text"
                        value={editForm.team}
                        onChange={(event) => setEditForm((current) => ({ ...current, team: event.target.value }))}
                      />
                    </label>
                    <label>
                      Sport
                      <input
                        type="text"
                        value={editForm.sport}
                        onChange={(event) => setEditForm((current) => ({ ...current, sport: event.target.value }))}
                      />
                    </label>
                    <label>
                      Event type
                      <input
                        type="text"
                        value={editForm.eventType}
                        onChange={(event) => setEditForm((current) => ({ ...current, eventType: event.target.value }))}
                      />
                    </label>
                    <label>
                      Date
                      <input
                        type="date"
                        value={editForm.eventDate}
                        onChange={(event) => setEditForm((current) => ({ ...current, eventDate: event.target.value }))}
                      />
                    </label>
                    <label>
                      Tags
                      <input
                        type="text"
                        value={editForm.clipTags}
                        onChange={(event) => setEditForm((current) => ({ ...current, clipTags: event.target.value }))}
                      />
                    </label>
                    <label>
                      Clips
                      <input
                        type="number"
                        min="1"
                        value={editForm.clipCount}
                        onChange={(event) => setEditForm((current) => ({ ...current, clipCount: event.target.value }))}
                      />
                    </label>
                    <label>
                      Price
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.clipPrice}
                        onChange={(event) => setEditForm((current) => ({ ...current, clipPrice: event.target.value }))}
                      />
                      <div className="creator-price-suggestions" role="group" aria-label="Suggested edit pricing">
                        {suggestedPrices.map((price) => (
                          <button
                            key={`${upload.id}-${price}`}
                            type="button"
                            className={isSuggestedPriceActive(editForm.clipPrice, price) ? 'creator-price-chip active' : 'creator-price-chip'}
                            onClick={() => setEditForm((current) => ({ ...current, clipPrice: price.toFixed(2) }))}
                          >
                            ${price}
                          </button>
                        ))}
                      </div>
                    </label>
                    <label>
                      Notes
                      <input
                        type="text"
                        value={editForm.notes}
                        onChange={(event) => setEditForm((current) => ({ ...current, notes: event.target.value }))}
                      />
                    </label>

                    <div className="creator-row-actions edit-actions">
                      <button type="button" className="hero-btn primary" onClick={() => saveEdit(upload.id)}>Save</button>
                      <button type="button" className="hero-btn" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="creator-row-title">{upload.eventName}</p>
                      <p className="creator-row-meta">{upload.team} · {upload.sport} · {upload.eventDate}</p>
                      {Array.isArray(upload.tags) && upload.tags.length > 0 ? (
                        <div className="creator-tag-list">
                          {upload.tags.map((tag) => (
                            <span key={`${upload.id}-${tag}`} className="creator-tag-chip">#{tag}</span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="creator-row-right">
                      <span className={statusClass(upload.status)}>{upload.status}</span>
                      <div className="creator-pipeline-chips" role="group" aria-label="Upload stage">
                        <button
                          type="button"
                          className={pipelineChipClass(upload, 'queued')}
                          onClick={() => setPipelineStatus(upload, 'queued')}
                          disabled={updatingPipelineId === upload.id}
                        >
                          Queued
                        </button>
                        <button
                          type="button"
                          className={pipelineChipClass(upload, 'processing')}
                          onClick={() => setPipelineStatus(upload, 'processing')}
                          disabled={updatingPipelineId === upload.id}
                        >
                          Processing
                        </button>
                        <button
                          type="button"
                          className={pipelineChipClass(upload, 'live')}
                          onClick={() => setPipelineStatus(upload, 'live')}
                          disabled={updatingPipelineId === upload.id}
                        >
                          Live
                        </button>
                      </div>
                      <span>${Number(upload.clipPrice || 0).toFixed(2)}</span>
                      <a href={upload.fileUrl} target="_blank" rel="noreferrer">Open file</a>
                    </div>
                    <div className="creator-row-actions">
                      <button type="button" className="hero-btn" onClick={() => startEdit(upload)}>Edit</button>
                      <button type="button" className="hero-btn danger" onClick={() => deleteUpload(upload.id)}>Delete</button>
                      <button type="button" className="hero-btn" onClick={async () => {
                        // Show transcoding status
                        const res = await fetch(`/api/seller/uploads/transcode-status/${upload.id}`);
                        if (res.ok) {
                          const data = await res.json();
                          alert(`Transcode status: ${data.status}\nProgress: ${data.progress || 0}%`);
                        } else {
                          alert('No transcode job found.');
                        }
                      }}>Transcode Status</button>
                      <button type="button" className="hero-btn" onClick={async () => {
                        // Admin moderation (approve/takedown)
                        const action = prompt('Enter moderation action (approve/takedown):');
                        if (!action) return;
                        const reason = prompt('Reason for moderation:');
                        const res = await fetch('/api/seller/uploads/moderate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ uploadId: upload.id, action, reason }),
                        });
                        if (res.ok) {
                          alert('Moderation action submitted.');
                        } else {
                          alert('Moderation failed.');
                        }
                      }}>Moderate</button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="analytics-section">
        <SellerAnalyticsDashboard />
      </div>

      {user?.isAdmin && (
        <div className="admin-approval-section">
          <CreatorApprovalAdmin />
        </div>
      )}
    </section>
  );
}