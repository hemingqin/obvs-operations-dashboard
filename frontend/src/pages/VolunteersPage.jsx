import { useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader.jsx";
import DataTableShell from "../components/shared/DataTableShell.jsx";
import EmptyState from "../components/shared/EmptyState.jsx";
import StatCard from "../components/shared/StatCard.jsx";
import Badge from "../components/ui/Badge.jsx";
import Input from "../components/ui/Input.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table.jsx";
import { formatDate } from "../hooks/useOperationsData.js";
import { volunteerDirectory } from "../lib/mockData.js";

const statusOptions = ["All", "Active", "Unavailable", "Onboarding", "Inactive"];

const statusVariant = {
  Active: "success",
  Unavailable: "warning",
  Onboarding: "info",
  Inactive: "default"
};

const backgroundCheckVariant = {
  Cleared: "success",
  Pending: "warning",
  Expired: "danger"
};

function VolunteersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [programFilter, setProgramFilter] = useState("All");

  const programOptions = useMemo(
    () => ["All", ...new Set(volunteerDirectory.map((volunteer) => volunteer.program))],
    []
  );

  const filteredVolunteers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return volunteerDirectory.filter((volunteer) => {
      const matchesQuery =
        !query ||
        volunteer.name.toLowerCase().includes(query) ||
        volunteer.program.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All" || volunteer.status === statusFilter;
      const matchesProgram = programFilter === "All" || volunteer.program === programFilter;
      return matchesQuery && matchesStatus && matchesProgram;
    });
  }, [search, statusFilter, programFilter]);

  const summary = useMemo(
    () => ({
      active: volunteerDirectory.filter((volunteer) => volunteer.status === "Active").length,
      pendingOnboarding: volunteerDirectory.filter((volunteer) => volunteer.onboarding === "In progress")
        .length,
      backgroundChecksPending: volunteerDirectory.filter(
        (volunteer) => volunteer.background_check === "Pending"
      ).length,
      upcomingShifts: volunteerDirectory.filter((volunteer) => Boolean(volunteer.upcoming_shift)).length
    }),
    []
  );

  return (
    <>
      <PageHeader
        eyebrow="Volunteer management"
        title="Volunteers"
        description="Search the volunteer directory, track onboarding, and see who is covering upcoming shifts."
      />

      <section className="stats-grid">
        <StatCard label="Active volunteers" value={summary.active} detail="Cleared and available for shifts." />
        <StatCard
          label="Pending onboarding"
          value={summary.pendingOnboarding}
          detail="Awaiting orientation or paperwork."
        />
        <StatCard
          label="Background checks pending"
          value={summary.backgroundChecksPending}
          detail="Required before first shift."
        />
        <StatCard label="Upcoming shifts" value={summary.upcomingShifts} detail="Scheduled across all programs." />
      </section>

      <DataTableShell
        title="Volunteer directory"
        description="Every registered volunteer, their program, and current standing."
        badge={`${filteredVolunteers.length} volunteers`}
        loading={false}
        hasRows={filteredVolunteers.length > 0}
        emptyTitle="No volunteers match these filters"
        emptyDescription="Try a different search term or broaden the filters."
        actions={
          <div className="toolbar-inline">
            <Input
              id="volunteer-search"
              label=""
              placeholder="Search by name or program"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="toolbar-field"
            />
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
              <span className="toolbar-label">Program</span>
              <select
                className="select-input"
                value={programFilter}
                onChange={(event) => setProgramFilter(event.target.value)}
              >
                {programOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        }
      >
        {filteredVolunteers.length === 0 ? (
          <EmptyState
            title="No matching volunteers"
            description="Adjust your search or filters to see more of the directory."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Volunteer</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last activity</TableHead>
                <TableHead>Upcoming shift</TableHead>
                <TableHead>Background check</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVolunteers.map((volunteer) => (
                <TableRow key={volunteer.id}>
                  <TableCell>
                    <div className="table-cell-stack">
                      <strong>{volunteer.name}</strong>
                      <span className="activity-meta">{volunteer.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{volunteer.program}</TableCell>
                  <TableCell>
                    <div className="filter-chips">
                      {volunteer.skills.map((skill) => (
                        <Badge key={skill} variant="default">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[volunteer.status] || "default"}>{volunteer.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(volunteer.last_activity)}</TableCell>
                  <TableCell>
                    {volunteer.upcoming_shift ? formatDate(volunteer.upcoming_shift) : "Not scheduled"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={backgroundCheckVariant[volunteer.background_check] || "default"}>
                      {volunteer.background_check}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTableShell>
    </>
  );
}

export default VolunteersPage;
