import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, SparkleIcon } from '@phosphor-icons/react';
import { BrandLogo } from '@/shared/components/BrandLogo';

const highlights = [
  { icon: SparkleIcon, text: 'Submit and track expense claims' },
  { icon: ShieldCheckIcon, text: 'Multi-level approval workflows' },
  { icon: SparkleIcon, text: 'Budget visibility and reporting' },
];

type AuthPageLayoutProps = {
  children: ReactNode;
  footerLink?: {
    prompt: string;
    label: string;
    to?: string;
    onClick?: () => void;
  };
};

export function AuthPageLayout({ children, footerLink }: AuthPageLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-[oklch(0.44_0.19_262)] to-[oklch(0.32_0.14_264)] lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 85%, oklch(0.99 0.02 264 / 0.2) 0%, transparent 45%), radial-gradient(circle at 85% 15%, oklch(0.6 0.14 262 / 0.25) 0%, transparent 40%)',
          }}
        />
        <BrandLogo
          variant="lockup"
          theme="light"
          size="lg"
          href="/login"
          subtitle="Corporate expense platform"
          className="relative"
        />
        <div className="relative max-w-lg space-y-6 text-primary-foreground">
          <div className="space-y-3">
            <h1 className="text-balance text-2xl font-semibold tracking-tight">
              Expense management, simplified
            </h1>
            <p className="text-sm leading-relaxed text-primary-foreground/80">
              Submit claims, route approvals, and track reimbursements across your organization —
              all in one place.
            </p>
          </div>
          <ul className="space-y-3">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-primary-foreground/60">
          Secure access for authorized employees only.
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-6 md:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="mx-auto lg:hidden">
            <BrandLogo variant="mark" size="md" href="/login" />
          </div>
          {children}
          {footerLink && (
            <p className="text-center text-sm text-muted-foreground">
              {footerLink.prompt}{' '}
              {footerLink.onClick ? (
                <button
                  type="button"
                  onClick={footerLink.onClick}
                  className="cursor-pointer font-medium text-primary hover:underline"
                >
                  {footerLink.label}
                </button>
              ) : (
                <Link to={footerLink.to ?? '/login'} className="font-medium text-primary hover:underline">
                  {footerLink.label}
                </Link>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
