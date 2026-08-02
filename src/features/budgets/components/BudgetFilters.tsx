import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortOptions, statusFilterOptions } from '@/features/budgets/constants';
import { FilterCard } from '@/shared/components/FilterCard';
import { SearchInput } from '@/shared/components/SearchInput';
import type { BudgetListSortField, BudgetListSortOrder } from '@/types/api';

type BudgetFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: BudgetListSortField;
  onSortByChange: (value: BudgetListSortField) => void;
  sortOrder: BudgetListSortOrder;
  onSortOrderChange: (value: BudgetListSortOrder) => void;
};

export function BudgetFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: BudgetFiltersProps) {
  return (
    <FilterCard>
      <SearchInput
        field
        placeholder="Search by reference, department, or year"
        value={search}
        onValueChange={onSearchChange}
      />
      <div className="w-full sm:w-[180px]">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-[180px]">
        <Select value={sortBy} onValueChange={(value) => onSortByChange(value as BudgetListSortField)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
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
          onValueChange={(value) => onSortOrderChange(value as BudgetListSortOrder)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DESC">High to low</SelectItem>
            <SelectItem value="ASC">Low to high</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FilterCard>
  );
}
