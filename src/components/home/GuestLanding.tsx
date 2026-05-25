import { Link } from 'react-router-dom';
import { QuickRoleLogin } from '../QuickRoleLogin';
import { Button, Card } from '../ui';

const FEATURES = [
  { icon: '📅', title: 'Smart Booking', desc: 'Schedule visits in seconds with real-time doctor availability.' },
  { icon: '💳', title: 'GCash Ready', desc: 'Pay securely in Philippine Peso — cash or GCash, your choice.' },
  { icon: '📋', title: 'Digital Records', desc: 'Treatment history, prescriptions & plans in one cosmic hub.' },
  { icon: '📊', title: 'Live Analytics', desc: 'Admins get candy-purple charts across revenue & appointments.' },
  { icon: '⚕', title: 'Doctor Tools', desc: 'Patient records, schedules, and treatment templates built in.' },
  { icon: '✦', title: 'Galaxy Secure', desc: 'Role-based portals for patients, doctors, and administrators.' },
];

const STEPS = [
  { n: '01', title: 'Choose your portal', text: 'Patient, doctor, or admin — each gets a tailored dashboard.' },
  { n: '02', title: 'Quick access or register', text: 'Open your portal in one tap, or create a patient account in minutes.' },
  { n: '03', title: 'Smile across the galaxy', text: 'Book, treat, verify payments — all in candy-purple style.' },
];

const ROLE_CARDS = [
  {
    role: 'Patient',
    icon: '♡',
    gradient: 'from-candy-400/20 via-fuchsia-500/10 to-transparent',
    ring: 'ring-candy-400/40',
    desc: 'Book appointments, view treatments, pay bills, update your profile.',
    cta: { label: 'Register Free', to: '/register', variant: 'candy' as const, glow: true },
    perks: ['Online booking', 'Medical history', 'GCash payments'],
  },
  {
    role: 'Doctor',
    icon: '⚕',
    gradient: 'from-indigo-500/20 via-cosmic-500/10 to-transparent',
    ring: 'ring-indigo-400/35',
    desc: 'Manage your schedule, patient charts, prescriptions & treatment plans.',
    cta: { label: 'Doctor Login', to: '/login', variant: 'cosmic' as const, glow: false },
    perks: ['Patient records', 'Prescriptions', 'Weekly schedule'],
  },
  {
    role: 'Admin',
    icon: '✦',
    gradient: 'from-violet-500/20 via-galaxy-600/10 to-transparent',
    ring: 'ring-violet-400/35',
    desc: 'Full clinic control — users, payments, reports & galaxy analytics.',
    cta: { label: 'Admin Login', to: '/login', variant: 'nebula' as const, glow: false },
    perks: ['User management', 'Payment verify', 'Financial charts'],
  },
];

function SectionHeading({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="section-title">{title}</h2>
      {lead && <p className="section-lead mx-auto mt-2 max-w-lg">{lead}</p>}
    </div>
  );
}

