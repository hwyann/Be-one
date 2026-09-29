-- Traffic-light status for a member's own OKR (on_track/at_risk/behind),
-- separate from the existing `status` column (which holds draft/confirmed,
-- see #B17/0010_individual_objectives_status.sql). Before this, the status
-- dot on an individual objective's card had no real backing field of its
-- own -- the editor wrote through a hook targeting company_objectives with
-- an individual_objectives id, which silently affected zero rows. This
-- gives it a real, correctly-scoped home. Defaults every row (existing and
-- new) to 'not_started', matching company_objectives' own default.
ALTER TABLE individual_objectives
ADD COLUMN progress_status text NOT NULL DEFAULT 'not_started'
CHECK (progress_status IN ('not_started', 'on_track', 'at_risk', 'behind'));
