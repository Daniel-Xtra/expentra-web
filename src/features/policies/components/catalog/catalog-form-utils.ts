import type { PolicyCatalogField } from '@/types/api';

export function cloneParamDefinitions(
  paramDefinitions: PolicyCatalogField['paramDefinitions'] = [],
): PolicyCatalogField['paramDefinitions'] {
  return paramDefinitions.map((param) => ({ ...param }));
}
