-- Poverty Die Phase 2/3 additive upgrade, validated on isolated Neon branch
-- 2026-11-11. Manual SQL for EXISTING main-branch databases only.
-- Always snapshot/branch and review data before applying; never run on production by CI.
-- If old groups have no memberships or profiles have no matching Neon identity,
-- NOT NULL checks intentionally abort and roll back instead of fabricating identities.
-- This is not a Drizzle migration journal entry. Do NOT run db:migrate against an
-- existing database until migration history and the existing baseline are reconciled.
BEGIN;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
UPDATE public.profiles p SET
  display_name = COALESCE(NULLIF(btrim(p.display_name), ''), NULLIF(btrim(u.name), ''), 'Member'),
  email = COALESCE(NULLIF(btrim(p.email), ''), u.email)
FROM neon_auth."user" u
WHERE p.user_id = u.id::text AND (p.display_name IS NULL OR p.email IS NULL);
ALTER TABLE public.profiles ALTER COLUMN display_name SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles(username);
ALTER TABLE public.profiles ADD CONSTRAINT canonical_username
  CHECK (username IS NULL OR username ~ '^[a-z][a-z0-9_]{2,23}$');

ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS created_by text;
UPDATE public.groups g SET created_by = (
  SELECT m.user_id FROM public.memberships m WHERE m.group_id = g.id
  ORDER BY (m.role = 'admin') DESC, m.joined_at ASC LIMIT 1
) WHERE g.created_by IS NULL;
ALTER TABLE public.groups ALTER COLUMN created_by SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS groups_created_by_unique ON public.groups(created_by);
CREATE UNIQUE INDEX IF NOT EXISTS one_group_per_user ON public.memberships(user_id);

ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS contribution_month text;
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS payment_reference text;
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS review_note text;
UPDATE public.contributions SET
  contribution_month = COALESCE(contribution_month, to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM')),
  payment_reference = COALESCE(payment_reference, 'legacy-' || id::text)
WHERE contribution_month IS NULL OR payment_reference IS NULL;
ALTER TABLE public.contributions ALTER COLUMN contribution_month SET NOT NULL;
ALTER TABLE public.contributions ALTER COLUMN payment_reference SET NOT NULL;
CREATE INDEX IF NOT EXISTS contribution_member_idx ON public.contributions(group_id, member_id);
CREATE UNIQUE INDEX IF NOT EXISTS contribution_reference_unique
  ON public.contributions(group_id, member_id, payment_reference);
ALTER TABLE public.contributions ADD CONSTRAINT contribution_positive_amount CHECK (amount > 0);

CREATE TABLE IF NOT EXISTS public.group_invitations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
 token_hash text NOT NULL UNIQUE,
 created_by text NOT NULL,
 expires_at timestamptz NOT NULL,
 used_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS invite_group_idx ON public.group_invitations(group_id);

CREATE TABLE IF NOT EXISTS public.contribution_reviews (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 contribution_id uuid NOT NULL REFERENCES public.contributions(id),
 group_id uuid NOT NULL REFERENCES public.groups(id),
 reviewer_id text NOT NULL,
 decision text NOT NULL,
 note text,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS one_review_per_contribution ON public.contribution_reviews(contribution_id);

CREATE TABLE IF NOT EXISTS public.custody_assignments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
 period text NOT NULL,
 custodian_user_id text NOT NULL,
 scheduled_by text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT custody_period_format CHECK (period ~ '^20[0-9]{2}-(0[1-9]|1[0-2])$')
);
CREATE UNIQUE INDEX IF NOT EXISTS one_custodian_per_group_period
  ON public.custody_assignments(group_id, period);
CREATE INDEX IF NOT EXISTS custodian_group_period_idx
  ON public.custody_assignments(group_id, created_at);

CREATE TABLE IF NOT EXISTS public.valuation_reports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
 period text NOT NULL,
 custodian_user_id text NOT NULL,
 cash_ngn numeric(18,2) NOT NULL,
 liabilities_ngn numeric(18,2) NOT NULL,
 asset_marks jsonb NOT NULL,
 statement_reference text NOT NULL,
 notes text,
 status text NOT NULL DEFAULT 'submitted',
 submitted_at timestamptz NOT NULL DEFAULT now(),
 approved_by text,
 approved_at timestamptz,
 CONSTRAINT nonnegative_cash CHECK (cash_ngn >= 0),
 CONSTRAINT nonnegative_liabilities CHECK (liabilities_ngn >= 0),
 CONSTRAINT report_period_format CHECK (period ~ '^20[0-9]{2}-(0[1-9]|1[0-2])$')
);
CREATE UNIQUE INDEX IF NOT EXISTS one_report_per_group_period
  ON public.valuation_reports(group_id, period);
CREATE INDEX IF NOT EXISTS report_group_submitted_idx
  ON public.valuation_reports(group_id, submitted_at);

-- These accounting foundation tables DO NOT authorize issuance or distributions.
CREATE TABLE IF NOT EXISTS public.valuation_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 report_id uuid NOT NULL UNIQUE REFERENCES public.valuation_reports(id),
 group_id uuid NOT NULL REFERENCES public.groups(id),
 approved_by text NOT NULL,
 approved_at timestamptz NOT NULL DEFAULT now(),
 pre_money_nav_ngn numeric(18,2) NOT NULL,
 close_nav_ngn numeric(18,2) NOT NULL,
 pre_money_price_ngn numeric(18,6) NOT NULL,
 closing_price_ngn numeric(18,6) NOT NULL,
 total_issued_units numeric(30,8) NOT NULL
);
CREATE INDEX IF NOT EXISTS approved_event_group_idx
  ON public.valuation_events(group_id, approved_at);

CREATE TABLE IF NOT EXISTS public.unit_issuances (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 group_id uuid NOT NULL REFERENCES public.groups(id),
 valuation_event_id uuid NOT NULL REFERENCES public.valuation_events(id),
 contribution_id uuid NOT NULL UNIQUE REFERENCES public.contributions(id),
 member_id text NOT NULL,
 amount_ngn numeric(18,2) NOT NULL,
 units_issued numeric(30,8) NOT NULL,
 issued_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT positive_unit_issuance CHECK (units_issued > 0)
);
CREATE INDEX IF NOT EXISTS unit_issuance_member_idx
  ON public.unit_issuances(group_id, member_id);

COMMIT;
