-- Run this in Supabase → SQL Editor
-- Fixes the leaderboard by using RLS instead of SECURITY DEFINER

-- 1. Allow users to read their friends' workout_sets (for leaderboard)
CREATE POLICY "friends can view workout sets" ON workout_sets
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM friends
      WHERE friends.user_id = auth.uid()
        AND friends.friend_id = workout_sets.user_id
    )
  );

-- 2. Drop the old SECURITY DEFINER function (no longer needed)
DROP FUNCTION IF EXISTS get_leaderboard(text);
