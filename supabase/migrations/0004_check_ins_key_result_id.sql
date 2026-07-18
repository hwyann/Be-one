ALTER TABLE check_ins
ADD COLUMN key_result_id uuid REFERENCES key_results(id);
