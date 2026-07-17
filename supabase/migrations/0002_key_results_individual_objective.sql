ALTER TABLE key_results
ADD COLUMN individual_objective_id uuid REFERENCES individual_objectives(id);
