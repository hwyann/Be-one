-- #B6: 0002 added individual_objective_id but never relaxed the original
-- NOT NULL constraint on objective_id, so every individual Key Result insert
-- (objective_id: null, individual_objective_id: <uuid>) has always failed
-- with 23502. Drop the constraint, and add a CHECK enforcing exactly one of
-- objective_id / individual_objective_id is set, matching the app-level
-- guard already in useKrMutation.create.

ALTER TABLE key_results ALTER COLUMN objective_id DROP NOT NULL;

ALTER TABLE key_results
ADD CONSTRAINT key_results_exactly_one_parent CHECK (
  (objective_id IS NOT NULL AND individual_objective_id IS NULL)
  OR
  (objective_id IS NULL AND individual_objective_id IS NOT NULL)
);
