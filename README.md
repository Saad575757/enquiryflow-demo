# EnquiryFlow

EnquiryFlow is a polished demo of an enquiry-management workspace for a small
consultancy. It tracks every enquiry from first contact to conversion, who owns
it, and what has to happen next.

The app runs against a real PostgreSQL database (Neon) and is fully
functional — create, edit, assign, progress and delete enquiries, and every
change is persisted.

---

## Features

- **Dashboard** — KPI tiles (open, new this week, overdue, conversion rate),
  eight-week enquiry volume chart, pipeline breakdown by status, follow-ups
  due, and team workload with progress bars.
- **Enquiry list** — debounced live search, filters by status, type, owner and
  overdue actions, with a responsive table on desktop and cards on mobile.
- **Enquiry detail** — status and owner controls, next action, contact
  shortcuts (email/tel), a follow-up timeline, and internal notes.
- **Enquiry form** — shared between create and edit, with Zod validation
  surfaced field-by-field and a sticky action bar.
- **Team page** — per-person workload, totals and a shortcut into that
  person's enquiries.
- **Extras** — light/dark theme with no flash of unstyled content, custom
  404 / error / loading states, toast feedback, and a demo-data reset.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, Radix UI, Lucide icons |
| Data | Prisma 7 + PostgreSQL (Neon) via `@prisma/adapter-pg` |
| Forms | React Hook Form + Zod 4 |
| Charts | Recharts |
| Feedback | Sonner toasts |

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure the database

Copy the example environment file and fill in your Neon connection strings:

```bash
cp .env.example .env
```

```env
# Pooled connection — used by the application at runtime
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"

# Direct connection — used by Prisma Migrate for DDL
DIRECT_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

### 3. Create the schema and seed the demo data

```bash
npm run db:generate   # generate the Prisma client into src/generated/prisma
npm run db:migrate    # apply migrations
npm run db:seed       # load the demo enquiries, team members and follow-ups
```

### 4. Run it

```bash
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Apply/create migrations |
| `npm run db:seed` | Reset the demo data set |
| `npm run db:studio` | Open Prisma Studio |

## Project structure

```
src/
  app/                  routes (dashboard, enquiries, team, new/edit)
  actions/enquiries.ts   server actions (create, update, assign, follow-ups…)
  components/            app shell, dashboard, enquiry UI, ui/ primitives
  generated/prisma/      generated Prisma client (do not edit)
  lib/
    db.ts                Prisma client + driver adapter
    enquiry.ts           status/type/source metadata
    validation.ts        Zod schemas shared by forms and actions
    queries.ts           read-side data access
prisma/
  schema.prisma          data model
  seed.ts                demo data
prisma7.config.ts        Prisma 7 CLI config (datasource URL, seed command)
```

## Data model

- **Enquiry** — contact details, type, source, status, owner, the outstanding
  next action (text, due date, completion timestamp) and internal notes.
- **FollowUpAction** — append-only history of actions, so completing an action
  never erases what came before.
- **TeamMember** — owner of an enquiry.

Enquiries created by the seed script are tagged with `isDemoRecord`, which is
how the in-app "Reset demo data" button knows it may safely delete them.

## Notes

- This is a demo workspace: there is no authentication and the data is not
  private.
- `next.config.ts` pins `turbopack.root` so the build does not pick up a
  `package-lock.json` from a parent directory.
- The theme is stored in `localStorage` under `enquiryflow-theme` and applied
  by a pre-paint script in the root layout to avoid a flash of the wrong
  palette.
