import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AccountSuspensionRedirect } from '@/features/auth/components/AccountSuspensionRedirect';
import { usePageMetadataContext } from '@/shared/context/page-metadata-context';
import { applyDocumentMetadata } from '@/shared/lib/document-metadata';
import { getRouteMetadata } from '@/shared/lib/route-metadata';

function DocumentMetadataSync() {
  const { pathname } = useLocation();
  const { override } = usePageMetadataContext();

  useEffect(() => {
    const route = getRouteMetadata(pathname);

    applyDocumentMetadata({
      title: override?.title ?? route.title,
      description: override?.description ?? route.description,
      noIndex: route.noIndex,
    });
  }, [pathname, override?.title, override?.description]);

  return null;
}

export function DocumentMetadataLayout() {
  return (
    <>
      <DocumentMetadataSync />
      <AccountSuspensionRedirect />
      <Outlet />
    </>
  );
}
