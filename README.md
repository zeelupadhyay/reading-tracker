# Reading Tracker

A full-stack reading-list tracker built with **Next.js 14 (App Router)**, **TypeScript**, and **Supabase** (Auth + Postgres with Row Level Security).

Track books you're reading, update progress page-by-page, mark books finished with a star rating, and see your overall completion rate update live as you go.

---

## 1. Tech Stack

| Concern            | Choice                                                   |
|---------------------|-----------------------------------------------------------|
| Framework           | Next.js 14, App Router, TypeScript                        |
| Auth & DB           | Supabase Auth (email/password) + Supabase Postgres        |
| Security            | Postgres Row Level Security (RLS) — every query is scoped to `auth.uid()` at the database level, not just in app code |
| Styling             | Tailwind CSS + hand-rolled shadcn-style primitives (Radix UI under the hood for Select/Dialog) |
| Forms & validation  | `react-hook-form` + `zod`                                 |
| State management    | React Context (`AuthContext`, `ThemeContext`) + a custom `useBooks` hook |
| Toasts              | `sonner`                                                   |

---

## 2. Project Approach

The app is split into three layers:

1. **Data layer** — `lib/supabase/*` creates typed Supabase clients for the browser, server components, and middleware. `hooks/useBooks.ts` is the single source of truth for all book CRUD + derived stats; every page/component reads from it rather than calling Supabase directly.
2. **Domain layer** — `lib/types.ts` (shared types) and `lib/validations/book.ts` (the single `zod` schema used by the add/edit form) keep validation rules in one place: total pages > 0, author required, current page can't exceed total pages, and a 1–5 rating is required when marking a book "Finished".
3. **UI layer** — small composable primitives in `components/ui/`, feature components in `components/`, and route files in `app/` that mostly just wire everything together and add page-level copy.

### Why Row Level Security instead of only checking `user_id` in the app?

Even if a client-side bug (or a malicious request straight to the Supabase REST API) skipped the app's own checks, Postgres itself refuses to return or mutate a row that doesn't belong to the requesting user. See `supabase/schema.sql` — every `select` / `insert` / `update` / `delete` policy on `books` and `profiles` is gated on `auth.uid() = user_id`.

### Route protection

`middleware.ts` runs on every request, refreshes the Supabase session cookie, and redirects unauthenticated visitors away from `/books` and `/reading-list` to `/login` (preserving where they were headed via `?redirectedFrom=`). It also bounces already-logged-in users away from `/login` and `/signup`.

### Compound component: `BookCard`

`components/BookCard/BookCard.tsx` exports a compound component so the card's internals aren't locked into one fixed layout:

```tsx
<BookCard book={book}>
  <BookCard.Header />
  <BookCard.Progress />
  <BookCard.Actions onEdit={openEditForm} onDelete={setDeletingBook} />
</BookCard>
```

`BookCard` provides the `book` via React Context; `Header`, `Progress`, and `Actions` all consume it, so no prop-drilling is needed and the composition is explicit at the call site.

### The completion-rate calculation (and why it's `useMemo`)

```
Reading Completion Rate = Finished Books / Total Books
```

This lives in `hooks/useBooks.ts`:

```ts
const stats = useMemo(() => {
  const total = allBooks.length;
  const finished = allBooks.filter((b) => b.status === "finished").length;
  ...
  const completionRate = total === 0 ? 0 : Math.round((finished / total) * 100);
  return { total, finished, inProgress, toRead, completionRate };
}, [allBooks]);
```

Because every create/update/delete goes through `addBook` / `updateBook` / `deleteBook`, which all update the same `allBooks` state array, `stats` recomputes automatically on every mutation — no manual refetch or "recalculate" call is ever needed.

### Search & filtering

Search input is debounced client-side via `hooks/useDebounce.ts` (350ms) before it's used to filter the fetched book list, so it doesn't re-filter on every keystroke. Status filtering (`To Read` / `In Progress` / `Finished`) is combined with search in the same `useMemo` inside `useBooks`.

### Forms

`components/BookForm.tsx` is shared by both "Add book" and "Edit book" flows. It's driven by `react-hook-form` with `zodResolver(bookFormSchema)`. The star-rating input only appears once status is set to "Finished", and submitting without a rating in that state is blocked by the schema's `.refine()`.

---

## 3. Getting Started

### Prerequisites

- Node.js 18.18+ (or 20+)
- A free [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone <your-repo-url>
cd reading-tracker
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql). This creates the `profiles` and `books` tables, the `book_status` enum, all RLS policies, and the triggers that keep `profiles` and `updated_at` in sync.
3. In **Project Settings → API**, copy your **Project URL** and **anon public key**.
4. In **Authentication → Providers**, make sure **Email** is enabled. For local testing you may want to disable "Confirm email" under **Authentication → Settings** so signup logs you in immediately.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run it

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) — you'll land on `/login`. Sign up for an account, and you'll be redirected to `/books`.

### 5. Build for production

```bash
npm run build
npm run start
```

---

## 4. Folder Structure

```
app/
  login/, signup/         Auth pages
  books/                  Full reading list (all statuses)
  reading-list/           Focused view: books currently "In Progress"
  layout.tsx, providers.tsx, globals.css
components/
  ui/                     Button, Input, Select, Dialog, Label (shadcn-style primitives)
  BookCard/               Compound component (Header / Progress / Actions)
  BookForm.tsx            Shared add/edit form (react-hook-form + zod)
  BooksView.tsx           Page-level composition: search, filter, grid, modals
  SummaryBanner.tsx       Completion-rate banner
  SearchBar.tsx, FilterBar.tsx
  ConfirmModal.tsx        Reusable delete confirmation
  BookListSkeleton.tsx, EmptyState.tsx
  DarkModeToggle.tsx, Navbar.tsx
context/
  AuthContext.tsx         Supabase session state, exposes useAuth()
  ThemeContext.tsx        Persistent dark mode (localStorage), exposes useTheme()
hooks/
  useBooks.ts             All CRUD + debounced search/filter + useMemo stats
  useDebounce.ts
lib/
  supabase/                client.ts / server.ts / middleware.ts
  types.ts                 Book, BookStatus, etc.
  validations/book.ts       zod schema shared by the form
  utils.ts                  cn() class-merge helper
middleware.ts               Route protection + session refresh
supabase/schema.sql         Full DB schema + RLS policies
```

---

## 5. Feature Checklist

- [x] Supabase Auth (email/password) login & signup
- [x] `/books` and `/reading-list` protected by middleware, redirect to `/login`
- [x] Create: add-book form (title, author, total pages, genre, target finish date)
- [x] Read: grid of books, debounced search by title/author, status filter
- [x] Update: edit details, update current page, mark finished with a 1–5 star rating
- [x] Delete: confirmation modal before removing a book
- [x] Summary banner: completion rate via `useMemo`, auto-updates on every mutation
- [x] Tailwind CSS styling, loading skeletons, empty states, toast notifications
- [x] Persistent dark mode toggle (localStorage), no flash-of-wrong-theme on load
- [x] Row Level Security enabled on all tables
- [x] Custom hooks + Context for state management
- [x] Compound components (`BookCard.Header`, `.Progress`, `.Actions`)
- [x] `react-hook-form` + `zod` validation

---

## 6. Deployment (Vercel)

```bash
npm i -g vercel
vercel
```

Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as Environment Variables in the Vercel project settings (Production, Preview, and Development), then redeploy.
