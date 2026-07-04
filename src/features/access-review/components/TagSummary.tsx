import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type TagSummaryProps = {
  items: string[];
  limit?: number;
  className?: string;
};

export function TagSummary({ items, limit = 2, className }: TagSummaryProps) {
  if (items.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const visible = items.slice(0, limit);
  const overflow = items.length - visible.length;

  return (
    <div className={cn('flex max-w-[16rem] flex-wrap gap-1', className)}>
      {visible.map((item, index) => (
        <Badge
          key={`${item}-${index}`}
          variant="outline"
          className="h-auto max-w-full py-0.5 font-normal"
        >
          <span className="truncate">{item}</span>
        </Badge>
      ))}
      {overflow > 0 ? (
        <Badge variant="secondary" className="h-auto py-0.5 font-normal" title={items.join(', ')}>
          +{overflow} more
        </Badge>
      ) : null}
    </div>
  );
}
