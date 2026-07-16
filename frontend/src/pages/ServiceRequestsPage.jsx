import { useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader.jsx";
import DataTableShell from "../components/shared/DataTableShell.jsx";
import EmptyState from "../components/shared/EmptyState.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Dialog from "../components/ui/Dialog.jsx";
import Input from "../components/ui/Input.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table.jsx";
import { formatDate, useOperationsData } from "../hooks/useOperationsData.js";
import { getToken } from "../lib/auth.js";
import { createServiceRequest } from "../services/operationsService.js";

const statusOptions = ["All", "Open", "Assigned", "In progress", "Completed", "Cancelled"];
const priorityOptions = ["All", "Urgent", "High", "Medium", "Low"];

const statusVariant = {
  Open: "info",
  Assigned: "warning",
  "In progress": "success",
  Completed: "default",
  Cancelled: "danger"
};

const priorityVariant = {
  Urgent: "danger",
  High: "warning",
  Medium: "info",
  Low: "default"
};

function ServiceRequestsPage() {
  const { serviceRequests, loading, error, reload } = useOperationsData();
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortDir, setSortDir] = useState("desc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    client_name: "",
    service_type: "",
    location: "",
    priority: "Medium",
    notes: "",
    preferred_date: ""
  });

  const filteredRequests = useMemo(() => {
    const filtered = serviceRequests.filter((request) => {
      const matchesStatus = statusFilter === "All" || request.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || request.priority === priorityFilter;
      return matchesStatus && matchesPriority;
    });

    return [...filtered].sort((left, right) => {
      const leftTime = new Date(left.created_at).getTime();
      const rightTime = new Date(right.created_at).getTime();
      return sortDir === "asc" ? leftTime - rightTime : rightTime - leftTime;
    });
  }, [serviceRequests, statusFilter, priorityFilter, sortDir]);

  const requestMetrics = useMemo(
    () => ({
      open: serviceRequests.filter((request) => request.status === "Open").length,
      assigned: serviceRequests.filter((request) => request.status === "Assigned").length,
      highPriority: serviceRequests.filter((request) => request.priority === "High").length,
      urgentPriority: serviceRequests.filter((request) => request.priority === "Urgent").length
    }),
    [serviceRequests]
  );

  function updateField(field, value) {
    setFormValues((current) => ({
      ...current,
      [field]: value
    }));
  }

  function resetForm() {
    setFormValues({
      client_name: "",
      service_type: "",
      location: "",
      priority: "Medium",
      notes: "",
      preferred_date: ""
    });
    setFormError("");
  }

  async function handleCreateRequest(event) {
    event.preventDefault();
    setFormError("");

    if (!formValues.client_name.trim()) {
      setFormError("Client name is required.");
      return;
    }

    if (!formValues.service_type.trim()) {
      setFormError("Service type is required.");
      return;
    }

    if (!formValues.location.trim()) {
      setFormError("Location is required.");
      return;
    }

    setSubmitting(true);
    try {
      await createServiceRequest(getToken(), {
        client_name: formValues.client_name.trim(),
        service_type: formValues.service_type.trim(),
        location: formValues.location.trim(),
        priority: formValues.priority,
        notes: formValues.notes.trim(),
        preferred_date: formValues.preferred_date
      });
      setDialogOpen(false);
      resetForm();
      await reload();
    } catch (requestError) {
      setFormError(
        requestError instanceof Error ? requestError.message : "Failed to create request"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Field operations"
        title="Service requests"
        description="Coordinate client support needs with status, priority, and assignment visibility built for nonprofit teams."
        actions={<Button onClick={() => setDialogOpen(true)}>Create request</Button>}
      />

      {error ? <p className="form-banner form-banner-error">{error}</p> : null}

      <section className="stats-grid">
        <div className="mini-stat-card">
          <span className="summary-label">Open requests</span>
          <strong>{requestMetrics.open}</strong>
        </div>
        <div className="mini-stat-card">
          <span className="summary-label">Assigned</span>
          <strong>{requestMetrics.assigned}</strong>
        </div>
        <div className="mini-stat-card">
          <span className="summary-label">High priority</span>
          <strong>{requestMetrics.highPriority}</strong>
        </div>
        <div className="mini-stat-card">
          <span className="summary-label">Urgent priority</span>
          <strong>{requestMetrics.urgentPriority}</strong>
        </div>
      </section>

      <DataTableShell
        title="Active request queue"
        description="Filter the request queue by status and priority."
        badge={`${filteredRequests.length} requests`}
        loading={loading}
        hasRows={filteredRequests.length > 0}
        emptyTitle="No service requests match these filters"
        emptyDescription="Try broadening the filters or create a new request."
        actions={
          <div className="toolbar-inline">
            <label className="toolbar-select-wrap">
              <span className="toolbar-label">Status</span>
              <select
                className="select-input"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="toolbar-select-wrap">
              <span className="toolbar-label">Priority</span>
              <select
                className="select-input"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
              >
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        }
      >
        {filteredRequests.length === 0 ? (
          <EmptyState
            title="No matching requests"
            description="Your selected status and priority filters returned no active requests."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="table-sort-button"
                    onClick={() => setSortDir((current) => (current === "asc" ? "desc" : "asc"))}
                  >
                    Created{sortDir === "asc" ? " ▲" : " ▼"}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{request.client_name}</TableCell>
                  <TableCell>
                    <div className="table-cell-stack">
                      <strong>{request.service_type}</strong>
                      <span className="activity-meta">{request.notes || "No notes"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityVariant[request.priority] || "default"}>{request.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[request.status] || "default"}>{request.status}</Badge>
                  </TableCell>
                  <TableCell>{request.location}</TableCell>
                  <TableCell>{request.assignee_name}</TableCell>
                  <TableCell>{formatDate(request.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTableShell>

      <Dialog
        open={dialogOpen}
        title="Create service request"
        description="Add a new request to the active queue."
        onClose={() => {
          if (!submitting) {
            setDialogOpen(false);
            resetForm();
          }
        }}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={submitting}
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" form="create-service-request-form" disabled={submitting}>
              {submitting ? "Creating..." : "Create request"}
            </Button>
          </>
        }
      >
        <form
          id="create-service-request-form"
          className="dialog-form"
          onSubmit={handleCreateRequest}
        >
          <Input
            id="client-name"
            label="Client name"
            placeholder="Enter client name"
            value={formValues.client_name}
            onChange={(event) => updateField("client_name", event.target.value)}
          />
          <Input
            id="service-type"
            label="Service type"
            placeholder="Examples: Pantry delivery, Transportation"
            value={formValues.service_type}
            onChange={(event) => updateField("service_type", event.target.value)}
          />
          <Input
            id="service-location"
            label="Location"
            placeholder="Enter service location"
            value={formValues.location}
            onChange={(event) => updateField("location", event.target.value)}
          />
          <label className="field" htmlFor="service-priority">
            <span className="field-label">Priority</span>
            <select
              id="service-priority"
              className="select-input"
              value={formValues.priority}
              onChange={(event) => updateField("priority", event.target.value)}
            >
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>
          <Input
            id="preferred-date"
            label="Preferred date"
            type="date"
            value={formValues.preferred_date}
            onChange={(event) => updateField("preferred_date", event.target.value)}
          />
          <label className="field" htmlFor="service-notes">
            <span className="field-label">Notes</span>
            <textarea
              id="service-notes"
              className="text-area"
              placeholder="Add request context, accessibility notes, or scheduling details"
              value={formValues.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              rows="4"
            />
          </label>
          {formError ? <p className="form-banner form-banner-error">{formError}</p> : null}
        </form>
      </Dialog>
    </>
  );
}

export default ServiceRequestsPage;
