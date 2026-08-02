import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import {
  ChatCircleDotsIcon,
  PaperPlaneTiltIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/shared/components/EmptyState';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/shared/utils/format';
import { formatUserName } from '@/shared/utils/user';
import type { ExpenseCommentResponse, ExpensePolicyExceptionResponse } from '@/types/api';

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

type TimelineItem =
  | { kind: 'comment'; createdAt: string; data: ExpenseCommentResponse }
  | { kind: 'policy-exception'; createdAt: string; data: ExpensePolicyExceptionResponse };

type ExpenseCommentsPanelProps = {
  comments: ExpenseCommentResponse[];
  policyExceptions?: ExpensePolicyExceptionResponse[];
  form: UseFormReturn<{ body: string }>;
  isPosting: boolean;
  onSubmit: (body: string) => void | Promise<void>;
  canComment?: boolean;
  className?: string;
};

export function ExpenseCommentsPanel({
  comments,
  policyExceptions = [],
  form,
  isPosting,
  onSubmit,
  canComment = true,
  className,
}: ExpenseCommentsPanelProps) {
  const timeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [
      ...comments.map((comment) => ({
        kind: 'comment' as const,
        createdAt: comment.createdAt,
        data: comment,
      })),
      ...policyExceptions.map((exception) => ({
        kind: 'policy-exception' as const,
        createdAt: exception.createdAt,
        data: exception,
      })),
    ];

    return items.sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
  }, [comments, policyExceptions]);

  const itemCount = timeline.length;

  return (
    <Card className={cn("overflow-hidden border-border/60", className)}>
      <CardHeader className="border-b border-border/50 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold">Comments</CardTitle>
            <CardDescription>
              {canComment
                ? "Discussion and policy exceptions for reviewers"
                : "Read-only after approval"}
            </CardDescription>
          </div>
          {itemCount > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {itemCount}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-[min(14rem,35vh)] overflow-y-auto">
          {itemCount === 0 ? (
            <EmptyState
              icon={<ChatCircleDotsIcon className="size-6" aria-hidden />}
              title="No comments yet"
              description="Start the conversation with approvers or ask a question."
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-border/50">
              {timeline.map((item) => {
                if (item.kind === "policy-exception") {
                  const exception = item.data;
                  const authorName = formatUserName(exception.author);

                  return (
                    <li
                      key={`policy-${exception.reference}`}
                      className="flex gap-3 bg-amber-50/40 px-4 py-3"
                    >
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800"
                        aria-hidden
                      >
                        <WarningCircleIcon
                          className="size-4"
                          weight="duotone"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {exception.policyName ?? "Policy exception"}
                            </p>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-amber-800/80">
                              Policy justification
                            </p>
                          </div>
                          <time
                            className="shrink-0 text-[11px] text-muted-foreground"
                            dateTime={exception.createdAt}
                          >
                            {formatRelativeTime(exception.createdAt)}
                          </time>
                        </div>
                        {exception.author && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {authorName}
                          </p>
                        )}
                        <blockquote className="mt-2 border-l-2 border-amber-300/80 pl-3 text-sm leading-relaxed text-foreground/90">
                          {exception.justification}
                        </blockquote>
                      </div>
                    </li>
                  );
                }

                const comment = item.data;
                const authorName = formatUserName(comment.author);

                return (
                  <li key={comment.reference} className="flex gap-3 px-4 py-3">
                    <div
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                      aria-hidden
                    >
                      {getInitials(authorName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {authorName}
                        </p>
                        <time
                          className="shrink-0 text-[11px] text-muted-foreground"
                          dateTime={comment.createdAt}
                        >
                          {formatRelativeTime(comment.createdAt)}
                        </time>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                        {comment.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {canComment ? (
          <form
            className="border-t border-border/50 bg-muted/15 p-3"
            onSubmit={form.handleSubmit((values) => onSubmit(values.body))}
            noValidate
          >
            <div className="space-y-1.5">
              <AppFormLabel htmlFor="expense-comment">
                Add a comment
              </AppFormLabel>
              <Textarea
                id="expense-comment"
                rows={2}
                placeholder="Write a comment for reviewers…"
                className="resize-none bg-background"
                aria-invalid={form.formState.errors.body ? true : undefined}
                {...form.register("body")}
              />
              {form.formState.errors.body?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.body.message}
                </p>
              ) : null}
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                type="submit"
                className="h-11 font-normal text-sm px-7 bg-primary-500"
                disabled={isPosting}
              >
                <PaperPlaneTiltIcon className="size-4" />
                {isPosting ? "Posting…" : "Post comment"}
              </Button>
            </div>
          </form>
        ) : (
          <p className="border-t border-border/50 bg-muted/15 px-4 py-3 text-xs text-muted-foreground">
            Comments are closed once this expense is approved.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
