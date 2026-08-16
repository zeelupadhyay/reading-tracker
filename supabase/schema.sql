-- ============================================================
-- Reading Tracker: Supabase schema + Row Level Security
-- Run this in the Supabase SQL editor for your project.
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- profiles: one row per auth user (mirrors auth.users)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- books: each user's reading list
-- ------------------------------------------------------------
create type public.book_status as enum ('to_read', 'in_progress', 'finished');

create table if not exists public.books (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  author text not null,
  total_pages integer not null check (total_pages > 0),
  current_page integer not null default 0 check (current_page >= 0),
  genre text,
  target_finish_date date,
  status public.book_status not null default 'to_read',
  rating smallint check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint current_page_lte_total check (current_page <= total_pages)
);

create index if not exists books_user_id_idx on public.books (user_id);
create index if not exists books_status_idx on public.books (status);
create index if not exists books_title_author_idx on public.books using gin (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(author, ''))
);

alter table public.books enable row level security;

-- RLS: users may only ever see/act on rows they own
create policy "Users can view their own books"
  on public.books for select
  using (auth.uid() = user_id);

create policy "Users can insert their own books"
  on public.books for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own books"
  on public.books for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own books"
  on public.books for delete
  using (auth.uid() = user_id);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
  before update on public.books
  for each row execute procedure public.set_updated_at();
