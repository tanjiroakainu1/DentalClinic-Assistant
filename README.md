# Dental Clinic Galaxy

Candy-purple clinic management SPA — patients, doctors, and admins. Philippine Peso (₱) billing with GCash support, localStorage data layer, and galaxy-themed analytics.

**Lead Developer:** Raminder Jangao

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router
- Recharts

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output → dist/
npm run preview  # preview production build
```

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Framework preset: **Vite** (auto-detected).
4. Build command: `npm run build`
5. Output directory: `dist`

`vercel.json` is included for SPA routing (all routes rewrite to `index.html`).

### Environment (Galaxy AI chatbot)

Copy `.env.example` to `.env` and set your API key (server-side only — never exposed in the browser):

```bash
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=google/gemini-2.0-flash-001
```

On **Vercel**, add the same variables in Project → Settings → Environment Variables.

Clinic data still uses browser `localStorage`; only the AI assistant calls `/api/assistant`.

## Quick portal access

Use one-tap login on the login page (credentials are internal, not shown in the UI).

## License

Private / educational project.
