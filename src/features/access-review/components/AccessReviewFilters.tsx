import { SearchField } from '@/shared/components/SearchField';
import { FilterCard } from '@/shared/components/FilterCard';

type AccessReviewFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function AccessReviewFilters({ search, onSearchChange }: AccessReviewFiltersProps) {
  return (
    <FilterCard>
      <SearchField
        fieldClassName="min-w-[240px] flex-1"
        placeholder="Email, role, permission, capability…"
        value={search}
        onValueChange={onSearchChange}
      />
    </FilterCard>
  );
}
