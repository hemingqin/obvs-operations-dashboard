import { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader.jsx";
import DataTableShell from "../components/shared/DataTableShell.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { useOperationsData } from "../hooks/useOperationsData.js";
import { getToken } from "../lib/auth.js";
import { isJsonEqual } from "../lib/equality.js";
import { updateVolunteerServices } from "../services/operationsService.js";

function VolunteerMyServicesPage() {
  const { volunteerServices, loading, error } = useOperationsData();
  const [services, setServices] = useState(volunteerServices);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    setServices((current) =>
      isJsonEqual(current, volunteerServices) ? current : volunteerServices
    );
  }, [volunteerServices]);

  function toggleService(id) {
    setServices((current) =>
      current.map((service) =>
        service.id === id ? { ...service, selected: !service.selected } : service
      )
    );
  }

  const selectedCount = services.filter((service) => service.selected).length;

  async function handleSave() {
    setSaving(true);
    setSaveMessage("");
    try {
      const saved = await updateVolunteerServices(getToken(), services);
      setServices(saved);
      setSaveMessage("Services saved.");
    } catch (requestError) {
      setSaveMessage(requestError instanceof Error ? requestError.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Volunteer skills"
        title="My services"
        description="Select the service categories you are comfortable supporting."
        actions={<Badge variant="info">{selectedCount} selected</Badge>}
      />

      <DataTableShell
        title="Service categories"
        description="Selections now persist through the volunteer services backend endpoints."
        loading={loading}
        hasRows
        actions={
          <Button variant="secondary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save services"}
          </Button>
        }
      >
        {error ? <p className="form-banner form-banner-error">{error}</p> : null}
        {saveMessage ? <p className="form-banner">{saveMessage}</p> : null}
        <div className="services-grid">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              className={service.selected ? "service-option active" : "service-option"}
              onClick={() => toggleService(service.id)}
            >
              <span>{service.label}</span>
              <Badge variant={service.selected ? "success" : "default"}>
                {service.selected ? "Selected" : "Optional"}
              </Badge>
            </button>
          ))}
        </div>
      </DataTableShell>
    </>
  );
}

export default VolunteerMyServicesPage;
