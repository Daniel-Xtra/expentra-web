import { Navigate, useParams } from 'react-router-dom';

export function LegacyDepartmentOverviewRedirect() {
  const { reference } = useParams();
  return (
    <Navigate
      to={reference ? `/department-overview/${reference}` : '/department-overview'}
      replace
    />
  );
}
