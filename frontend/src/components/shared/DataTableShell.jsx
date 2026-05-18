import Badge from "../ui/Badge.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card.jsx";
import EmptyState from "./EmptyState.jsx";

function DataTableShell({
  title,
  description,
  badge,
  loading,
  hasRows,
  emptyTitle,
  emptyDescription,
  children,
  actions
}) {
  return (
    <Card>
      <CardHeader>
        <div className="card-header-split">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="card-header-actions">
            {badge ? <Badge variant="default">{badge}</Badge> : null}
            {actions}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="empty-state">Loading data...</p>
        ) : hasRows ? (
          children
        ) : (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        )}
      </CardContent>
    </Card>
  );
}

export default DataTableShell;
