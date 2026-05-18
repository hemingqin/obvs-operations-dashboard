import Badge from "../ui/Badge.jsx";
import EmptyState from "./EmptyState.jsx";
import { formatCurrency, formatDate } from "../../hooks/useOperationsData.js";

function ActivityFeed({ items, loading }) {
  if (loading) {
    return <p className="empty-state">Building activity feed...</p>;
  }

  if (!items.length) {
    return (
      <EmptyState
        title="No recent activity"
        description="New donations and operations events will appear here."
      />
    );
  }

  return (
    <div className="stack-list">
      {items.map((item) => (
        <div key={item.id} className="activity-item">
          <div>
            <p className="activity-title">{item.title}</p>
            <p className="activity-meta">{item.description}</p>
            <p className="activity-meta">{formatDate(item.timestamp)}</p>
          </div>
          <div className="activity-trailing">
            {item.amount ? (
              <span className="activity-amount">{formatCurrency(Number(item.amount))}</span>
            ) : null}
            <Badge variant="default">Recent</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityFeed;
