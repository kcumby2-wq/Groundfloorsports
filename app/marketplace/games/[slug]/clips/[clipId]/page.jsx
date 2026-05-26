import ClipPurchasePage from '@/components/gfs/ClipPurchasePage';

export default async function ClipDetailRoute({ params }) {
  const resolvedParams = await params;
  return <ClipPurchasePage slug={resolvedParams.slug} clipId={resolvedParams.clipId} />;
}
