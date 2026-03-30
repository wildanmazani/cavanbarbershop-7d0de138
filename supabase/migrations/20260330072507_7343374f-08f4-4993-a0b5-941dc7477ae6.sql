
CREATE POLICY "Users can claim unclaimed member records"
ON public.members
FOR UPDATE
TO authenticated
USING (user_id IS NULL)
WITH CHECK (auth.uid() = user_id);
