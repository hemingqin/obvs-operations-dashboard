import { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader.jsx";
import DataTableShell from "../components/shared/DataTableShell.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import { useOperationsData } from "../hooks/useOperationsData.js";
import { getToken } from "../lib/auth.js";
import { isJsonEqual } from "../lib/equality.js";
import { updateVolunteerProfile } from "../services/operationsService.js";

function ProfilePage() {
  const { profile, volunteerProfile, loading, error } = useOperationsData();
  const [form, setForm] = useState(volunteerProfile);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!volunteerProfile) {
      return;
    }

    setForm((current) =>
      isJsonEqual(current, volunteerProfile) ? current : volunteerProfile
    );
  }, [volunteerProfile]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function updatePreference(field) {
    setForm((current) => ({
      ...current,
      notification_preferences: {
        ...current.notification_preferences,
        [field]: !current.notification_preferences[field]
      }
    }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage("");
    try {
      const saved = await updateVolunteerProfile(getToken(), form);
      setForm(saved);
      setSaveMessage("Profile saved.");
    } catch (requestError) {
      setSaveMessage(requestError instanceof Error ? requestError.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Review your contact information and notification preferences."
        actions={<Badge variant="info">{profile.role || "member"} role</Badge>}
      />

      <section className="content-grid">
        <div className="content-span-2">
          <DataTableShell
            title="Contact information"
            description="Update your contact details and how coordinators can reach you."
            loading={loading}
            hasRows
            actions={
              <Button variant="secondary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save profile"}
              </Button>
            }
          >
            {error ? <p className="form-banner form-banner-error">{error}</p> : null}
            {saveMessage ? <p className="form-banner">{saveMessage}</p> : null}
            <div className="form-grid">
              <Input
                id="profile-name"
                label="Full name"
                value={form.full_name}
                onChange={(event) => updateField("full_name", event.target.value)}
              />
              <Input
                id="profile-email"
                label="Email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
              <Input
                id="profile-phone"
                label="Phone"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
              <Input
                id="profile-location"
                label="Location"
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
              />
              <Input
                id="profile-emergency"
                label="Emergency contact"
                value={form.emergency_contact}
                onChange={(event) => updateField("emergency_contact", event.target.value)}
              />
            </div>
          </DataTableShell>
        </div>

        <DataTableShell
          title="Notification preferences"
          description="Choose how you'd like to receive updates."
          loading={false}
          hasRows
        >
          <div className="preference-stack">
            {Object.entries(form.notification_preferences).map(([key, value]) => (
              <button
                key={key}
                type="button"
                className={value ? "preference-item active" : "preference-item"}
                onClick={() => updatePreference(key)}
              >
                <span>{key.replace(/_/g, " ")}</span>
                <Badge variant={value ? "success" : "default"}>
                  {value ? "Enabled" : "Disabled"}
                </Badge>
              </button>
            ))}
          </div>
        </DataTableShell>
      </section>
    </>
  );
}

export default ProfilePage;
