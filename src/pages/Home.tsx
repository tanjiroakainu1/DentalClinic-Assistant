import { Link } from 'react-router-dom';
import { GuestLanding } from '../components/home/GuestLanding';
import { useAuth, getDashboardPath } from '../contexts/AuthContext';
import { Button } from '../components/ui';

export function Home() {
  const { user } = useAuth();

  if (!user) {
    return <GuestLanding />;
  }

  return (
    <div>
      <section className="relative overflow-hidden rounded-3xl border border-candy-400/25 bg-hero-gradient p-8 shadow-glow-lg md:p-12">
        <div className="home-hero-scrim" aria-hidden />
        <div className="relative z-10">
          <h1 className="hero-text-shadow text-3xl font-bold text-white md:text-4xl">
            Welcome back, {user.name}
          </h1>
          <p className="hero-text-shadow mt-3 max-w-2xl text-base text-violet-100">
            You&apos;re signed in as <span className="font-medium text-candy-200">{user.role}</span>. Head to your
            dashboard to continue.
          </p>
          <div className="mt-6">
            <Link to={getDashboardPath(user.role)}>
              <Button variant="candy" size="lg" glow>
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
