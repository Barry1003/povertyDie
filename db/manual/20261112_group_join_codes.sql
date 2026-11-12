-- Apply on the intended Neon database branch BEFORE deploying the code that uses join_code.
-- Additive only: preserves existing group memberships, financial records and one-use invitations.
BEGIN;
ALTER TABLE "groups" ADD COLUMN IF NOT EXISTS "join_code" text;
ALTER TABLE "groups" ADD COLUMN IF NOT EXISTS "join_code_enabled" boolean NOT NULL DEFAULT true;
-- Backfill pre-existing groups with cryptographic UUID-derived, unique-by-index codes.
UPDATE "groups"
SET "join_code" = translate(upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)), '01', 'XY')
WHERE "join_code" IS NULL;
ALTER TABLE "groups" ALTER COLUMN "join_code" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "groups_join_code_unique" ON "groups" ("join_code");
COMMIT;
