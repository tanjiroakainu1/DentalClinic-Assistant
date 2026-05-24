import { PortalAccessCards } from './auth/PortalAccessCards';

/** Quick demo portal access — used on login and optionally elsewhere */
export function QuickRoleLogin({
  layout: _layout = 'grid',
  className = '',
  showHint = true,
}: {
  layout?: 'grid' | 'stack';
  className?: string;
  showHint?: boolean;
}) {
  return (
    <div className={className}>
      {showHint && (
        <p className="mb-3 text-center text-sm text-soft">One-tap access — pick your portal</p>
      )}
      <PortalAccessCards compact />
    </div>
  );
}
