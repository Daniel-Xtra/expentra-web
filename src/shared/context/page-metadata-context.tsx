import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type PageMetadataOverride = {
  title?: string;
  description?: string;
};

type PageMetadataContextValue = {
  override: PageMetadataOverride | null;
  setOverride: (value: PageMetadataOverride | null) => void;
};

const PageMetadataContext = createContext<PageMetadataContextValue | null>(null);

export function PageMetadataProvider({ children }: { children: ReactNode }) {
  const [override, setOverrideState] = useState<PageMetadataOverride | null>(null);

  const setOverride = useCallback((value: PageMetadataOverride | null) => {
    setOverrideState(value);
  }, []);

  const value = useMemo(
    () => ({
      override,
      setOverride,
    }),
    [override, setOverride],
  );

  return (
    <PageMetadataContext.Provider value={value}>{children}</PageMetadataContext.Provider>
  );
}

// Context consumers are intentionally co-located with the provider.
// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function usePageMetadataContext() {
  const context = useContext(PageMetadataContext);
  if (!context) {
    throw new Error('usePageMetadataContext must be used within PageMetadataProvider');
  }
  return context;
}
