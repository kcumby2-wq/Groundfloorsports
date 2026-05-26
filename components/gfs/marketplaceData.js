export const games = [
  {
    slug: '2026-10-18-allen-vs-plano-east',
    name: 'Allen vs Plano East',
    meta: 'Oct 18, 2026 · Friday Night HS · District 6-6A',
    seller: 'Subject Report',
    team: 'Allen',
    sport: 'Football',
    eventType: 'Friday Night HS',
    mediaType: 'video',
    dateBucket: 'last30',
    dateValue: '2026-10-18',
    clips: 142,
    tags: ['Live', 'Subject Report'],
  },
  {
    slug: '2026-10-18-westlake-vs-lake-travis',
    name: 'Westlake vs Lake Travis',
    meta: 'Oct 18, 2026 · Battle of the Lakes',
    seller: 'Subject Media',
    team: 'Westlake',
    sport: 'Football',
    eventType: 'Friday Night HS',
    mediaType: 'video',
    dateBucket: 'last30',
    dateValue: '2026-10-18',
    clips: 128,
    tags: ['Hot', 'Subject Media'],
  },
  {
    slug: '2026-10-17-duncanville-vs-desoto',
    name: 'Duncanville vs DeSoto',
    meta: 'Oct 17, 2026 · Friday Night HS',
    seller: 'Subject Report',
    team: 'Duncanville',
    sport: 'Football',
    eventType: 'Friday Night HS',
    mediaType: 'photo',
    dateBucket: 'last30',
    dateValue: '2026-10-17',
    clips: 156,
    tags: ['Subject Report'],
  },
  {
    slug: '2026-10-12-pylon-7v7-dallas',
    name: 'Rated 7v7 · Dallas Spring Series',
    meta: 'Oct 12, 2026 · National Circuit · 48 Teams',
    seller: 'Rated 7v7',
    team: 'Rated 7v7',
    sport: '7v7',
    eventType: 'Circuit',
    mediaType: 'video',
    dateBucket: 'last30',
    dateValue: '2026-10-12',
    clips: 284,
    tags: ['Rated 7v7'],
  },
  {
    slug: '2026-10-11-north-shore-vs-galena-park',
    name: 'North Shore vs Galena Park',
    meta: 'Oct 11, 2026 · Houston Area · 21-6A',
    seller: 'Subject Report',
    team: 'North Shore',
    sport: 'Football',
    eventType: 'Friday Night HS',
    mediaType: 'video',
    dateBucket: 'last30',
    dateValue: '2026-10-11',
    clips: 119,
    tags: ['Subject Report'],
  },
  {
    slug: '2026-10-11-aledo-vs-wylie-east',
    name: 'Aledo vs Wylie East',
    meta: 'Oct 11, 2026 · Friday Night HS',
    seller: 'Subject Media',
    team: 'Aledo',
    sport: 'Football',
    eventType: 'Friday Night HS',
    mediaType: 'video',
    dateBucket: 'last30',
    dateValue: '2026-10-11',
    clips: 87,
    tags: ['Subject Media'],
  },
  {
    slug: '2026-10-05-blu-chips-tx-combine',
    name: 'Blu Chips TX Combine · Dallas',
    meta: 'Oct 5, 2026 · Combine · 180 Athletes',
    seller: 'Blu Chips',
    team: 'Blu Chips',
    sport: 'Combines',
    eventType: 'Combine',
    mediaType: 'video',
    dateBucket: 'last30',
    dateValue: '2026-10-05',
    clips: 342,
    tags: ['Hot', 'Blu Chips'],
  },
  {
    slug: '2026-10-04-highland-park-vs-mckinney',
    name: 'Highland Park vs McKinney',
    meta: 'Oct 4, 2026 · Friday Night HS',
    seller: 'Subject Report',
    team: 'Highland Park',
    sport: 'Football',
    eventType: 'Friday Night HS',
    mediaType: 'photo',
    dateBucket: 'last30',
    dateValue: '2026-10-04',
    clips: 96,
    tags: ['Subject Report'],
  },
  {
    slug: '2026-09-28-sr-spring-camp-dallas',
    name: 'SR Spring Camp · Dallas',
    meta: 'Sep 28, 2026 · SR-Hosted Camp · 110 Players',
    seller: 'Subject Report',
    team: 'SR Camp',
    sport: 'Camps',
    eventType: 'Camp',
    mediaType: 'video',
    dateBucket: 'season',
    dateValue: '2026-09-28',
    clips: 218,
    tags: ['Subject Report'],
  },
  {
    slug: '2026-09-27-cedar-hill-vs-mansfield',
    name: 'Cedar Hill vs Mansfield Lake Ridge',
    meta: 'Sep 27, 2026 · Friday Night HS',
    seller: 'Subject Media',
    team: 'Cedar Hill',
    sport: 'Football',
    eventType: 'Friday Night HS',
    mediaType: 'video',
    dateBucket: 'season',
    dateValue: '2026-09-27',
    clips: 104,
    tags: ['Subject Media'],
  },
  {
    slug: '2026-09-21-southlake-carroll-vs-keller',
    name: 'Southlake Carroll vs Keller',
    meta: 'Sep 21, 2026 · Friday Night HS',
    seller: 'Subject Report',
    team: 'Southlake Carroll',
    sport: 'Football',
    eventType: 'Friday Night HS',
    mediaType: 'video',
    dateBucket: 'season',
    dateValue: '2026-09-21',
    clips: 134,
    tags: ['Subject Report'],
  },
  {
    slug: '2026-09-20-katy-vs-katy-tompkins',
    name: 'Katy vs Katy Tompkins',
    meta: 'Sep 20, 2026 · Houston District',
    seller: 'Subject Media',
    team: 'Katy',
    sport: 'Football',
    eventType: 'Friday Night HS',
    mediaType: 'video',
    dateBucket: 'season',
    dateValue: '2026-09-20',
    clips: 78,
    tags: ['Subject Media'],
  },
];

