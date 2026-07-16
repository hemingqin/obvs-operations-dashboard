import { useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader.jsx";
import BarChart from "../components/shared/BarChart.jsx";
import DataTableShell from "../components/shared/DataTableShell.jsx";
import StatCard from "../components/shared/StatCard.jsx";
import Button from "../components/ui/Button.jsx";
import { cn } from "../lib/utils.js";
import { downloadCsv } from "../lib/csv.js";
import { formatCurrency, formatDate, useOperationsData } from "../hooks/useOperationsData.js";
import { volunteerHoursByWeek } from "../lib/mockData.js";

const rangeOptions = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
  { value: null, label: "All time" }
];

function withinRange(dateValue, days) {
  if (!days) {
    return true;
  }

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(dateValue).getTime() >= cutoff;
}

function dayLabel(dateValue) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(dateValue));
}

function ReportsPage() {
  const { donations, serviceRequests } = useOperationsData();
  const [rangeDays, setRangeDays] = useState(30);

  const filteredDonations = useMemo(
    () => donations.filter((donation) => withinRange(donation.created_at, rangeDays)),
    [donations, rangeDays]
  );

  const filteredRequests = useMemo(
    () => serviceRequests.filter((request) => withinRange(request.created_at, rangeDays)),
    [serviceRequests, rangeDays]
  );

  const donationTrend = useMemo(() => {
    const byDay = new Map();

    filteredDonations.forEach((donation) => {
      const label = dayLabel(donation.created_at);
      byDay.set(label, (byDay.get(label) || 0) + Number(donation.amount || 0));
    });

    return Array.from(byDay.entries())
      .map(([label, amount]) => ({ label, amount }))
      .slice(-12);
  }, [filteredDonations]);

  const requestsByCategory = useMemo(() => {
    const byCategory = new Map();

    filteredRequests.forEach((request) => {
      const key = request.service_type || "Other";
      byCategory.set(key, (byCategory.get(key) || 0) + 1);
    });

    return Array.from(byCategory.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 8);
  }, [filteredRequests]);

  const totalRaised = filteredDonations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
  const totalVolunteerHours = volunteerHoursByWeek.reduce((sum, week) => sum + week.hours, 0);

  function handleExportReport() {
    const rows = [
      ["Report generated", new Date().toISOString()],
      ["Date range", rangeOptions.find((option) => option.value === rangeDays)?.label || "All time"],
      [],
      ["Donation trend"],
      ["Day", "Amount"],
      ...donationTrend.map((item) => [item.label, item.amount.toFixed(2)]),
      [],
      ["Requests by category"],
      ["Category", "Count"],
      ...requestsByCategory.map((item) => [item.label, item.count])
    ];

    downloadCsv(`obvs-report-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Track fundraising, staffing, and service trends across the organization."
        actions={
          <>
            <Button variant="secondary" onClick={handleExportReport}>
              Export report
            </Button>
            <Button onClick={() => window.print()}>Generate report</Button>
          </>
        }
      />

      <div className="date-range-row">
        {rangeOptions.map((option) => (
          <button
            key={option.label}
            type="button"
            className={cn("filter-chip", rangeDays === option.value ? "filter-chip-active" : "")}
            onClick={() => setRangeDays(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <section className="stats-grid">
        <StatCard label="Funds raised" value={formatCurrency(totalRaised)} detail="Within the selected range." />
        <StatCard
          label="Donations recorded"
          value={filteredDonations.length}
          detail="Within the selected range."
        />
        <StatCard
          label="Service requests"
          value={filteredRequests.length}
          detail="Created within the selected range."
        />
        <StatCard
          label="Volunteer hours"
          value={totalVolunteerHours}
          detail="Logged over the last 8 weeks."
        />
      </section>

      <section className="content-grid">
        <div className="content-span-2">
          <DataTableShell
            title="Donation trend"
            description="Daily donation totals within the selected range."
            loading={false}
            hasRows={donationTrend.length > 0}
            emptyTitle="No donations in this range"
            emptyDescription="Widen the date range to see donation activity."
          >
            <BarChart
              data={donationTrend}
              valueKey="amount"
              labelKey="label"
              formatValue={(value) => formatCurrency(value)}
              title="Daily donation totals"
            />
          </DataTableShell>
        </div>

        <DataTableShell
          title="Requests by category"
          description="Where service requests are concentrated."
          loading={false}
          hasRows={requestsByCategory.length > 0}
          emptyTitle="No requests in this range"
          emptyDescription="Widen the date range to see request activity."
        >
          <BarChart
            data={requestsByCategory}
            valueKey="count"
            labelKey="label"
            color="var(--info)"
            title="Requests by category"
          />
        </DataTableShell>

        <DataTableShell
          title="Volunteer hours by week"
          description="Logged volunteer hours across all programs."
          loading={false}
          hasRows
        >
          <BarChart
            data={volunteerHoursByWeek}
            valueKey="hours"
            labelKey="week"
            color="var(--success)"
            title="Volunteer hours by week"
          />
        </DataTableShell>

        <DataTableShell
          title="Report details"
          description="Snapshot generated for the current date range."
          loading={false}
          hasRows
        >
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Range</span>
              <strong>{rangeOptions.find((option) => option.value === rangeDays)?.label}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Generated</span>
              <strong>{formatDate(new Date().toISOString())}</strong>
            </div>
          </div>
        </DataTableShell>
      </section>
    </>
  );
}

export default ReportsPage;
