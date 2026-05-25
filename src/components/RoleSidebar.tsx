import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClinicUser } from '../hooks/useClinic';
import { ProfileAvatar } from './ProfileAvatar';
import { roleNavLinks, rolePortalTitle } from '../lib/navigation';
import { DEVELOPER } from '../lib/siteMeta';
import { Button } from './ui';

export function RoleSidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const fullUser = useClinicUser(user?.id ?? 0);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const links = roleNavLinks[user.role];

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/');
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-galaxy-950/70 backdrop-blur-sm transition-opacity lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden={!mobileOpen}
        onClick={onClose}
      />
      <aside
        className={`role-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-candy-400/20 bg-galaxy-950/95 shadow-glow-lg backdrop-blur-xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <Link to="/" className="text-sm font-semibold text-violet-100/90 transition hover:text-violet-50" onClick={onClose}>
            ✦ Dental Clinic Galaxy
          </Link>
          <p className="mt-2 text-xs uppercase tracking-wider text-whisper">{rolePortalTitle[user.role]}</p>
        </div>

        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <ProfileAvatar
              name={user.name}
              photoUrl={fullUser?.profilePhoto ?? user.profilePhoto}
              size="md"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-violet-100/90">{user.name}</p>
              <p className="mt-0.5 text-xs capitalize text-soft">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {links.map((l) => {
              const active = location.pathname === l.to || location.pathname.startsWith(l.to + '/');
              return (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    onClick={onClose}
                    className={`flex min-h-11 touch-manipulation items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition active:scale-[0.99] ${
                      active
                        ? 'bg-gradient-to-r from-candy-500/35 to-galaxy-600/35 text-candy-100 shadow-glow'
                        : 'text-violet-200/75 hover:bg-white/10 hover:text-violet-50'
                    }`}
                  >
                    <span className="w-5 text-center text-xs opacity-70">{l.icon}</span>
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl border border-candy-400/20 bg-gradient-to-r from-candy-500/10 to-galaxy-800/20 px-3 py-2.5 text-center">
            <p className="text-[9px] font-medium uppercase tracking-widest text-whisper">Built by</p>
            <p className="mt-0.5 text-xs font-semibold text-candy-200/90">{DEVELOPER.name}</p>
          </div>
          <Button type="button" variant="cosmic" className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}

export function useRoleSidebarMobile() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return { open, setOpen, toggle: () => setOpen((v) => !v), close: () => setOpen(false) };
}
