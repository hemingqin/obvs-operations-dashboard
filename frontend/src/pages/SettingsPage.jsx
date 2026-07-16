import { useState } from "react";
import PageHeader from "../components/layout/PageHeader.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Switch from "../components/ui/Switch.jsx";
import Tabs from "../components/ui/Tabs.jsx";

const sections = [
  { value: "general", label: "General" },
  { value: "notifications", label: "Notifications" },
  { value: "security", label: "Security" },
  { value: "defaults", label: "Workspace defaults" }
];

function SettingsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [savedMessage, setSavedMessage] = useState("");

  const [general, setGeneral] = useState({
    workspaceName: "Oak Bay Volunteer Services",
    language: "English (US)"
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    push: true,
    weeklySummary: true
  });

  const [security, setSecurity] = useState({
    require2fa: true,
    sessionWarnings: true,
    sessionTimeout: "60"
  });

  const [defaults, setDefaults] = useState({
    defaultPriority: "Medium",
    defaultLandingPage: "Dashboard",
    businessHoursStart: "08:00",
    businessHoursEnd: "17:00"
  });

  function handleSave() {
    setSavedMessage("Changes saved.");
    window.setTimeout(() => setSavedMessage(""), 2500);
  }

  function updateField(setter, field, value) {
    setter((current) => ({ ...current, [field]: value }));
  }

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Configure how OBVS notifies and secures your workspace."
      />

      <Tabs tabs={sections} active={activeSection} onChange={setActiveSection} />

      <Card className="settings-section">
        <CardContent>
          {activeSection === "general" ? (
            <>
              <CardHeader>
                <CardTitle>General</CardTitle>
                <CardDescription>Basic identity for this workspace.</CardDescription>
              </CardHeader>
              <div className="settings-grid">
                <Input
                  id="workspace-name"
                  label="Workspace name"
                  value={general.workspaceName}
                  onChange={(event) => updateField(setGeneral, "workspaceName", event.target.value)}
                />
                <label className="field" htmlFor="workspace-language">
                  <span className="field-label">Language</span>
                  <select
                    id="workspace-language"
                    className="select-input"
                    value={general.language}
                    onChange={(event) => updateField(setGeneral, "language", event.target.value)}
                  >
                    <option>English (US)</option>
                    <option>English (Canada)</option>
                    <option>French (Canada)</option>
                    <option>Spanish</option>
                  </select>
                </label>
              </div>
            </>
          ) : null}

          {activeSection === "notifications" ? (
            <>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose how the workspace reaches staff and volunteers.</CardDescription>
              </CardHeader>
              <Switch
                id="notif-email"
                label="Email notifications"
                description="Send email for new requests, donations, and assignments."
                checked={notificationSettings.email}
                onChange={(value) => updateField(setNotificationSettings, "email", value)}
              />
              <Switch
                id="notif-sms"
                label="SMS notifications"
                description="Send text alerts for urgent service requests."
                checked={notificationSettings.sms}
                onChange={(value) => updateField(setNotificationSettings, "sms", value)}
              />
              <Switch
                id="notif-push"
                label="Push notifications"
                description="Show in-app alerts in real time."
                checked={notificationSettings.push}
                onChange={(value) => updateField(setNotificationSettings, "push", value)}
              />
              <Switch
                id="notif-weekly"
                label="Weekly summary email"
                description="Send coordinators a Monday recap of activity."
                checked={notificationSettings.weeklySummary}
                onChange={(value) => updateField(setNotificationSettings, "weeklySummary", value)}
              />
            </>
          ) : null}

          {activeSection === "security" ? (
            <>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Protect accounts and active sessions.</CardDescription>
              </CardHeader>
              <Switch
                id="security-2fa"
                label="Require two-factor authentication for admins"
                description="Applies to all Admin-role accounts on next sign-in."
                checked={security.require2fa}
                onChange={(value) => updateField(setSecurity, "require2fa", value)}
              />
              <Switch
                id="security-session-warning"
                label="Warn before session timeout"
                description="Show a warning banner two minutes before signing users out."
                checked={security.sessionWarnings}
                onChange={(value) => updateField(setSecurity, "sessionWarnings", value)}
              />
              <label className="field" htmlFor="security-timeout" style={{ marginTop: "0.5rem" }}>
                <span className="field-label">Session timeout</span>
                <select
                  id="security-timeout"
                  className="select-input"
                  value={security.sessionTimeout}
                  onChange={(event) => updateField(setSecurity, "sessionTimeout", event.target.value)}
                >
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="120">2 hours</option>
                </select>
              </label>
            </>
          ) : null}

          {activeSection === "defaults" ? (
            <>
              <CardHeader>
                <CardTitle>Workspace defaults</CardTitle>
                <CardDescription>Starting values applied to new records.</CardDescription>
              </CardHeader>
              <div className="settings-grid">
                <label className="field" htmlFor="default-priority">
                  <span className="field-label">Default request priority</span>
                  <select
                    id="default-priority"
                    className="select-input"
                    value={defaults.defaultPriority}
                    onChange={(event) => updateField(setDefaults, "defaultPriority", event.target.value)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </label>
                <label className="field" htmlFor="default-landing">
                  <span className="field-label">Default landing page</span>
                  <select
                    id="default-landing"
                    className="select-input"
                    value={defaults.defaultLandingPage}
                    onChange={(event) => updateField(setDefaults, "defaultLandingPage", event.target.value)}
                  >
                    <option>Dashboard</option>
                    <option>Notifications</option>
                  </select>
                </label>
                <Input
                  id="business-hours-start"
                  label="Business hours start"
                  type="time"
                  value={defaults.businessHoursStart}
                  onChange={(event) => updateField(setDefaults, "businessHoursStart", event.target.value)}
                />
                <Input
                  id="business-hours-end"
                  label="Business hours end"
                  type="time"
                  value={defaults.businessHoursEnd}
                  onChange={(event) => updateField(setDefaults, "businessHoursEnd", event.target.value)}
                />
              </div>
            </>
          ) : null}

          <div className="card-header-split" style={{ marginTop: "1.5rem" }}>
            {savedMessage ? <Badge variant="success">{savedMessage}</Badge> : <span />}
            <Button onClick={handleSave}>Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default SettingsPage;
