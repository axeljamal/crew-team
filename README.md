# The Crew · Team view

A read-only dashboard for the team behind **The Crew**, the players' community for Pinisi Yard. It reads The Crew's team API (a Cloudflare Worker + D1 in the portfolio repo, `worker/crew.ts`) and shows:

| Page | What it shows | API route it calls |
| --- | --- | --- |
| **Overview** `/` | Five health numbers as tiles, the welcome funnel (joined, joined this week, finished the quests), where members hang out | `GET /api/crew/team/health` |
| **Waves** `/waves` | Every playtest wave with its build, ask, status and response count | `GET /api/crew/team/waves` |
| **Wave brief** `/waves/[id]` | Responses, average score, moods, score spread, the top three things to fix and to keep (with players' quotes), every response by theme | `GET /api/crew/team/waves` (to check the id), then `GET /api/crew/team/waves/:id` |
| **Reports** `/reports` | The open moderation queue, most-reported first, with reasons and notes. Read-only: decisions stay in The Crew's own team pages | `GET /api/crew/team/reports` |

Every call adds `?demo=1` unless `CREW_REAL=1` is set, and a "Demo data" banner shows whenever it does.

## Environment

All read on the server only. None has a `NEXT_PUBLIC_` prefix, so none reaches the browser.

| Variable | Default | Meaning |
| --- | --- | --- |
| `CREW_API_BASE` | `http://localhost:5288` | Where The Crew's API runs |
| `CREW_ADMIN_TOKEN` | none | The portfolio's `ADMIN_TOKEN`, sent as `Authorization: Bearer …` |
| `CREW_REAL` | unset | `1` shows real members. Anything else means seeded demo data |

Copy `.env.example` to `.env.local` for local work.

## How auth works

The team routes sit behind `requireAdmin` in the portfolio (`worker/access.ts`). It accepts any one of these:

1. a Bearer token matching `ADMIN_TOKEN`, compared in constant time
2. `ADMIN_DEV_BYPASS=true` when the host is `localhost` (the portfolio dev server on :5288 has this turned on, so no token is needed locally)
3. a Cloudflare Access JWT

This app uses option 1. The token is read from `process.env` in `src/lib/crew-api.ts`, which imports `server-only`, so the build fails if a client component ever imports it. The token is only sent from the server to the API. It never appears in the HTML, the RSC payload or the JS bundles. The browser only ever talks to this app, never to the team API.

The brief route (`/waves/:id`) does not filter by demo in the API. So before fetching a brief, this app checks the id against the wave list it is allowed to see, and anything else is a 404. A public demo build therefore can't be made to show a real wave by guessing its id.

## Why server components

- **The token stays secret.** Data is fetched where the token lives, with no API proxy route to protect and no token in the client.
- **Less JavaScript.** The pages are tables, tiles and bar charts with nothing to interact with, so they ship as HTML. The only client component is the nav, which needs the current path for `aria-current`, plus `error.tsx`, which Next requires to be a client component.
- **Caching in one place.** Cache Components is on (the create-next-app 16 default). Each page calls `await connection()`, so the API is never needed at build time. The data functions use `"use cache"` with `cacheLife` set to 60 seconds, so the API is asked at most about once a minute per route. `loading.tsx` is the Suspense fallback, and the static shell (header, nav, demo banner) streams first.

## Accessibility

- Semantic headings: one `h1` per page, with `h2` and `h3` below it, plus `dl` for stat tiles and `ol` for the ranked fixes.
- A skip link, and `aria-current` on the nav.
- Visible focus rings.
- The Crew's palette at AA contrast. Ink on white, blue `#0055bf` on white and red `#c91a09` on white all pass.
- Every chart is plain HTML. Each bar shows its label and number as text, and a `figcaption` repeats the whole chart as one sentence for screen readers.
- Motion is turned off under `prefers-reduced-motion`.

## Look

This follows The Crew's toy-signage tokens (`crew/index.html` and `src/crew/shared.css` in the portfolio repo): white boards with a 3px ink outline on a hard 6px shadow, yellow for the current or pressable thing, blue links, Fredoka throughout, and a sky gradient behind. There are no third-party brand names, logos or figures.

## Commands

```bash
npm run dev        # http://localhost:3102, against CREW_API_BASE
npm test           # Vitest: the data-shaping functions in src/lib
npm run build      # production build
npm start          # serve the build on :3102
```

### Cloudflare Workers (prepared, not deployed)

`open-next.config.ts` and `wrangler.jsonc` (worker name `crew-team`) are set up for `@opennextjs/cloudflare`. Pages render per request, so there is no R2 incremental cache. When it's time to deploy:

```bash
npx wrangler secret put CREW_ADMIN_TOKEN   # only if this deploy should send a token
npm run preview                            # build with OpenNext and run locally in workerd
npm run deploy                             # build and deploy
```

`CREW_API_BASE` is a plain var in `wrangler.jsonc`. Leave `CREW_REAL` unset on any public deploy.
