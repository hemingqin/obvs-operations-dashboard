import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader.jsx";
import DataTableShell from "../components/shared/DataTableShell.jsx";
import EmptyState from "../components/shared/EmptyState.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Dialog from "../components/ui/Dialog.jsx";
import Input from "../components/ui/Input.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table.jsx";
import { formatCurrency, formatDate, useOperationsData } from "../hooks/useOperationsData.js";
import { readApiError } from "../lib/api.js";
import { clearToken, getToken } from "../lib/auth.js";
import { downloadCsv } from "../lib/csv.js";
import { createDonation } from "../services/operationsService.js";

const sortableColumns = {
  amount: (donation) => Number(donation.amount || 0),
  created_at: (donation) => new Date(donation.created_at).getTime()
};

function DonationsPage() {
  const navigate = useNavigate();
  const { donations, loading, error, reload, metrics } = useOperationsData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sort, setSort] = useState({ key: "created_at", dir: "desc" });

  const filteredDonations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return donations;
    }

    return donations.filter((donation) =>
      donation.donor_name.toLowerCase().includes(query)
    );
  }, [donations, search]);

  const sortedDonations = useMemo(() => {
    const getValue = sortableColumns[sort.key];
    return [...filteredDonations].sort((left, right) =>
      sort.dir === "asc" ? getValue(left) - getValue(right) : getValue(right) - getValue(left)
    );
  }, [filteredDonations, sort]);

  function toggleSort(key) {
    setSort((current) => ({
      key,
      dir: current.key === key && current.dir === "desc" ? "asc" : "desc"
    }));
  }

  function sortIndicator(key) {
    if (sort.key !== key) {
      return "";
    }
    return sort.dir === "asc" ? " ▲" : " ▼";
  }

  function handleExportCsv() {
    const rows = [
      ["ID", "Donor", "Amount", "Created"],
      ...filteredDonations.map((donation) => [
        donation.id,
        donation.donor_name,
        Number(donation.amount || 0).toFixed(2),
        donation.created_at
      ])
    ];

    downloadCsv(`donations-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }

  const filteredTotal = useMemo(
    () =>
      filteredDonations.reduce(
        (sum, donation) => sum + Number(donation.amount || 0),
        0
      ),
    [filteredDonations]
  );

  const latestVisibleDonation = filteredDonations[0] || metrics.latestDonation;

  async function handleCreateDonation(event) {
    event.preventDefault();
    setFormError("");

    const token = getToken();
    if (!token) {
      clearToken();
      navigate("/login", { replace: true });
      return;
    }

    const normalizedName = donorName.trim();
    const normalizedAmount = Number(amount);

    if (!normalizedName) {
      setFormError("Donor name is required.");
      return;
    }

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      setFormError("Amount must be greater than zero.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await createDonation(token, {
        donor_name: normalizedName,
        amount: normalizedAmount
      });

      if (response.status === 401) {
        clearToken();
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(await readApiError(response, `Create failed with status ${response.status}`));
      }

      setDonorName("");
      setAmount("");
      setDialogOpen(false);
      await reload();
    } catch (requestError) {
      setFormError(
        requestError instanceof Error ? requestError.message : "Failed to create donation"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Fundraising"
        title="Donations ledger"
        description="Search the donation stream, review key fundraising signals, and add new records without leaving the dashboard."
        actions={
          <>
            {loading ? <Badge variant="warning">Syncing</Badge> : null}
            <Button variant="secondary" onClick={handleExportCsv} disabled={!filteredDonations.length}>
              Export CSV
            </Button>
            <Button onClick={() => setDialogOpen(true)}>Add donation</Button>
          </>
        }
      />

      {error ? <p className="form-banner form-banner-error">{error}</p> : null}

      <section className="stats-grid">
        <div className="mini-stat-card">
          <span className="summary-label">Total amount</span>
          <strong>{formatCurrency(filteredTotal)}</strong>
        </div>
        <div className="mini-stat-card">
          <span className="summary-label">Donation count</span>
          <strong>{filteredDonations.length}</strong>
        </div>
        <div className="mini-stat-card">
          <span className="summary-label">Latest donation</span>
          <strong>
            {latestVisibleDonation
              ? formatCurrency(Number(latestVisibleDonation.amount || 0))
              : formatCurrency(0)}
          </strong>
        </div>
        <div className="mini-stat-card">
          <span className="summary-label">Latest donor</span>
          <strong>{latestVisibleDonation?.donor_name || "No records yet"}</strong>
        </div>
      </section>

      <DataTableShell
        title="All donations"
        description="All recorded donations, sorted by most recent."
        badge={`${filteredDonations.length} rows`}
        loading={loading}
        hasRows={filteredDonations.length > 0}
        emptyTitle={search ? "No donors match this search" : "No donations found"}
        emptyDescription={
          search
            ? "Try a different donor name or clear the search."
            : "Add a donation to start building the fundraising ledger."
        }
        actions={
          <div className="toolbar-inline">
            <Input
              id="donation-search"
              label=""
              placeholder="Search by donor name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="toolbar-field"
            />
            {search ? (
              <Button variant="ghost" size="sm" onClick={() => setSearch("")}>
                Clear
              </Button>
            ) : null}
          </div>
        }
      >
        {filteredDonations.length === 0 ? (
          <EmptyState
            title={search ? "No donors found" : "No donation records yet"}
            description={
              search
                ? "Adjust the donor search to broaden the results."
                : "Your donation ledger will appear here as records come in."
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>
                  <button type="button" className="table-sort-button" onClick={() => toggleSort("amount")}>
                    Amount{sortIndicator("amount")}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="table-sort-button" onClick={() => toggleSort("created_at")}>
                    Created{sortIndicator("created_at")}
                  </button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDonations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>#{donation.id}</TableCell>
                  <TableCell>{donation.donor_name}</TableCell>
                  <TableCell>{formatCurrency(Number(donation.amount || 0))}</TableCell>
                  <TableCell>{formatDate(donation.created_at)}</TableCell>
                  <TableCell>
                    <div className="table-actions">
                      <Button variant="ghost" size="sm" disabled>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" disabled>
                        Delete
                      </Button>
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
        title="Add donation"
        description="Record a new donation to the fundraising ledger."
        onClose={() => {
          if (!submitting) {
            setDialogOpen(false);
            setFormError("");
          }
        }}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={submitting}
              onClick={() => {
                setDialogOpen(false);
                setFormError("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" form="create-donation-form" disabled={submitting}>
              {submitting ? "Saving..." : "Save donation"}
            </Button>
          </>
        }
      >
        <form id="create-donation-form" className="dialog-form" onSubmit={handleCreateDonation}>
          <Input
            id="donor-name"
            label="Donor name"
            placeholder="Enter donor name"
            value={donorName}
            onChange={(event) => setDonorName(event.target.value)}
          />
          <Input
            id="donation-amount"
            label="Amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            hint="Currency is formatted in USD across the dashboard."
          />
          {formError ? <p className="form-banner form-banner-error">{formError}</p> : null}
        </form>
      </Dialog>
    </>
  );
}

export default DonationsPage;
