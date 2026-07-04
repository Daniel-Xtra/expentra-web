import { CheckCircleIcon, CircleIcon, InfoIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PolicyAdminGuideProps = {
  fieldCount: number;
  fieldDefinitionCount: number;
  templateCount: number;
  policyCount?: number;
  activePolicyCount?: number;
  onGoToCatalog?: () => void;
  className?: string;
};

function SetupStep({
  done,
  children,
}: {
  done: boolean;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-2 text-sm text-muted-foreground">
      {done ? (
        <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-primary" weight="fill" />
      ) : (
        <CircleIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
      )}
      <span className={cn(done && 'text-foreground')}>{children}</span>
    </li>
  );
}

export function PolicyAdminGuide({
  fieldCount,
  fieldDefinitionCount,
  templateCount,
  policyCount = 0,
  activePolicyCount,
  onGoToCatalog,
  className,
}: PolicyAdminGuideProps) {
  const fieldsReady = fieldCount > 0;
  const templatesReady = templateCount > 0;
  const resolvedActiveCount = activePolicyCount ?? policyCount;
  const policiesReady = resolvedActiveCount > 0;
  const allFieldsAdded =
    fieldDefinitionCount > 0 && fieldCount >= fieldDefinitionCount;

  return (
    <div
      className={cn(
        'rounded-lg border border-border/60 bg-muted/15 p-4',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" weight="duotone" />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Policy setup for admins</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Configure what employees see when they submit expenses. You can change labels,
              operators, templates, and policies anytime — no developer access needed.
            </p>
          </div>

          <ol className="space-y-2">
            <SetupStep done={fieldsReady}>
              Add condition fields in Rule catalog
              {fieldDefinitionCount > 0 && (
                <span className="text-muted-foreground">
                  {' '}
                  ({fieldCount} of {fieldDefinitionCount} configured
                  {allFieldsAdded ? ', all types added' : ''})
                </span>
              )}
            </SetupStep>
            <SetupStep done={templatesReady}>
              Create rule templates for common checks (receipt required, caps, duplicates, etc.)
            </SetupStep>
            <SetupStep done={policiesReady}>
              Create active policies on the Policies tab — start from a template when possible
              {policyCount > 0 && !policiesReady ? (
                <span className="text-muted-foreground">
                  {' '}
                  ({policyCount} {policyCount === 1 ? 'policy' : 'policies'}, none active yet)
                </span>
              ) : null}
            </SetupStep>
          </ol>

          <p className="text-xs text-muted-foreground">
            Need a new kind of check that is not in the field list? That requires a product
            update from engineering. Combinations of existing fields cover most expense rules.
          </p>

          {onGoToCatalog && !fieldsReady && (
            <Button type="button" size="sm" variant="outline" onClick={onGoToCatalog}>
              Open Rule catalog
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
