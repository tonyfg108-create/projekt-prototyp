-- 1. Přidání gamifikačních sloupců do profilu
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS reputation INT DEFAULT 100,
ADD COLUMN IF NOT EXISTS streak_days INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- 2. Zabezpečení Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks are viewable by everyone" ON tasks FOR SELECT USING (true);
CREATE POLICY "Submissions viewable by user or if approved" ON task_submissions FOR SELECT USING (auth.uid() = user_id OR status = 'approved');
CREATE POLICY "Users can insert own submissions" ON task_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Anti-Cheat: Omezení na max 5 odeslání za hodinu
CREATE OR REPLACE FUNCTION check_submission_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INT;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM task_submissions
  WHERE user_id = NEW.user_id
  AND created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 5 submissions per hour.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_rate_limit ON task_submissions;
CREATE TRIGGER enforce_rate_limit
BEFORE INSERT ON task_submissions
FOR EACH ROW EXECUTE FUNCTION check_submission_rate_limit();
