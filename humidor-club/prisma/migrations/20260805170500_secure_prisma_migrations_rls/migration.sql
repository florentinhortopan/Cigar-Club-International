-- Harden Prisma migration metadata against Supabase Data API / PostgREST exposure.
-- Treat public._prisma_migrations as internal: enable RLS with no client policies,
-- and revoke privileges from anon / authenticated when those roles exist.

ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE public._prisma_migrations FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE public._prisma_migrations FROM authenticated;
  END IF;
END $$;
