-- Adds a draft/confirmed status to individual_objectives so the Add
-- Objective modal can offer "Save as draft" vs "Confirm OKR for <quarter>"
-- instead of a single unconditional Save. Existing rows default to
-- 'confirmed' since they were created before this distinction existed and
-- were already being treated as final.

ALTER TABLE individual_objectives
ADD COLUMN status text NOT NULL DEFAULT 'confirmed';

ALTER TABLE individual_objectives
ADD CONSTRAINT individual_objectives_status_check CHECK (status IN ('draft', 'confirmed'));

ALTER TABLE individual_objectives
ALTER COLUMN status SET DEFAULT 'draft';
