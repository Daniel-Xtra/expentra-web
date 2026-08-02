import { useState } from 'react';

export type ReferenceSelectionMode = 'page' | 'multiPage';

export type UseReferenceSelectionOptions = {
  mode: ReferenceSelectionMode;
};

export function useReferenceSelection(
  pageReferences: string[],
  options: UseReferenceSelectionOptions,
) {
  const { mode } = options;
  const [selected, setSelected] = useState<string[]>([]);

  const allPageSelected =
    pageReferences.length > 0 &&
    pageReferences.every((reference) => selected.includes(reference));

  const somePageSelected =
    pageReferences.some((reference) => selected.includes(reference)) && !allPageSelected;

  const selectedCount = selected.length;

  const toggleSelected = (reference: string) => {
    setSelected((current) =>
      current.includes(reference)
        ? current.filter((value) => value !== reference)
        : [...current, reference],
    );
  };

  const togglePageSelection = () => {
    if (mode === 'page') {
      setSelected(allPageSelected ? [] : pageReferences);
      return;
    }

    if (allPageSelected) {
      setSelected((current) =>
        current.filter((reference) => !pageReferences.includes(reference)),
      );
      return;
    }

    setSelected((current) => [...new Set([...current, ...pageReferences])]);
  };

  const clearSelection = () => setSelected([]);

  return {
    selected,
    setSelected,
    selectedCount,
    allPageSelected,
    somePageSelected,
    toggleSelected,
    togglePageSelection,
    clearSelection,
  };
}
