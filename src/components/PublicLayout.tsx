import { Link, Outlet, useLocation } from 'react-router-dom';
import { GalaxyAssistant } from './assistant/GalaxyAssistant';
import { AppFooter } from './AppFooter';
import { Button } from './ui';

export function PublicLayout() {
  const { pathname } = useLocation();
  const onLogin = pathname === '/login';
  const onRegister = pathname === '/register';

  return (
    <>
      <div className="galaxy-stars" aria-hidden />
      <div className="app-shell flex min-h-screen flex-col">
        <nav className="public-nav sticky top-0 z-30 border-b border-white/10 bg-galaxy-950/85 shadow-glow backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
            <Link to="/" className="public-nav-brand min-w-0 truncate transition hover:opacity-90">
              <span className="public-nav-brand-icon">✦</span>
              <span className="font-semibold text-violet-50">Dental Clinic Galaxy</span>
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/login">
                <Button variant={onLogin ? 'candy' : 'outline'} size="sm" glow={onLogin}>
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant={onRegister ? 'candy' : 'cosmic'} size="sm" glow={onRegister}>
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </nav>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:py-10">
          <Outlet />
        </main>
        <AppFooter />
      </div>
      <GalaxyAssistant />
    </>
  );
}
