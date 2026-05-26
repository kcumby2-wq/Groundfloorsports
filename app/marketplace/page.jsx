import { Suspense } from 'react';
import MarketplacePage from '@/components/gfs/MarketplacePage';

export default function MarketplaceRoute() {
  return (
    <Suspense fallback={<main className="gfs-page" />}>
      <MarketplacePage />
    </Suspense>
  );
}