const CLIP_PROFILE_TYPES = [
  { key: 'BROLL', label: 'B-Roll', price: 2, tags: ['Highlight', 'BROLL'] },
  { key: 'GOAL', label: 'Goal', price: 10, tags: ['Goal', 'Highlight'] },
  { key: 'ASSIST', label: 'Assist', price: 8, tags: ['Assist', 'Highlight'] },
  { key: 'SAVE', label: 'Save', price: 9, tags: ['Save', 'Highlight'] },
  { key: 'FACEOFF', label: 'Faceoff', price: 5, tags: ['Faceoff', 'Highlight'] },
  { key: 'DEFENSE', label: 'Defense', price: 6, tags: ['Defense', 'Highlight'] },
];

const FIRST_NAMES = ['Griffin', 'Morgan', 'Nash', 'Josh', 'Mason', 'Luke', 'Moye', 'Derek', 'Andre'];
const LAST_NAMES = ['Ward', 'Olivier', 'Tumer', 'Alexander', 'Pendleton', 'Moss', 'Bishop', 'Hendricks', 'Samuels'];
const BASE_JERSEYS = [2, 6, 6, 10, 32];
const SAMPLE_PREVIEW_VIDEOS = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
];

function formatDateLabel(dateValue) {
  const [year, month, day] = dateValue.split('-').map(Number);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[(month || 1) - 1]} ${day}, ${year}`;
}

function getPrimaryTeam(gameName) {
  return gameName.split(' vs ')[0]?.trim() || gameName;
}

function getCreatorHandle(seller) {
  return `@${seller.toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
}

