-- For manual review only. Not applied by the app. Demo mode needs none of this.
create table profiles (id uuid primary key references auth.users on delete cascade, display_name text, role text not null default 'student' check (role in ('student','trainer')), created_at timestamptz default now());
create table challenges (id uuid primary key default gen_random_uuid(), title text not null, description text, brief text, rubric_json jsonb, status text default 'published', created_by uuid references profiles, created_at timestamptz default now());
create table projects (id uuid primary key default gen_random_uuid(), owner_id uuid not null references profiles, challenge_id uuid references challenges, name text not null, niche text, audience text, goal text, platforms text[], deadline date, created_at timestamptz default now());
create table content_items (id uuid primary key default gen_random_uuid(), project_id uuid not null references projects on delete cascade, title text not null, content_type text, body text, status text not null default 'idea' check (status in ('idea','draft','needs_review','ready','published')), scheduled_for date, published_at timestamptz, created_at timestamptz default now());
create table metric_snapshots (id uuid primary key default gen_random_uuid(), project_id uuid not null references projects on delete cascade, content_item_id uuid references content_items, recorded_at date not null, impressions int check (impressions >= 0), reach int check (reach >= 0), likes int, comments int, shares int, clicks int, conversions int, created_at timestamptz default now());
create table submissions (id uuid primary key default gen_random_uuid(), project_id uuid not null references projects on delete cascade, summary text, evidence_url text, status text not null default 'draft' check (status in ('draft','submitted','in_review','changes_requested','accepted')), submitted_at timestamptz, created_at timestamptz default now());
create table reviews (id uuid primary key default gen_random_uuid(), submission_id uuid not null references submissions on delete cascade, reviewer_id uuid not null references profiles, rubric_scores_json jsonb, feedback text, created_at timestamptz default now());
create index on projects(owner_id); create index on content_items(project_id); create index on metric_snapshots(project_id); create index on submissions(project_id); create index on reviews(submission_id);

alter table profiles enable row level security; alter table projects enable row level security; alter table content_items enable row level security;
alter table metric_snapshots enable row level security; alter table submissions enable row level security; alter table reviews enable row level security;
create policy "own profile" on profiles for select using (id = auth.uid());
-- Role must not be editable by the user: no update policy on profiles; roles are set by an admin/service role only.
create policy "own projects" on projects for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own content" on content_items for all using (exists (select 1 from projects p where p.id = project_id and p.owner_id = auth.uid()));
create policy "own metrics" on metric_snapshots for all using (exists (select 1 from projects p where p.id = project_id and p.owner_id = auth.uid()));
create policy "own submissions" on submissions for all using (exists (select 1 from projects p where p.id = project_id and p.owner_id = auth.uid()));
create policy "trainer reads submissions" on submissions for select using (exists (select 1 from profiles where id = auth.uid() and role = 'trainer'));
create policy "trainer writes reviews" on reviews for all using (exists (select 1 from profiles where id = auth.uid() and role = 'trainer'));
