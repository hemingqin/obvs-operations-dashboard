import Badge from "../ui/Badge.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card.jsx";

function StatCard({ label, value, detail, badge }) {
  return (
    <Card>
      <CardHeader>
        <div className="card-header-inline">
          <CardDescription>{label}</CardDescription>
          {badge ? <Badge variant="info">{badge}</Badge> : null}
        </div>
        <CardTitle className="stat-value">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="stat-footnote">{detail}</p>
      </CardContent>
    </Card>
  );
}

export default StatCard;