function encodeSvg(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function buildClipCode(gameIndex, clipIndex) {
  const value = 17601 + gameIndex * 100 + clipIndex;
  return `GME${String(value).padStart(5, '0')}`;
}

function buildPreviewImage({ game, clipType, player }) {
  const mediaLabel = game.mediaType === 'photo' ? 'PHOTO PREVIEW' : 'VIDEO PREVIEW';
  const teamLabel = `${player.name} #${player.jersey}`;
  const accent = game.mediaType === 'photo' ? '#4db8ff' : '#ec4899';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#142848"/>
        <stop offset="100%" stop-color="#090f1d"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#bg)"/>
    <circle cx="210" cy="160" r="180" fill="${accent}" opacity="0.2"/>
    <circle cx="1090" cy="560" r="220" fill="${accent}" opacity="0.15"/>
    <rect x="32" y="28" width="1216" height="664" rx="24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
    <text x="64" y="92" fill="white" font-size="46" font-family="Arial" font-weight="700">${mediaLabel}</text>
    <text x="64" y="146" fill="${accent}" font-size="30" font-family="Arial">${clipType.label.toUpperCase()}</text>
    <text x="64" y="640" fill="white" font-size="40" font-family="Arial" font-weight="700">${teamLabel}</text>
    <text x="64" y="680" fill="rgba(255,255,255,0.8)" font-size="28" font-family="Arial">${game.name}</text>
  </svg>`;

  return encodeSvg(svg);
}

function buildRecruitingIntel(selectedClip, gamePayload) {
  const typeWeights = {
    GOAL: 96,
    ASSIST: 91,
    SAVE: 90,
    FACEOFF: 84,
    DEFENSE: 82,
    BROLL: 72,
  };

  const score = typeWeights[selectedClip.eventType] || 78;
  const gameLengthMins = 48 + gamePayload.clips.length * 2;
  const estimatedTime = `${Math.max(1, Math.floor((Number(selectedClip.id.split('-').pop()) || 1) * 3))}:${String((gamePayload.clips.length * 7) % 60).padStart(2, '0')}`;

  return {
    score,
    gameMoment: `Estimated game minute ${estimatedTime}`,
    coachFit: selectedClip.eventType === 'BROLL'
      ? 'Best for profile intros and effort tape.'
      : 'Best for impact moments and coach evaluations.',
    confidence: 'Frame stability and athlete centering verified by GFS QA.',
    projectedWatchTime: `${Math.round(gameLengthMins * 0.35)} sec avg coach watch intent`,
    tags: [
      selectedClip.eventType,
      'NIL-safe watermark',
      selectedClip.mediaType === 'video' ? 'Motion preview enabled' : 'Photo preview enabled',
    ],
  };
}

function buildCoachEvidenceTimeline(selectedClip) {
  const byType = {
    GOAL: [
      { second: 4, phase: 'Set-Up', note: 'Reads defender leverage before initiating move.', grade: 'A' },
      { second: 9, phase: 'Creation', note: 'Creates separation with decisive first step.', grade: 'A' },
      { second: 13, phase: 'Finish', note: 'Executes composed finish under pressure.', grade: 'A+' },
    ],
    ASSIST: [
      { second: 3, phase: 'Scan', note: 'Head-up scan identifies weak-side option.', grade: 'A' },
      { second: 7, phase: 'Decision', note: 'Delivers ball early before closeout arrives.', grade: 'A' },
      { second: 11, phase: 'Execution', note: 'Pass placement preserves scoring angle.', grade: 'A-' },
    ],
    SAVE: [
      { second: 2, phase: 'Anticipation', note: 'Tracks release angle pre-shot.', grade: 'A-' },
      { second: 6, phase: 'Reaction', note: 'Explosive reaction with strong hand positioning.', grade: 'A' },
      { second: 10, phase: 'Recovery', note: 'Quick reset limits second-chance opportunity.', grade: 'A' },
    ],
    FACEOFF: [
      { second: 1, phase: 'Stance', note: 'Balanced setup and hand discipline.', grade: 'B+' },
      { second: 5, phase: 'Win Move', note: 'Times clamp and leverage transition.', grade: 'A-' },
      { second: 8, phase: 'Possession', note: 'Secures control and exits contact lane.', grade: 'A-' },
    ],
    DEFENSE: [
      { second: 2, phase: 'Recognition', note: 'Identifies route intent and spacing.', grade: 'A-' },
      { second: 7, phase: 'Contain', note: 'Maintains body control without overcommitting.', grade: 'A' },
      { second: 12, phase: 'Disrupt', note: 'Finishes rep with clean disruption.', grade: 'A' },
    ],
    BROLL: [
      { second: 2, phase: 'Presence', note: 'Shows body language and sideline engagement.', grade: 'B+' },
      { second: 6, phase: 'Motor', note: 'Demonstrates repeat-effort movement patterns.', grade: 'A-' },
      { second: 10, phase: 'Projection', note: 'Useful context for profile and branding cuts.', grade: 'A-' },
    ],
  };

  const stages = byType[selectedClip.eventType] || byType.BROLL;

  return stages.map((stage, idx) => ({
    id: `${selectedClip.id}-timeline-${idx + 1}`,
    timecode: `00:${String(stage.second).padStart(2, '0')}`,
    phase: stage.phase,
    coachNote: stage.note,
    grade: stage.grade,
  }));
}

function buildPlayersForGame(game, gameIndex) {
  if (game.slug === '2026-10-18-allen-vs-plano-east') {
    return [
      { id: 'p1', jersey: 2, name: 'Griffin Ward', team: 'Allen', clipCount: 1 },
      { id: 'p2', jersey: 6, name: 'Morgan Olivier', team: 'Allen', clipCount: 1 },
      { id: 'p3', jersey: 6, name: 'Nash Tumer', team: 'Allen', clipCount: 1 },
      { id: 'p4', jersey: 10, name: 'Josh Alexander', team: 'Allen', clipCount: 1 },
      { id: 'p5', jersey: 32, name: 'Mason Pendleton', team: 'Allen', clipCount: 1 },
    ];
  }

  const primaryTeam = getPrimaryTeam(game.name);
  return BASE_JERSEYS.map((jersey, idx) => {
    const firstName = FIRST_NAMES[(gameIndex + idx) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(gameIndex + idx) % LAST_NAMES.length];
    return {
      id: `p${idx + 1}`,
      jersey,
      name: `${firstName} ${lastName}`,
      team: primaryTeam,
      clipCount: 1,
    };
  });
}

function buildClipRecord(game, clipType, player, clipIndex, gameIndex) {
  const creator = getCreatorHandle(game.seller);
  const standardPrice = clipType.price;
  const reelPrice = standardPrice + 30;
  const mediaType = game.mediaType === 'photo' ? 'photo' : 'video';
  const previewVideo = mediaType === 'video'
    ? SAMPLE_PREVIEW_VIDEOS[(gameIndex + clipIndex) % SAMPLE_PREVIEW_VIDEOS.length]
    : null;

  return {
    id: `${game.slug}-clip-${clipIndex + 1}`,
    clipCode: buildClipCode(gameIndex, clipIndex + 1),
    playerId: player.id,
    playerName: player.name,
    jersey: player.jersey,
    team: player.team,
    title: `${player.name} #${player.jersey} - ${player.team} - ${clipType.label}`,
    eventType: clipType.key,
    tags: clipType.tags,
    price: standardPrice,
    creator,
    mediaType,
    previewImage: buildPreviewImage({ game, clipType, player }),
    previewVideo,
    productTier: 'Standard Clip',
    capturedDate: formatDateLabel(game.dateValue),
    description: 'Raw highlight clip',
    delivery: 'Instant download',
    purchaseOptions: {
      standardClip: {
        label: 'Standard Clip',
        price: standardPrice,
        bullets: ['Raw highlight clip', 'Instant download'],
      },
      reel: {
        label: 'Buy the Reel',
        price: reelPrice,
        editingFee: 30,
        bullets: [
          'Raw highlight clip (instant)',
          'Pro-edited recruiting reel with music',
          'Stand out to college coaches',
          'Ready for Instagram/TikTok',
        ],
      },
    },
  };
}

