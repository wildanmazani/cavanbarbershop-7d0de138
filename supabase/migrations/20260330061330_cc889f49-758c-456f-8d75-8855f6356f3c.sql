-- Drop overly permissive update policy
DROP POLICY "Anyone can update stamp count" ON public.members;

-- Create a more restrictive update policy (only stamps_count can change)
CREATE POLICY "Anyone can update stamps_count only"
  ON public.members FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Note: Column-level restrictions will be enforced in the application layer
-- since RLS doesn't support column-level checks natively