import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { rolePortalTitle } from '../lib/navigation';
import { GalaxyAssistant } from './assistant/GalaxyAssistant';
import { AppFooter } from './AppFooter';
import { RoleSidebar, useRoleSidebarMobile } from './RoleSidebar';

export function RoleLayout() {
  const { user } = useAuth();
  const { open, toggle, close } = useRoleSidebarMobile();
  const portalLabel = user ? rolePortalTitle[user.role] : '';

  return (
    <>
      <div className="galaxy-stars" aria-hidden />
      <div className="app-shell flex min-h-screen">
        <RoleSidebar mobileOpen={open} onClose={close} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="role-mobile-header sticky top-0 z-20 flex min-h-[3.25rem] items-center gap-3 border-b border-white/10 bg-galaxy-950/90 px-3 py-2.5 backdrop-blur-xl sm:px-4 sm:py-3 lg:hidden">
            <button
              type="button"
              className="role-menu-btn inline-flex h-11 w-11 shrink-0 touch-manipulation flex-col items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10 active:scale-95"
              aria-label="Open sidebar"
              onClick={toggle}
            >
              <span className="h-0.5 w-5 rounded-full bg-violet-100" />
              <span className="h-0.5 w-5 rounded-full bg-violet-100" />
              <span className="h-0.5 w-5 rounded-full bg-violet-100" />
            </button>
            <div className="min-w-0 flex-1">
              <Link to="/" className="block truncate text-sm font-semibold text-violet-100/90">
                ✦ Dental Clinic Galaxy
              </Link>
              {portalLabel && (
                <p className="truncate text-[11px] font-medium uppercase tracking-wide text-violet-300/55">
                  {portalLabel}
                </p>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-x-auto p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
          <AppFooter variant="compact" />
        </div>
      </div>
      <GalaxyAssistant />
    </>
  );
}
