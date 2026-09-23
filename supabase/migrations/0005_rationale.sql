CREATE TABLE rationale (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id uuid NOT NULL REFERENCES individual_objectives(id) ON DELETE CASCADE,
  question_key text NOT NULL,
  answer text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX rationale_target_id_idx ON rationale (target_id);
ALTER TABLE rationale DISABLE ROW LEVEL SECURITY;
