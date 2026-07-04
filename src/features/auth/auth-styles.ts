export const authInputClassName =
  'h-11 rounded-xl border-border/60 bg-background px-3.5 text-[15px] shadow-[inset_0_1px_2px_oklch(0_0_0/0.02)] transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/60 focus-visible:border-primary/40 focus-visible:shadow-[0_0_0_3px_oklch(0.5_0.2_262/0.12)] focus-visible:ring-0';

export const authInputErrorClassName =
  'border-destructive/30 bg-destructive/[0.035] shadow-none focus-visible:border-destructive/40 focus-visible:shadow-[0_0_0_3px_oklch(0.55_0.22_25/0.12)] aria-invalid:border-destructive/30 aria-invalid:ring-0';

export const authFormSurfaceClassName =
  'overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[0_1px_2px_oklch(0_0_0/0.03),0_20px_48px_-16px_oklch(0.5_0.2_262/0.12)]';

export const authFormBodyClassName = 'space-y-5 p-6 sm:p-7';

export const authFormActionsClassName = 'space-y-3 border-t border-border/40 bg-muted/15 px-6 py-5 sm:px-7';

export const authFormFooterClassName =
  'border-t border-border/40 bg-muted/20 px-6 py-4 text-center text-sm text-muted-foreground sm:px-7';

export type AuthAlternateAction = {
  prompt: string;
  label: string;
  to?: string;
  onClick?: () => void;
};
