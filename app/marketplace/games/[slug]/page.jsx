import GameDetailPage from '@/components/gfs/GameDetailPage';

export default async function GameDetailRoute({ params }) {
  const resolvedParams = await params;
  return <GameDetailPage slug={resolvedParams.slug} />;
}