function buildGameCommerceCatalog() {
  return games.reduce((acc, game, gameIndex) => {
    const players = buildPlayersForGame(game, gameIndex);
    const clips = CLIP_PROFILE_TYPES.map((clipType, idx) => {
      const player = players[idx % players.length];
      return buildClipRecord(game, clipType, player, idx, gameIndex);
    });

    acc[game.slug] = {
      sport: game.slug === '2026-10-18-allen-vs-plano-east' ? 'Lacrosse' : game.sport,
      dateLabel: game.slug === '2026-10-18-allen-vs-plano-east' ? 'May 14, 2026' : formatDateLabel(game.dateValue),
      seller: game.seller,
      fullGameOffer: {
        title: `${game.name} - Full Game Access`,
        price: 49 + (gameIndex % 3) * 10,
      },
      players,
      clips,
    };

    return acc;
  }, {});
}

const gameCommerceCatalog = buildGameCommerceCatalog();

export function getGameCommerceBySlug(slug) {
  const game = games.find((item) => item.slug === slug);
  const commerce = gameCommerceCatalog[slug];

  if (!game || !commerce) {
    return null;
  }

  const players = commerce.players;
  const clips = commerce.clips;
  const photos = clips.filter((clip) => clip.tags.includes('Photo')).length;
  const allClipTags = ['All clips', 'Goal', 'Assist', 'Save', 'Faceoff', 'Ground', 'Defense', 'Highlight', 'BROLL'];

  return {
    slug: game.slug,
    name: game.name,
    sport: commerce.sport,
    dateLabel: commerce.dateLabel,
    seller: commerce.seller,
    clipsCount: clips.length,
    photosCount: photos,
    playersCount: players.length,
    fullGameOffer: commerce.fullGameOffer,
    players,
    clips,
    allClipTags,
  };
}

