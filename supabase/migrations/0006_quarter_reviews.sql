CREATE TABLE quarter_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id uuid NOT NULL REFERENCES individual_objectives(id) ON DELETE CASCADE,
  final_status text,
  member_reflection text,
  member_confirmed_at timestamptz,
  manager_comment text,
  manager_confirmed_at timestamptz,
  finalized_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX quarter_reviews_objective_id_idx ON quarter_reviews (objective_id);
ALTER TABLE quarter_reviews DISABLE ROW LEVEL SECURITY;
