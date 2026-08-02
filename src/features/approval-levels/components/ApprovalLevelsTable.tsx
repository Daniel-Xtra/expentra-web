import {
  DotsThreeVerticalIcon,
  PencilSimpleIcon,
  PowerIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ApprovalLevelAssigneeCell } from '@/features/approval-levels/components/ApprovalLevelAssigneeCell';
import { ApprovalLevelChainStepCell } from '@/features/approval-levels/components/ApprovalLevelChainStepCell';
import { StatusPill } from '@/shared/components/StatusPill';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { formatLabel } from '@/shared/utils/format';
import type { ApprovalLevelResponse } from '@/types/api';

const tableHeadClassName =
  'h-10 px-4 text-xs font-medium normal-case tracking-normal text-muted-foreground';

type ApprovalLevelsTableProps = {
  levels: ApprovalLevelResponse[];
  onEdit: (level: ApprovalLevelResponse) => void;
  onDeactivate: (level: ApprovalLevelResponse) => void;
  onActivate: (reference: string) => void;
  onDelete: (level: ApprovalLevelResponse) => void;
  togglePending?: boolean;
};

export function ApprovalLevelsTable({
  levels,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
  togglePending = false,
}: ApprovalLevelsTableProps) {
  const { approvalLevel } = useActionCapabilities();
  const showActions = approvalLevel.update || approvalLevel.delete;
  const chainLevels = [...levels].sort((left, right) => left.level - right.level);

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className={cnHead('w-14 pl-5')}>Step</TableHead>
          <TableHead className={cnHead()}>Level</TableHead>
          <TableHead className={cnHead()}>Assignee</TableHead>
          <TableHead className={cnHead('w-32')}>Status</TableHead>
          {showActions ? (
            <TableHead className={cnHead('w-16 pr-5 text-right')}>Actions</TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {chainLevels.map((item, index) => {
          const showConnector =
            index < chainLevels.length - 1 &&
            item.isActive &&
            chainLevels[index + 1]?.isActive;

          return (
            <TableRow key={item.reference} className="group">
              <TableCell className="w-14 pl-5 align-middle">
                <ApprovalLevelChainStepCell
                  step={item.level}
                  isFirst={index === 0}
                  isLast={index === chainLevels.length - 1}
                  showConnector={showConnector}
                  isActive={item.isActive}
                />
              </TableCell>
              <TableCell className="max-w-md whitespace-normal py-4">
                <div className="space-y-1">
                  <p className="font-medium leading-snug text-foreground">
                    {formatLabel(item.name)}
                  </p>
                  {item.description ? (
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/70">
                      Step {item.level} in the approval chain
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="whitespace-normal py-4">
                <ApprovalLevelAssigneeCell level={item} />
              </TableCell>
              <TableCell className="py-4">
                <StatusPill active={item.isActive} />
              </TableCell>
              {showActions ? (
                <TableCell className="pr-5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-70 transition-opacity group-hover:opacity-100"
                        aria-label={`Actions for ${formatLabel(item.name)}`}
                      >
                        <DotsThreeVerticalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      {approvalLevel.update ? (
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <PencilSimpleIcon className="size-4" />
                          Edit level
                        </DropdownMenuItem>
                      ) : null}
                      {approvalLevel.update ? (
                        <DropdownMenuItem
                          disabled={togglePending}
                          onClick={() =>
                            item.isActive
                              ? onDeactivate(item)
                              : onActivate(item.reference)
                          }
                        >
                          <PowerIcon className="size-4" />
                          {item.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      ) : null}
                      {approvalLevel.delete ? (
                        <>
                          {approvalLevel.update ? <DropdownMenuSeparator /> : null}
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(item)}
                          >
                            <TrashIcon className="size-4" />
                            Delete level
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              ) : null}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function cnHead(extra?: string) {
  return extra ? `${tableHeadClassName} ${extra}` : tableHeadClassName;
}
