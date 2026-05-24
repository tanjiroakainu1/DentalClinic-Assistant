import { Link, Outlet } from 'react-router-dom';
import { GalaxyAssistant } from './assistant/GalaxyAssistant';
import { AppFooter } from './AppFooter';
import { RoleSidebar, useRoleSidebarMobile } from './RoleSidebar';

export function RoleLayout() {
  const { open, toggle, close } = useRoleSidebarMobile();

  return (
    <>
      <div className="galaxy-stars" aria-hidden />
      <div className="app-shell flex min-h-screen">
        <RoleSidebar mobileOpen={open} onClose={close} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-galaxy-950/80 px-4 py-3 backdrop-blur-xl lg:hidden">
            <button
              type="button"
              className="inline-flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10"
              aria-label="Open sidebar"
              onClick={toggle}
            >
              <span className="h-0.5 w-5 rounded-full bg-violet-100" />
              <span className="h-0.5 w-5 rounded-full bg-violet-100" />
              <span className="h-0.5 w-5 rounded-full bg-violet-100" />
            </button>
            <Link to="/" className="truncate text-sm font-semibold text-violet-100/90">
              ✦ Dental Clinic Galaxy
            </Link>
          </header>
          <main className="flex-1 overflow-x-auto p-4 md:p-6 lg:p-8">
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
