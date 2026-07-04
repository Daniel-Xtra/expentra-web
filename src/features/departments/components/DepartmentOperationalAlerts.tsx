import { WarningCircleIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { DepartmentResponse } from '@/types/api';

type DepartmentOperationalAlertsProps = {
  department: DepartmentResponse;
  readOnly?: boolean;
};

export function DepartmentOperationalAlerts({
  department,
  readOnly = false,
}: DepartmentOperationalAlertsProps) {
  const alerts: Array<{ title: string; description: string; destructive?: boolean }> =
    [];

  if (!department.hasManager) {
    alerts.push({
      title: 'No department manager assigned',
      description:
        department.pendingApprovalCount > 0
          ? readOnly
            ? `Employees cannot submit new expenses, and ${department.pendingApprovalCount} claim${
                department.pendingApprovalCount === 1 ? ' is' : 's are'
              } waiting at the first approval stage. Contact administration to assign a manager.`
            : `Employees cannot submit new expenses, and ${department.pendingApprovalCount} claim${
                department.pendingApprovalCount === 1 ? ' is' : 's are'
              } waiting at the first approval stage. Assign a manager to unblock the queue.`
          : readOnly
            ? 'Employees in this department cannot submit expenses for approval until administration assigns a manager.'
            : 'Employees in this department cannot submit expenses for approval until a manager is assigned.',
      destructive: true,
    });
  } else if (department.pendingApprovalCount > 0) {
    alerts.push({
      title: `${department.pendingApprovalCount} expense${
        department.pendingApprovalCount === 1 ? '' : 's'
      } awaiting approval`,
      description: readOnly
        ? 'These claims are waiting in the approval queue. Review them from the Approvals page.'
        : 'The department manager cannot be removed while these claims are still in the approval queue. Reassign to another employee instead.',
    });
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Alert
          key={alert.title}
          variant={alert.destructive ? 'destructive' : 'default'}
          className="rounded-lg"
        >
          <WarningCircleIcon />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
