import PageHeader from "../components/layout/PageHeader.jsx";
import DataTableShell from "../components/shared/DataTableShell.jsx";
import EmptyState from "../components/shared/EmptyState.jsx";
import StatCard from "../components/shared/StatCard.jsx";
import Badge from "../components/ui/Badge.jsx";
import { mockPageSummaries, mockVolunteerStats } from "../lib/mockData.js";

function PlaceholderPage({ section }) {
  const summary = mockPageSummaries[section] || {
    description: "This section is ready for future backend integration.",
    highlights: ["Scalable routing", "Shared shell", "Reusable components"]
  };

  return (
    <>
      <PageHeader
        eyebrow="Operations module"
        title={section}
        description={summary.description}
        actions={<Badge variant="warning">Mock content</Badge>}
      />

      <section className="stats-grid">
        {mockVolunteerStats.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            detail={item.detail}
            badge="Preview"
          />
        ))}
      </section>

      <section className="content-grid">
        <div className="content-span-2">
          <DataTableShell
            title={`${section} workspace`}
            description="This placeholder establishes production-style page structure and visual consistency."
            loading={false}
            hasRows
          >
            <div className="summary-grid">
              {summary.highlights.map((highlight) => (
                <div key={highlight} className="summary-item">
                  <span className="summary-label">Preview</span>
                  <strong>{highlight}</strong>
                </div>
              ))}
            </div>
          </DataTableShell>
        </div>

        <DataTableShell
          title="Module status"
          description="Backend integration can be layered in later without changing the shell."
          loading={false}
          hasRows
        >
          <EmptyState
            title="Ready for implementation"
            description="Routing, navigation, and page-level structure are in place for this module."
          />
        </DataTableShell>
      </section>
    </>
  );
}

export default PlaceholderPage;
