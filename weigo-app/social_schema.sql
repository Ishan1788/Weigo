-- ─────────────────────────────────────────────────────────────
-- WEIGO Social Schema
-- Run this in Supabase → SQL Editor
-- ─────────────────────────────────────────────────────────────

-- 1. Add email to profiles (needed for friend search by email)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Backfill email for any existing users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Update signup trigger to store email going forward
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email)
  ON CONFLICT (id) DO UPDATE
    SET email     = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN new;
END;
$$;

-- Allow any authenticated user to read profiles (for friend search + leaderboard names)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Authenticated users can read profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────
-- 2. Friend requests
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friend_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      text NOT NULL DEFAULT 'pending', -- pending | accepted | declined
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_self_request CHECK (sender_id <> receiver_id),
  CONSTRAINT unique_request  UNIQUE (sender_id, receiver_id)
);

ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parties can read requests" ON friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "sender can insert" ON friend_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "receiver can update" ON friend_requests
  FOR UPDATE USING (auth.uid() = receiver_id);

-- ─────────────────────────────────────────────────────────────
-- 3. Friends (bidirectional; both A→B and B→A rows stored)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friends (
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, friend_id)
);

ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own friend rows" ON friends
  FOR SELECT USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 4. RPC: accept a friend request (SECURITY DEFINER so it can
--    insert both directions regardless of RLS)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION accept_friend_request(p_request_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  req friend_requests%ROWTYPE;
BEGIN
  SELECT * INTO req
  FROM friend_requests
  WHERE id = p_request_id
    AND receiver_id = auth.uid()
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or not authorized';
  END IF;

  UPDATE friend_requests SET status = 'accepted' WHERE id = p_request_id;

  INSERT INTO friends (user_id, friend_id)
  VALUES (req.receiver_id, req.sender_id) ON CONFLICT DO NOTHING;

  INSERT INTO friends (user_id, friend_id)
  VALUES (req.sender_id, req.receiver_id) ON CONFLICT DO NOTHING;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 5. RPC: leaderboard among current user + their friends
--    (SECURITY DEFINER reads friends' workout_sets safely)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_leaderboard(p_exercise_name text)
RETURNS TABLE (
  rank         bigint,
  user_id      uuid,
  display_name text,
  best_weight  numeric,
  weight_unit  text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH participants AS (
    SELECT friend_id AS uid FROM friends WHERE user_id = auth.uid()
    UNION ALL
    SELECT auth.uid()
  ),
  bests AS (
    SELECT
      ws.user_id,
      MAX(ws.weight) AS best_weight,
      (SELECT ws2.weight_unit
       FROM workout_sets ws2
       WHERE ws2.user_id = ws.user_id
         AND ws2.exercise_name = p_exercise_name
       ORDER BY ws2.weight DESC
       LIMIT 1) AS weight_unit
    FROM workout_sets ws
    WHERE ws.exercise_name = p_exercise_name
      AND ws.user_id IN (SELECT uid FROM participants)
    GROUP BY ws.user_id
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY b.best_weight DESC)::bigint,
    b.user_id,
    COALESCE(p.full_name, 'User')::text,
    b.best_weight,
    COALESCE(b.weight_unit, 'kg')::text
  FROM bests b
  LEFT JOIN profiles p ON p.id = b.user_id
  ORDER BY b.best_weight DESC;
END;
$$;
