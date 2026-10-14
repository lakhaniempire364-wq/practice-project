-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run

create table todos (
  id bigint generated always as identity primary key,
  text text not null,
  user_id uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

-- Row Level Security: without this, any logged-in user could read/edit everyone's todos
alter table todos enable row level security;

create policy "Users can view their own todos"
  on todos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own todos"
  on todos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own todos"
  on todos for update
  using (auth.uid() = user_id);

create policy "Users can delete their own todos"
  on todos for delete
  using (auth.uid() = user_id);

-- Second resource: notes. Same shape as todos (own id, owned by a user),
-- with an extra optional "content" column for the note body.

create table notes (
  id bigint generated always as identity primary key,
  title text not null,
  content text not null default '',
  user_id uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

-- Row Level Security: same reason as todos - keeps each user's notes private
alter table notes enable row level security;

create policy "Users can view their own notes"
  on notes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notes"
  on notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notes"
  on notes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own notes"
  on notes for delete
  using (auth.uid() = user_id);





create table profile (
  id bigint generated always as identity primary key,
  text text not null,
  user_id uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

-- Row Level Security: without this, any logged-in user could read/edit everyone's todos
alter table profile enable row level security;

create policy "Users can view their own profile"
  on profile for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on profile for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on profile for update
  using (auth.uid() = user_id);

create policy "Users can delete their own profile"
  on profile for delete
  using (auth.uid() = user_id);
  -- Second resource: notes. Same shape as todos (own id, owned by a user),
-- with an extra optional "content" column for the note body.
