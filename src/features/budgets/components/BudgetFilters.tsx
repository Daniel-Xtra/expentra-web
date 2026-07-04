import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  // ALL_VALUE,
  sortOptions,
  statusFilterOptions,
} from '@/features/budgets/constants';
import { FilterCard } from '@/shared/components/FilterCard';
import { FormField } from '@/shared/components/FormField';
import { SearchField } from '@/shared/components/SearchField';
import type { BudgetListSortField, BudgetListSortOrder, DepartmentResponse } from '@/types/api';

type BudgetFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: BudgetListSortField;
  onSortByChange: (value: BudgetListSortField) => void;
  sortOrder: BudgetListSortOrder;
  onSortOrderChange: (value: BudgetListSortOrder) => void;
  departments: DepartmentResponse[];
};

export function BudgetFilters({
  search,
  onSearchChange,
  // departmentFilter,
  // onDepartmentFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  // departments,
}: BudgetFiltersProps) {
  return (
    <FilterCard>
      <SearchField
        placeholder="Search by reference, department, or year"
        value={search}
        onValueChange={onSearchChange}
      />
      {/* <FormField className="w-full sm:w-[200px]">
        <Select value={departmentFilter} onValueChange={onDepartmentFilterChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All departments</SelectItem>
            {departments.map((department) => (
              <SelectItem key={department.reference} value={department.reference}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField> */}
      <FormField  className="w-full sm:w-[180px]">
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
      </FormField>
      <FormField  className="w-full sm:w-[180px]">
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
      </FormField>
      <FormField  className="w-full sm:w-[140px]">
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
      </FormField>
    </FilterCard>
  );
}
