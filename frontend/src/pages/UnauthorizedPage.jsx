import { useNavigate } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader.jsx";
import DataTableShell from "../components/shared/DataTableShell.jsx";
import EmptyState from "../components/shared/EmptyState.jsx";
import Button from "../components/ui/Button.jsx";
import { getSessionRole } from "../lib/auth.js";
import { getDefaultRouteForRole } from "../lib/navigation.js";

function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        eyebrow="Access control"
        title="Unauthorized"
        description="You don't have permission to view this page."
        actions={
          <Button
            onClick={() => navigate(getDefaultRouteForRole(getSessionRole()), { replace: true })}
          >
            Go to dashboard
          </Button>
        }
      />

      <DataTableShell title="Access denied" description="Contact your coordinator if you believe this is a mistake." loading={false} hasRows>
        <EmptyState
          title="You do not have access to this page"
          description="Use the sidebar to navigate to modules that are available for your current role."
        />
      </DataTableShell>
    </>
  );
}

export default UnauthorizedPage;
