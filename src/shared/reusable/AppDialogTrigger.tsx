import { CaretRightIcon } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { DialogTrigger } from '@/components/ui/dialog';

type AppDialogTriggerProps = {
  title: string;
  description: string;
  onClick?: () => void;
};

export default function AppDialogTrigger({ title, description, onClick }: AppDialogTriggerProps) {
  return (
    <DialogTrigger asChild>
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between rounded-sm font-sans"
        onClick={onClick}
      >
        <div className="space-y-1.5 text-left">
          <p className="text-xs font-medium text-neutral-800">{title}</p>
          <p className="text-[11px] font-normal text-neutral-500">{description}</p>
        </div>
        <div className="flex items-center gap-1">
          <Badge className="rounded-[22px] bg-warning-25 px-3 py-1.5 text-[10px]/[12px] font-normal capitalize text-warning-500">
            pending
          </Badge>
          <CaretRightIcon className="size-4" />
        </div>
      </button>
    </DialogTrigger>
  );
}
