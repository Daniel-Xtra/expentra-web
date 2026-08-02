import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, SparkleIcon } from '@phosphor-icons/react';
import { BrandLogo } from '@/shared/components/BrandLogo';
import { cn } from '@/lib/utils';

const LEFT_PANEL_WIDTH = 'calc(100vw * 1.05 / 2.05)';

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
  className?: string;
};

export function AuthPageLayout({
  children,
  footerLink,
  className,
}: AuthPageLayoutProps) {
  return (
    <div className="min-h-svh font-sans">
      <aside
        className="fixed inset-y-0 left-0 z-10 hidden flex-col justify-between overflow-hidden bg-linear-to-br from-[#006aff] via-[#0056d6] to-[#003d99] p-10 lg:flex xl:p-14"
        style={{ width: LEFT_PANEL_WIDTH }}
      >
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
      </aside>

      <main className="min-h-svh bg-[#eef1f8] p-6 md:p-10 lg:ml-[calc(100vw*1.05/2.05)]">
        <div
          className={cn(
            'mx-auto flex w-full max-w-[480px] flex-col justify-center space-y-6 py-6 lg:min-h-[calc(100svh-5rem)]',
            className,
          )}
        >
          <div className="mx-auto lg:hidden">
            <BrandLogo variant="mark" size="md" href="/login" />
          </div>

          <div className="overflow-hidden rounded-lg border border-black-50 bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
            <div className="p-8 sm:p-10">{children}</div>
          </div>

          {footerLink ? (
            <p className="text-center text-sm/[19.6px] text-black-400">
              {footerLink.prompt}{' '}
              {footerLink.onClick ? (
                <button
                  type="button"
                  onClick={footerLink.onClick}
                  className="cursor-pointer font-semibold text-primary-500"
                >
                  {footerLink.label}
                </button>
              ) : (
                <Link
                  to={footerLink.to ?? '/login'}
                  className="font-semibold text-primary-500"
                >
                  {footerLink.label}
                </Link>
              )}
            </p>
          ) : null}

          <p className="text-center text-[11px]/[15.4px] text-black-300 lg:hidden">
            Secure access for authorized employees only.
          </p>
        </div>
      </main>
    </div>
  );
}
