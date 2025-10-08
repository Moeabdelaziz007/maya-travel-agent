-- Enable RLS on destinations while keeping it publicly readable
-- Date: 2025-10-08

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read destinations (public catalog)
DROP POLICY IF EXISTS "Public read access to destinations" ON public.destinations;
CREATE POLICY "Public read access to destinations"
  ON public.destinations
  FOR SELECT
  USING (true);

COMMENT ON POLICY "Public read access to destinations" ON public.destinations IS
  'Destinations are public but RLS is enabled for compliance.';

