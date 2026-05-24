import type { ReactNode } from 'react';

export function AuthFormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="auth-form-section space-y-4">
      <div className="flex items-start gap-3">
        <span className="auth-section-icon" aria-hidden>
          {icon}
        </span>
        <div>
          <h3 className="font-semibold text-violet-50">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-soft">{description}</p>}
        </div>
      </div>
      <div className="space-y-4 pl-0 sm:pl-12">{children}</div>
    </section>
  );
}
