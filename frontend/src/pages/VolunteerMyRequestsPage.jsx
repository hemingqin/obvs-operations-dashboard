import PageHeader from "../components/layout/PageHeader.jsx";
import DataTableShell from "../components/shared/DataTableShell.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table.jsx";
import { formatDate, useOperationsData } from "../hooks/useOperationsData.js";

function VolunteerMyRequestsPage() {
  const { volunteerAssignments, loading, error } = useOperationsData();

  return (
    <>
      <PageHeader
        eyebrow="Volunteer tasks"
        title="My requests"
        description="Track the service requests assigned to you and move each assignment forward."
      />

      <DataTableShell
        title="Assigned service requests"
        description="Action buttons are UI-only for now and ready for future workflow APIs."
        badge={`${volunteerAssignments.length} requests`}
        loading={loading}
        hasRows={volunteerAssignments.length > 0}
        emptyTitle="No assigned requests"
        emptyDescription="You will see requests here once coordinators assign them."
      >
        {error ? <p className="form-banner form-banner-error">{error}</p> : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {volunteerAssignments.map((request) => (
              <TableRow key={request.id}>
                <TableCell>#{request.id}</TableCell>
                <TableCell>{request.client_name}</TableCell>
                <TableCell>{request.service_type}</TableCell>
                <TableCell>
                  <Badge variant={request.status === "In progress" ? "info" : "default"}>
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(request.created_at)}</TableCell>
                <TableCell>
                  <Button variant="secondary" size="sm">
                    {request.status === "Assigned" ? "Confirm task" : "View details"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableShell>
    </>
  );
}

export default VolunteerMyRequestsPage;
