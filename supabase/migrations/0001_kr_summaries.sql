CREATE TABLE kr_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  individual_objective_id uuid NOT NULL REFERENCES individual_objectives(id) ON DELETE CASCADE,
  summary_text text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  based_on_check_in_count int NOT NULL,
  UNIQUE (individual_objective_id)
);
ALTER TABLE kr_summaries DISABLE ROW LEVEL SECURITY;
