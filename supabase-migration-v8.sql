-- ============================================================
-- NodeTalk Migration v8: Group RLS Security Fix
-- ============================================================

-- Ensure group creator can manage members for their newly created group
DROP POLICY IF EXISTS "Admins can manage members" ON public.group_members;

CREATE POLICY "Admins and group creators can manage members" ON public.group_members
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Creator of the group
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_members.group_id AND g.created_by = auth.uid()
    )
    -- Existing admin of the group
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
    )
    -- User joining as self
    OR group_members.user_id = auth.uid()
  );