export function GuestLanding() {
  return (
    <div className="space-y-16 pb-8 md:space-y-24">
      {/* Hero */}
      <section className="home-hero relative overflow-hidden rounded-2xl border border-candy-400/25 bg-hero-gradient p-6 shadow-glow-lg sm:rounded-[2rem] sm:p-8 md:p-12 lg:p-14">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-80" aria-hidden />
        <div className="home-hero-scrim" aria-hidden />
        <div className="home-orb home-orb-a pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-candy-500/20 blur-3xl" />
        <div className="home-orb home-orb-b pointer-events-none absolute -bottom-20 -left-12 h-64 w-64 rounded-full bg-galaxy-600/25 blur-3xl" />

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <span className="hero-badge">✦ Candy Cosmos Edition</span>
            <span className="hero-badge">₱ Philippine Peso · GCash</span>
          </div>

          <h1 className="home-title hero-text-shadow text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Dental Clinic
            <br />
            <span className="text-candy-200">Galaxy</span>
          </h1>

          <p className="hero-text-shadow mx-auto mt-5 max-w-xl text-base leading-relaxed text-violet-100 md:text-lg">
            Where sparkling smiles meet purple nebulas — book care, run your practice, and command the clinic from one
            beautiful universe.
          </p>

          <div className="mt-9 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link to="/register" className="flex-1">
              <Button variant="candy" size="lg" glow className="w-full">
                Start as Patient
              </Button>
            </Link>
            <Link to="/login" className="flex-1">
              <Button variant="secondary" size="lg" className="w-full">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="hero-stat-panel mt-8 grid w-full grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-6">
            {[
              { v: '3', l: 'Portals' },
              { v: '₱', l: 'Peso billing' },
              { v: '24/7', l: 'Quick access' },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="hero-text-shadow text-2xl font-bold text-white md:text-3xl">{s.v}</p>
                <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-violet-200">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick portal access */}
      <section className="relative">
        <SectionHeading title="Instant Portal Access" lead="Jump into Admin, Doctor, or Patient — one tap, no forms." />
        <div className="home-demo-panel relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-galaxy-900/60 to-galaxy-950/90 p-6 shadow-glass backdrop-blur-xl md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,70,239,0.08),transparent_55%)]" />
          <div className="relative">
            <QuickRoleLogin layout="grid" showHint />
          </div>
        </div>
      </section>

      {/* Role portals */}
      <section>
        <SectionHeading title="Choose Your Universe" lead="Three portals. One galaxy. Pick where you belong." />
        <div className="grid gap-6 md:grid-cols-3">
          {ROLE_CARDS.map((r) => (
            <div
              key={r.role}
              className={`home-role-card group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${r.gradient} p-6 ring-1 ${r.ring} transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-lg`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-3xl opacity-80">{r.icon}</span>
                <span className="rounded-full bg-white/5 px-3 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-300/55">
                  {r.role}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-violet-100/90">{r.role} Portal</h3>
              <p className="mt-2 text-sm text-soft">{r.desc}</p>
              <ul className="mt-4 space-y-2">
                {r.perks.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-violet-300/50">
                    <span className="text-violet-400/40">✦</span> {p}
                  </li>
                ))}
              </ul>
              <Link to={r.cta.to} className="mt-6 block">
                <Button variant={r.cta.variant} className="w-full" glow={r.cta.glow}>
                  {r.cta.label}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section>
        <SectionHeading title="Built for Modern Clinics" lead="Everything you need, wrapped in candy glass." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="home-feature-card rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:border-candy-400/25 hover:bg-white/8"
            >
              <span className="text-2xl opacity-75">{f.icon}</span>
              <h3 className="mt-3 text-sm font-semibold text-violet-100/80">{f.title}</h3>
              <p className="mt-1 text-sm text-soft">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="rounded-[1.75rem] border border-white/10 bg-galaxy-950/50 p-8 md:p-12">
        <h2 className="section-title text-center">How It Works</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="relative text-center md:text-left">
              <span className="text-4xl font-black text-violet-500/15">{s.n}</span>
              <h3 className="-mt-3 text-base font-semibold text-violet-200/75">{s.title}</h3>
              <p className="mt-2 text-sm text-soft">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Clinic info + hours */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Clinic Hours">
          <ul className="space-y-3">
            {[
              { days: 'Monday – Friday', hours: '8:00 AM – 5:00 PM', open: true },
              { days: 'Saturday', hours: '9:00 AM – 2:00 PM', open: true },
              { days: 'Sunday', hours: 'Closed', open: false },
            ].map((row) => (
              <li
                key={row.days}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <span className="text-sm text-violet-200/70">{row.days}</span>
                <span className={row.open ? 'text-sm text-violet-300/55' : 'text-sm text-whisper'}>{row.hours}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Visit Us">
          <div className="space-y-4">
            <div className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="text-xl opacity-70">📍</span>
              <div>
                <p className="text-sm text-violet-200/75">123 Dental Avenue</p>
                <p className="text-sm text-soft">Metro Manila, Philippines</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="text-xl opacity-70">📞</span>
              <p className="text-sm text-violet-200/70">(123) 456-7890</p>
            </div>
            <div className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="text-xl opacity-70">✉</span>
              <p className="text-sm text-violet-300/55">info@dentalclinic.com</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Final CTA */}
      <section className="home-cta relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-r from-galaxy-800/90 via-fuchsia-900/70 to-galaxy-900/90 p-10 text-center shadow-glass md:p-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(232,121,249,0.12),transparent_50%)]" />
        <div className="relative">
          <h2 className="section-title md:text-3xl">Ready to enter the galaxy?</h2>
          <p className="section-lead mx-auto mt-3 max-w-md">
            Register as a patient or open your portal with one tap above.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button variant="candy" size="lg" glow>
                Create Patient Account
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
