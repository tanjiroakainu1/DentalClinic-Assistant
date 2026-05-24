import { DEVELOPER, SITE } from '../lib/siteMeta';

export function AppFooter({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const year = new Date().getFullYear();

  if (variant === 'compact') {
    return (
      <footer className="border-t border-white/10 bg-galaxy-950/80 px-4 py-4 backdrop-blur-md">
        <p className="text-center text-[10px] text-whisper">
          &copy; {year} {SITE.name} ·{' '}
          <span className="text-violet-300/50">
            Dev <span className="text-candy-300/70">{DEVELOPER.name}</span>
          </span>
        </p>
      </footer>
    );
  }

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-galaxy-950/70 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(192,38,211,0.08),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center gap-5 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <p className="text-sm font-semibold text-violet-100/85">
              &copy; {year} {SITE.name}
            </p>
            <p className="mt-1 text-xs text-soft">{SITE.tagline}</p>
          </div>

          <div className="developer-credit flex flex-col items-center gap-2 md:items-end">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-whisper">
              Developed by
            </span>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-candy-400/30 bg-gradient-to-r from-candy-500/15 via-galaxy-700/20 to-galaxy-900/30 px-5 py-2.5 shadow-glow">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-candy-400 to-galaxy-600 text-sm font-bold text-white shadow-glow">
                RJ
              </span>
              <div className="text-left">
                <p className="bg-gradient-to-r from-candy-200 to-violet-200 bg-clip-text text-sm font-bold text-transparent">
                  {DEVELOPER.name}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-violet-300/55">{DEVELOPER.title}</p>
              </div>
            </div>
            <p className="max-w-xs text-[10px] text-whisper">{DEVELOPER.credit}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
