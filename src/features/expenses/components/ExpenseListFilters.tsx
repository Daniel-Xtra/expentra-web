import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { expenseSortOptions } from '@/features/expenses/constants';
import { FilterCard } from '@/shared/components/FilterCard';
import { SearchInput } from '@/shared/components/SearchInput';
import type { ExpenseListSortField, ExpenseListSortOrder } from '@/types/api';

type ExpenseListFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: ExpenseListSortField;
  onSortByChange: (value: ExpenseListSortField) => void;
  sortOrder: ExpenseListSortOrder;
  onSortOrderChange: (value: ExpenseListSortOrder) => void;
  onFilterChange: () => void;
};

export function ExpenseListFilters({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onFilterChange,
}: ExpenseListFiltersProps) {
  const hasSearch = search.trim().length > 0;

  return (
    <div className="space-y-2">
      <FilterCard>
        <SearchInput
          field
          placeholder="Search by title or reference"
          value={search}
          onValueChange={onSearchChange}
        />
        <div className="w-full sm:w-[180px]">
          <Select
            value={sortBy}
            onValueChange={(value) => {
              onSortByChange(value as ExpenseListSortField);
              onFilterChange();
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {expenseSortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-[140px]">
          <Select
            value={sortOrder}
            onValueChange={(value) => {
              onSortOrderChange(value as ExpenseListSortOrder);
              onFilterChange();
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESC">Newest first</SelectItem>
              <SelectItem value="ASC">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterCard>
      {hasSearch ? (
        <p id="expense-search-export-hint" className="text-xs text-muted-foreground">
          Search filters this page only. Clear search to export the full list.
        </p>
      ) : null}
    </div>
  );
}
