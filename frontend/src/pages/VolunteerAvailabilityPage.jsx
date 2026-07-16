import { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader.jsx";
import DataTableShell from "../components/shared/DataTableShell.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { useOperationsData } from "../hooks/useOperationsData.js";
import { getToken } from "../lib/auth.js";
import { isJsonEqual } from "../lib/equality.js";
import { updateVolunteerAvailability } from "../services/operationsService.js";

function VolunteerAvailabilityPage() {
  const { volunteerAvailability, loading, error } = useOperationsData();
  const [schedule, setSchedule] = useState(volunteerAvailability);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    setSchedule((current) =>
      isJsonEqual(current, volunteerAvailability) ? current : volunteerAvailability
    );
  }, [volunteerAvailability]);

  function toggleSlot(dayLabel, slot) {
    setSchedule((current) =>
      current.map((day) =>
        day.day === dayLabel ? { ...day, [slot]: !day[slot] } : day
      )
    );
  }

  const availableBlocks = schedule.reduce(
    (count, day) => count + [day.morning, day.afternoon, day.evening].filter(Boolean).length,
    0
  );

  async function handleSave() {
    setSaving(true);
    setSaveMessage("");
    try {
      const saved = await updateVolunteerAvailability(getToken(), schedule);
      setSchedule(saved);
      setSaveMessage("Availability saved.");
    } catch (requestError) {
      setSaveMessage(requestError instanceof Error ? requestError.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Volunteer planning"
        title="Availability"
        description="Keep your weekly availability current so coordinators can assign work accurately."
        actions={<Badge variant="success">{availableBlocks} open blocks</Badge>}
      />

      <DataTableShell
        title="Weekly availability editor"
        description="Changes are saved to your coordinator-visible schedule."
        loading={loading}
        hasRows
        actions={
          <Button variant="secondary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save preferences"}
          </Button>
        }
      >
        {error ? <p className="form-banner form-banner-error">{error}</p> : null}
        {saveMessage ? <p className="form-banner">{saveMessage}</p> : null}
        <div className="availability-grid">
          {schedule.map((day) => (
            <div key={day.day} className="availability-card">
              <p className="availability-day">{day.day}</p>
              <div className="availability-slots">
                {["morning", "afternoon", "evening"].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={day[slot] ? "availability-chip active" : "availability-chip"}
                    onClick={() => toggleSlot(day.day, slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DataTableShell>
    </>
  );
}

export default VolunteerAvailabilityPage;