export function getClipPurchaseById(slug, clipId) {
  const gamePayload = getGameCommerceBySlug(slug);

  if (!gamePayload) {
    return null;
  }

  const selectedClip = gamePayload.clips.find((clip) => clip.id === clipId);

  if (!selectedClip) {
    return null;
  }

  const playersSameJersey = gamePayload.players
    .filter((player) => player.jersey === selectedClip.jersey)
    .map((player) => `${player.name} #${player.jersey}`)
    .slice(0, 2);

  const relatedContent = gamePayload.clips
    .filter((clip) => clip.id !== selectedClip.id)
    .map((clip) => ({
      id: clip.id,
      title: clip.title,
      price: clip.price,
      clipType: clip.eventType,
      clipCode: clip.clipCode,
      mediaType: clip.mediaType,
      previewImage: clip.previewImage,
      previewVideo: clip.previewVideo,
    }));

  const recruitingIntel = buildRecruitingIntel(selectedClip, gamePayload);
  const coachEvidenceTimeline = buildCoachEvidenceTimeline(selectedClip);

  return {
    game: {
      slug: gamePayload.slug,
      name: gamePayload.name,
      sport: gamePayload.sport,
      dateLabel: gamePayload.dateLabel,
      seller: gamePayload.seller,
    },
    clip: {
      id: selectedClip.id,
      clipCode: selectedClip.clipCode,
      title: selectedClip.title,
      clipType: selectedClip.eventType,
      jersey: `#${selectedClip.jersey}`,
      playersMention: playersSameJersey.join(', '),
      capturedDate: selectedClip.capturedDate,
      creator: selectedClip.creator,
      sport: gamePayload.sport,
      mediaType: selectedClip.mediaType,
      previewImage: selectedClip.previewImage,
      previewVideo: selectedClip.previewVideo,
      productTier: selectedClip.productTier,
      price: selectedClip.price,
      description: selectedClip.description,
      delivery: selectedClip.delivery,
    },
    purchaseOptions: selectedClip.purchaseOptions,
    relatedContent,
    recruitingIntel,
    coachEvidenceTimeline,
    note: 'Instant clip download after purchase. Reel orders delivered within 3-5 business days.',
  };
}
