import { SearchInput } from '@/shared/components/SearchInput';
import { FilterCard } from '@/shared/components/FilterCard';
import AppSelect from '@/shared/reusable/AppSelect';

type AccessReviewFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  roleOptions: Array<{ value: string; label: string }>;
  departmentOptions: Array<{ value: string; label: string }>;
};

export function AccessReviewFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  roleOptions,
  departmentOptions,
}: AccessReviewFiltersProps) {
  return (
    <FilterCard>
      <SearchInput
        field
        placeholder="Email, role, permission, capability…"
        value={search}
        onValueChange={onSearchChange}
      />
      <AppSelect
        placeholder="All roles"
        options={[{ value: 'all', label: 'All roles' }, ...roleOptions]}
        value={roleFilter}
        onChange={onRoleFilterChange}
      />
      <AppSelect
        placeholder="All departments"
        options={[{ value: 'all', label: 'All departments' }, ...departmentOptions]}
        value={departmentFilter}
        onChange={onDepartmentFilterChange}
      />
    </FilterCard>
  );
}
