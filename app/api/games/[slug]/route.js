import { NextResponse } from 'next/server';
import { getClipPurchaseById, getGameCommerceBySlug } from '@/components/gfs/marketplaceData';
import { getCreatorClipPurchaseById, getCreatorGameCommerceBySlug } from '@/lib/creatorUploadStore';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const payload = getGameCommerceBySlug(slug) || await getCreatorGameCommerceBySlug(slug);

  if (!payload) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const clipId = searchParams.get('clip_id');

  if (clipId) {
    const clipPayload = getClipPurchaseById(slug, clipId) || await getCreatorClipPurchaseById(slug, clipId);

    if (!clipPayload) {
      return NextResponse.json({ error: 'Clip not found' }, { status: 404 });
    }

    return NextResponse.json(clipPayload);
  }

  const playerFilter = (searchParams.get('player') || 'all').toLowerCase();
  const clipTypeFilter = searchParams.get('clip_type') || 'All clips';

  let clips = [...payload.clips];

  if (playerFilter !== 'all') {
    clips = clips.filter((clip) => clip.playerId.toLowerCase() === playerFilter);
  }

  if (clipTypeFilter !== 'All clips') {
    clips = clips.filter(
      (clip) =>
        clip.eventType.toLowerCase() === clipTypeFilter.toLowerCase()
        || clip.tags.some((tag) => tag.toLowerCase() === clipTypeFilter.toLowerCase()),
    );
  }

  return NextResponse.json({
    game: {
      slug: payload.slug,
      name: payload.name,
      sport: payload.sport,
      dateLabel: payload.dateLabel,
      seller: payload.seller,
      clipsCount: payload.clipsCount,
      photosCount: payload.photosCount,
      playersCount: payload.playersCount,
      fullGameOffer: payload.fullGameOffer,
    },
    players: payload.players,
    clipTypes: payload.allClipTags,
    clips,
    visibleClips: clips.length,
  });
}
