import { useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader.jsx";
import DataTableShell from "../components/shared/DataTableShell.jsx";
import EmptyState from "../components/shared/EmptyState.jsx";
import StatCard from "../components/shared/StatCard.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Dialog from "../components/ui/Dialog.jsx";
import Input from "../components/ui/Input.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table.jsx";
import { formatDate } from "../hooks/useOperationsData.js";
import { userAccounts } from "../lib/mockData.js";

const roleOptions = ["All", "Admin", "Coordinator", "Volunteer"];
const statusOptions = ["All", "Active", "Disabled", "Pending"];

const statusVariant = {
  Active: "success",
  Disabled: "danger",
  Pending: "info"
};

let nextUserId = userAccounts.length + 1;

function UsersPage() {
  const [users, setUsers] = useState(userAccounts);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState({ name: "", email: "", role: "Coordinator" });
  const [formError, setFormError] = useState("");
  const [rowMessages, setRowMessages] = useState({});

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesStatus = statusFilter === "All" || user.status === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const summary = useMemo(
    () => ({
      active: users.filter((user) => user.status === "Active").length,
      pending: users.filter((user) => user.status === "Pending").length,
      disabled: users.filter((user) => user.status === "Disabled").length,
      admins: users.filter((user) => user.role === "Admin").length
    }),
    [users]
  );

  function showRowMessage(id, message) {
    setRowMessages((current) => ({ ...current, [id]: message }));
    window.setTimeout(() => {
      setRowMessages((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    }, 3000);
  }

  function toggleAccountStatus(id) {
    setUsers((current) =>
      current.map((user) => {
        if (user.id !== id) {
          return user;
        }

        const nextStatus = user.status === "Disabled" ? "Active" : "Disabled";
        showRowMessage(id, nextStatus === "Disabled" ? "Account disabled" : "Account re-enabled");
        return { ...user, status: nextStatus };
      })
    );
  }

  function resetPassword(id) {
    showRowMessage(id, "Password reset link sent");
  }

  function handleCreateUser(event) {
    event.preventDefault();
    setFormError("");

    if (!formValues.name.trim()) {
      setFormError("Name is required.");
      return;
    }

    if (!formValues.email.trim()) {
      setFormError("Email is required.");
      return;
    }

    const newUser = {
      id: `USR-${String(nextUserId++).padStart(2, "0")}`,
      name: formValues.name.trim(),
      email: formValues.email.trim(),
      role: formValues.role,
      status: "Pending",
      last_login: null,
      permissions:
        formValues.role === "Admin"
          ? "Full workspace access"
          : formValues.role === "Coordinator"
            ? "Manage requests, volunteers, donations"
            : "View assignments, edit own profile"
    };

    setUsers((current) => [newUser, ...current]);
    setDialogOpen(false);
    setFormValues({ name: "", email: "", role: "Coordinator" });
  }

  return (
    <>
      <PageHeader
        eyebrow="Access control"
        title="Users"
        description="Manage accounts, roles, and access across the platform."
        actions={<Button onClick={() => setDialogOpen(true)}>Create user</Button>}
      />

      <section className="stats-grid">
        <StatCard label="Active users" value={summary.active} detail="Signed in and in good standing." />
        <StatCard label="Pending invites" value={summary.pending} detail="Awaiting first sign-in." />
        <StatCard label="Disabled accounts" value={summary.disabled} detail="Access currently revoked." />
        <StatCard label="Admins" value={summary.admins} detail="Full workspace access." />
      </section>

      <DataTableShell
        title="All users"
        description="Every account with access to this workspace."
        badge={`${filteredUsers.length} users`}
        loading={false}
        hasRows={filteredUsers.length > 0}
        emptyTitle="No users match these filters"
        emptyDescription="Try a different search term or broaden the filters."
        actions={
          <div className="toolbar-inline">
            <Input
              id="user-search"
              label=""
              placeholder="Search by name or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="toolbar-field"
            />
            <label className="toolbar-select-wrap">
              <span className="toolbar-label">Role</span>
              <select className="select-input" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                {roleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
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
          </div>
        }
      >
        {filteredUsers.length === 0 ? (
          <EmptyState title="No matching users" description="Adjust your search or filters to see more accounts." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="table-cell-stack">
                      <strong>{user.name}</strong>
                      <span className="activity-meta">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[user.status] || "default"}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>{user.last_login ? formatDate(user.last_login) : "Never"}</TableCell>
                  <TableCell>{user.permissions}</TableCell>
                  <TableCell>
                    <div className="table-cell-stack">
                      <div className="table-actions">
                        <Button variant="ghost" size="sm" onClick={() => resetPassword(user.id)}>
                          Reset password
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAccountStatus(user.id)}
                          disabled={user.status === "Pending"}
                        >
                          {user.status === "Disabled" ? "Enable" : "Disable"}
                        </Button>
                      </div>
                      {rowMessages[user.id] ? (
                        <span className="activity-meta">{rowMessages[user.id]}</span>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTableShell>

      <Dialog
        open={dialogOpen}
        title="Create user"
        description="Invite a new teammate to this workspace."
        onClose={() => setDialogOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="create-user-form">
              Send invite
            </Button>
          </>
        }
      >
        <form id="create-user-form" className="dialog-form" onSubmit={handleCreateUser}>
          <Input
            id="user-name"
            label="Full name"
            placeholder="Enter full name"
            value={formValues.name}
            onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
          />
          <Input
            id="user-email"
            label="Email"
            type="email"
            placeholder="name@obvs.org"
            value={formValues.email}
            onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))}
          />
          <label className="field" htmlFor="user-role">
            <span className="field-label">Role</span>
            <select
              id="user-role"
              className="select-input"
              value={formValues.role}
              onChange={(event) => setFormValues((current) => ({ ...current, role: event.target.value }))}
            >
              <option value="Admin">Admin</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Volunteer">Volunteer</option>
            </select>
          </label>
          {formError ? <p className="form-banner form-banner-error">{formError}</p> : null}
        </form>
      </Dialog>
    </>
  );
}

export default UsersPage;
