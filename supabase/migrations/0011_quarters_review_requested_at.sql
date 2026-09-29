-- Lets a Manager "request" that all members review their OKR for the
-- active quarter. Nullable: null means no request has been made yet;
-- once set, the Member's Review button (gated in the app) becomes usable
-- for that quarter. No backfill needed — existing quarters simply start
-- with no request, matching current behavior before this feature shipped.
ALTER TABLE quarters
ADD COLUMN review_requested_at timestamptz;
