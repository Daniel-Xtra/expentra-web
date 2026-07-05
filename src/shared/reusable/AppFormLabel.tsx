import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

type AppFormLabelProps = {
  children: ReactNode;
  className?: string;
  htmlFor?: string;
};

export default function AppFormLabel({ children, className, htmlFor }: AppFormLabelProps) {
  return (
    <Label htmlFor={htmlFor} className={className}>
      {children}
    </Label>
  );
}
