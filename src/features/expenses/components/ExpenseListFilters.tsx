import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { expenseSortOptions } from '@/features/expenses/constants';
import { FilterCard } from '@/shared/components/FilterCard';
import { FormField } from '@/shared/components/FormField';
import { SearchField } from '@/shared/components/SearchField';
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
  return (
    <FilterCard>
      <SearchField
        placeholder="Search by title or reference"
        value={search}
        onValueChange={onSearchChange}
      />
      <FormField className="w-full sm:w-[180px]">
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
      </FormField>
      <FormField className="w-full sm:w-[140px]">
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
      </FormField>
    </FilterCard>
  );
}
