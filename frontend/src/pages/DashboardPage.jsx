import { useMemo } from "react";
import PageHeader from "../components/layout/PageHeader.jsx";
import ActivityFeed from "../components/shared/ActivityFeed.jsx";
import DataTableShell from "../components/shared/DataTableShell.jsx";
import NotificationList from "../components/shared/NotificationList.jsx";
import StatCard from "../components/shared/StatCard.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table.jsx";
import { formatCurrency, formatDate, useOperationsData } from "../hooks/useOperationsData.js";

function VolunteerDashboard({ notifications, volunteerAssignments, volunteerTasks, volunteerProfile, volunteerSummary, loading }) {
  const upcomingAssignment = volunteerAssignments[0] || null;

  return (
    <>
      <PageHeader
        eyebrow="Volunteer workspace"
        title="Your dashboard"
        description="Stay on top of assigned requests, upcoming tasks, and your current availability preferences."
        actions={
          <>
            <Badge variant="success">{volunteerProfile.availability_status}</Badge>
            <Button variant="secondary">View task guide</Button>
          </>
        }
      />

      <section className="stats-grid">
        <StatCard
          label="Assigned requests"
          value={volunteerSummary.assignedRequests}
          detail="Current client-facing assignments in your queue."
        />
        <StatCard
          label="Upcoming tasks"
          value={volunteerSummary.upcomingTasks}
          detail="Immediate volunteer actions due soon."
        />
        <StatCard
          label="Available slots"
          value={volunteerSummary.availableSlots}
          detail="Weekly availability blocks currently shared with coordinators."
        />
        <StatCard
          label="Unread notifications"
          value={volunteerSummary.unreadNotifications}
          detail="Unread alerts across requests, system updates, and reminders."
        />
      </section>

      <section className="content-grid">
        <div className="content-span-2">
          <DataTableShell
            title="Assigned request summary"
            description="A focused view of the client support work currently routed to you."
            badge={`${volunteerAssignments.length} assigned`}
            loading={false}
            hasRows={volunteerAssignments.length > 0}
            emptyTitle="No assigned requests"
            emptyDescription="Assignments will appear here when coordinators match work to you."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {volunteerAssignments.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>#{request.id}</TableCell>
                    <TableCell>{request.client_name}</TableCell>
                    <TableCell>{request.service_type}</TableCell>
                    <TableCell>{request.status}</TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                    <TableCell>{request.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTableShell>
        </div>

        <DataTableShell
          title="Availability status"
          description="A quick preview of what coordinators currently see."
          loading={false}
          hasRows
        >
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Current status</span>
              <strong>{volunteerProfile.availability_status}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Services selected</span>
              <strong>{volunteerSummary.selectedServices}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Next assignment</span>
              <strong>{upcomingAssignment ? `#${upcomingAssignment.id}` : "Not assigned"}</strong>
            </div>
          </div>
        </DataTableShell>

        <DataTableShell
          title="Upcoming tasks"
          description="Volunteer-specific to-dos and next steps."
          loading={false}
          hasRows
        >
          <div className="stack-list">
            {volunteerTasks.map((task) => (
              <div key={task.id} className="activity-item">
                <div>
                  <p className="activity-title">{task.title}</p>
                  <p className="activity-meta">{formatDate(task.due_at)}</p>
                </div>
                <Badge variant="info">{task.status}</Badge>
              </div>
            ))}
          </div>
        </DataTableShell>

        <DataTableShell
          title="Notifications"
          description="Unread messages and reminders relevant to your assignments."
          loading={false}
          hasRows
        >
          <NotificationList notifications={notifications.slice(0, 4)} loading={loading} compact />
        </DataTableShell>

        <DataTableShell
          title="Notification preferences"
          description="Preview of the current contact methods set in your profile."
          loading={false}
          hasRows
        >
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Email alerts</span>
              <strong>{volunteerProfile.notification_preferences.email ? "Enabled" : "Disabled"}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Push alerts</span>
              <strong>{volunteerProfile.notification_preferences.push ? "Enabled" : "Disabled"}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Urgent only</span>
              <strong>{volunteerProfile.notification_preferences.urgent_only ? "Yes" : "No"}</strong>
            </div>
          </div>
        </DataTableShell>
      </section>
    </>
  );
}

function OperationsDashboard({ notifications, loading, error, metrics, recentActivity, serviceRequests, profile }) {
  return (
    <>
      <PageHeader
        eyebrow="Nonprofit operations"
        title="Mission control"
        description="A believable internal operations home for fundraising, staffing, requests, and communications."
        actions={
          <>
            <Badge variant="success">{loading ? "Refreshing" : "Today active"}</Badge>
            <Button variant="secondary">Export snapshot</Button>
          </>
        }
      />

      {error ? <p className="form-banner form-banner-error">{error}</p> : null}

      <section className="stats-grid">
        <StatCard
          label="Donation volume"
          value={metrics.totalDonations}
          detail="Records currently available from the live donations endpoint."
          badge="Live"
        />
        <StatCard
          label="Funds raised"
          value={formatCurrency(metrics.totalAmount)}
          detail="Combined value across the current fundraising ledger."
        />
        <StatCard
          label="Open service requests"
          value={metrics.openServiceRequests}
          detail="Persisted service request records from the FastAPI backend."
          badge="Live"
        />
        <StatCard
          label="Notifications sent"
          value={metrics.sentNotifications}
          detail={`${profile.role || "user"} workspace with role-aware navigation.`}
        />
      </section>

      <section className="content-grid">
        <div className="content-span-2">
          <DataTableShell
            title="Open service requests"
            description="A preview of inbound support work the team is managing right now."
            badge={`${serviceRequests.length} active`}
            loading={loading}
            hasRows={serviceRequests.length > 0}
            emptyTitle="No service requests"
            emptyDescription="Open service requests will appear here once that module is wired."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Assignee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="table-cell-stack">
                        <strong>{request.id}</strong>
                        <span className="activity-meta">{request.service_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{request.priority}</TableCell>
                    <TableCell>{request.status}</TableCell>
                    <TableCell>{request.location}</TableCell>
                    <TableCell>{request.assignee_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTableShell>
        </div>

        <DataTableShell
          title="Notifications"
          description="Recent outbound or operational notifications."
          badge={`${notifications.length} total`}
          loading={false}
          hasRows
        >
          <NotificationList notifications={notifications.slice(0, 4)} loading={loading} compact />
        </DataTableShell>

        <DataTableShell
          title="Recent activity"
          description="The latest system events pulled from donation activity."
          loading={false}
          hasRows
        >
          <ActivityFeed items={recentActivity} loading={loading} />
        </DataTableShell>

        <DataTableShell
          title="Operations summary"
          description="High-level context for the current workspace."
          loading={false}
          hasRows
        >
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Average gift</span>
              <strong>{formatCurrency(metrics.averageDonation)}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Largest gift</span>
              <strong>{formatCurrency(metrics.largestDonation)}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Workspace role</span>
              <strong>{profile.role || "unknown"}</strong>
            </div>
          </div>
        </DataTableShell>
      </section>
    </>
  );
}

function DashboardPage() {
  const data = useOperationsData();

  if (data.profile.role === "volunteer") {
    return <VolunteerDashboard {...data} />;
  }

  return <OperationsDashboard {...data} />;
}

export default DashboardPage;
