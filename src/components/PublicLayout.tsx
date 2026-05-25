import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { GalaxyAssistant } from './assistant/GalaxyAssistant';
import { AppFooter } from './AppFooter';
import { NavButtonLink } from './ui';

const NAV_LINKS = [
  { to: '/', label: 'Home', match: (p: string) => p === '/' },
  { to: '/login', label: 'Sign in', match: (p: string) => p === '/login' },
  { to: '/register', label: 'Register', match: (p: string) => p === '/register' },
] as const;

export function PublicLayout() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const onHome = pathname === '/';
  const onLogin = pathname === '/login';
  const onRegister = pathname === '/register';

  return (
    <>
      <div className="galaxy-stars" aria-hidden />
      <div className="app-shell flex min-h-screen flex-col">
        <nav className="public-nav sticky top-0 z-30 border-b border-white/10 bg-galaxy-950/90 shadow-glow backdrop-blur-xl">
          <div className="public-nav-bar mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
            <Link to="/" className="public-nav-brand min-w-0 flex-1 sm:flex-none">
              <span className="public-nav-brand-icon" aria-hidden>
                ✦
              </span>
              <span className="public-nav-brand-text font-semibold text-violet-50">Dental Clinic Galaxy</span>
            </Link>

            <div className="public-nav-desktop hidden items-center gap-2 md:flex">
              <NavButtonLink to="/" variant={onHome ? 'candy' : 'ghost'} active={onHome} glow={onHome}>
                Home
              </NavButtonLink>
              <NavButtonLink to="/login" variant={onLogin ? 'candy' : 'outline'} active={onLogin} glow={onLogin}>
                Sign in
              </NavButtonLink>
              <NavButtonLink
                to="/register"
                variant={onRegister ? 'candy' : 'cosmic'}
                active={onRegister}
                glow={onRegister}
              >
                Register
              </NavButtonLink>
            </div>

            <div className="public-nav-mobile-actions flex shrink-0 items-center gap-2 md:hidden">
              <NavButtonLink
                to="/register"
                variant={onRegister ? 'candy' : 'cosmic'}
                active={onRegister}
                glow={onRegister}
                className="public-nav-mobile-cta"
              >
                Register
              </NavButtonLink>
              <button
                type="button"
                className="public-nav-menu-btn"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <span className={`public-nav-menu-line ${menuOpen ? 'public-nav-menu-line-open-a' : ''}`} />
                <span className={`public-nav-menu-line ${menuOpen ? 'public-nav-menu-line-open-b' : ''}`} />
                <span className={`public-nav-menu-line ${menuOpen ? 'public-nav-menu-line-open-c' : ''}`} />
              </button>
            </div>
          </div>

          <div
            className={`public-nav-drawer md:hidden ${menuOpen ? 'public-nav-drawer-open' : ''}`}
            aria-hidden={!menuOpen}
          >
            <div className="public-nav-drawer-inner">
              {NAV_LINKS.map((item) => {
                const active = item.match(pathname);
                const variant =
                  item.to === '/register' ? (active ? 'candy' : 'cosmic') : item.to === '/login' ? (active ? 'candy' : 'outline') : active ? 'candy' : 'ghost';
                return (
                  <NavButtonLink
                    key={item.to}
                    to={item.to}
                    variant={variant}
                    active={active}
                    glow={active}
                    className="public-nav-drawer-link w-full"
                    onNavigate={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </NavButtonLink>
                );
              })}
            </div>
          </div>
        </nav>

        {menuOpen && (
          <button
            type="button"
            className="public-nav-backdrop fixed inset-0 z-20 bg-galaxy-950/75 backdrop-blur-sm md:hidden"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-5 sm:px-4 sm:py-6 md:py-10">
          <Outlet />
        </main>
        <AppFooter />
      </div>
      <GalaxyAssistant />
    </>
  );
}
