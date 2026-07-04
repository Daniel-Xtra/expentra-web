export type TeamTab = 'employees' | 'roles';

export function getTeamTabFromPath(pathname: string): TeamTab {
  return pathname.includes('/roles') ? 'roles' : 'employees';
}
