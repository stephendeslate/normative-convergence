-- ─── Row-Level Security Setup ────────────────────────────────────────────────
-- This runs on database initialization to enable RLS policies.
-- The application sets `app.current_practice` via SET LOCAL per transaction.

-- Helper function to get current practice context
CREATE OR REPLACE FUNCTION current_practice_id() RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_practice', TRUE);
END;
$$ LANGUAGE plpgsql STABLE;

-- ─── Enable RLS on practice-scoped tables ────────────────────────────────────

-- tenant_memberships
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_memberships_practice_isolation ON tenant_memberships
  USING (practice_id::text = current_practice_id());

-- provider_profiles
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY provider_profiles_practice_isolation ON provider_profiles
  USING (practice_id::text = current_practice_id());

-- services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY services_practice_isolation ON services
  USING (practice_id::text = current_practice_id());

-- service_providers (join through service)
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_providers_practice_isolation ON service_providers
  USING (service_id IN (SELECT id FROM services WHERE practice_id::text = current_practice_id()));

-- availability_rules (join through provider_profile)
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY availability_rules_practice_isolation ON availability_rules
  USING (provider_profile_id IN (SELECT id FROM provider_profiles WHERE practice_id::text = current_practice_id()));

-- blocked_dates (join through provider_profile)
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY blocked_dates_practice_isolation ON blocked_dates
  USING (provider_profile_id IN (SELECT id FROM provider_profiles WHERE practice_id::text = current_practice_id()));

-- appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY appointments_practice_isolation ON appointments
  USING (practice_id::text = current_practice_id());

-- slot_reservations
ALTER TABLE slot_reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY slot_reservations_practice_isolation ON slot_reservations
  USING (practice_id::text = current_practice_id());

-- video_rooms
ALTER TABLE video_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY video_rooms_practice_isolation ON video_rooms
  USING (appointment_id IN (SELECT id FROM appointments WHERE practice_id::text = current_practice_id()));

-- video_participants
ALTER TABLE video_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY video_participants_practice_isolation ON video_participants
  USING (video_room_id IN (
    SELECT vr.id FROM video_rooms vr
    JOIN appointments a ON vr.appointment_id = a.id
    WHERE a.practice_id::text = current_practice_id()
  ));

-- intake_form_templates
ALTER TABLE intake_form_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY intake_form_templates_practice_isolation ON intake_form_templates
  USING (practice_id::text = current_practice_id());

-- intake_submissions
ALTER TABLE intake_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY intake_submissions_practice_isolation ON intake_submissions
  USING (appointment_id IN (SELECT id FROM appointments WHERE practice_id::text = current_practice_id()));

-- messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY messages_practice_isolation ON messages
  USING (appointment_id IN (SELECT id FROM appointments WHERE practice_id::text = current_practice_id()));

-- notifications (user-scoped, not practice-scoped — no RLS needed for multi-tenancy)

-- appointment_reminders
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY appointment_reminders_practice_isolation ON appointment_reminders
  USING (appointment_id IN (SELECT id FROM appointments WHERE practice_id::text = current_practice_id()));

-- payment_records
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY payment_records_practice_isolation ON payment_records
  USING (appointment_id IN (SELECT id FROM appointments WHERE practice_id::text = current_practice_id()));

-- calendar_connections (user-scoped)

-- calendar_events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY calendar_events_practice_isolation ON calendar_events
  USING (appointment_id IN (SELECT id FROM appointments WHERE practice_id::text = current_practice_id()));

-- audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_practice_isolation ON audit_logs
  USING (practice_id::text = current_practice_id() OR practice_id IS NULL);

-- invitation_tokens
ALTER TABLE invitation_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY invitation_tokens_practice_isolation ON invitation_tokens
  USING (practice_id::text = current_practice_id());

-- consent_records (user-scoped, no practice RLS)

-- ─── Bypass policy for application superuser ─────────────────────────────────
-- The application connects as a single DB user; RLS is enforced via SET LOCAL.
-- Platform admin operations bypass by not setting the practice context.
