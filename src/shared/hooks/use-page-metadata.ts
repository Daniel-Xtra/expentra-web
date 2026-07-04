import { useEffect } from 'react';
import {
  usePageMetadataContext,
  type PageMetadataOverride,
} from '@/shared/context/page-metadata-context';

export function usePageMetadata(metadata: PageMetadataOverride | null): void {
  const { setOverride } = usePageMetadataContext();

  useEffect(() => {
    if (!metadata?.title && !metadata?.description) {
      return;
    }

    setOverride(metadata);
    return () => setOverride(null);
  }, [metadata?.title, metadata?.description, setOverride]);
}
