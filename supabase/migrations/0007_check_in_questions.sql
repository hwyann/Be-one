CREATE TABLE check_in_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id uuid NOT NULL REFERENCES check_ins(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  reply_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  replied_at timestamptz
);
CREATE INDEX check_in_questions_check_in_id_idx ON check_in_questions (check_in_id);
ALTER TABLE check_in_questions DISABLE ROW LEVEL SECURITY;
