import Link from 'next/link';

const DEFAULT_VIDEOS = [
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    label: 'Friday Night Lights',
  },
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    label: 'Sideline Replays',
  },
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    label: 'Game Winners',
  },
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    label: 'Player Spotlights',
  },
];

export default function VideoShowcase({
  title = 'Live Clip Feed',
  sub = 'Always-on footage flow so every page feels alive.',
  ctaLabel = '',
  ctaHref = '/',
  compact = false,
  videos = DEFAULT_VIDEOS,
}) {
  return (
    <section className={compact ? 'video-showcase compact' : 'video-showcase'}>
      <div className="video-showcase-head">
        <p className="video-showcase-eyebrow">Video-first experience</p>
        <h3>{title}</h3>
        <p>{sub}</p>
      </div>

      <div className="video-showcase-grid">
        {videos.map((video, index) => (
          <article
            key={`${video.src}-${index}`}
            className="video-showcase-tile"
            style={{ '--tile-index': index }}
          >
            <video
              className="video-showcase-media"
              src={video.src}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className="video-showcase-overlay">
              <span>{video.label || `Live Clip ${index + 1}`}</span>
            </div>
          </article>
        ))}
      </div>

      {ctaLabel ? (
        <div className="video-showcase-actions">
          <Link href={ctaHref} className="hero-btn">{ctaLabel}</Link>
        </div>
      ) : null}
    </section>
  );
}
