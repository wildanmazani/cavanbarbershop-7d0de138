
CREATE POLICY "Users can insert own visits" ON visits FOR INSERT TO authenticated WITH CHECK (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
