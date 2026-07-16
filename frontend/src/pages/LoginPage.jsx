import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readApiError } from "../lib/api.js";
import { buildApiUrl } from "../lib/networkConfig.js";
import { getToken, setToken } from "../lib/auth.js";
import Button from "../components/ui/Button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Badge from "../components/ui/Badge.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getToken()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  function validateForm() {
    const nextErrors = {};

    if (!username.trim()) {
      nextErrors.username = "Enter your username.";
    }

    if (!password.trim()) {
      nextErrors.password = "Enter your password.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleUseDemoAccount() {
    setUsername("admin");
    setPassword("admin123");
    setFieldErrors({});
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(buildApiUrl("/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Invalid username or password"));
      }

      const data = await response.json();
      if (!data.access_token) {
        throw new Error("Missing access token");
      }

      setToken(data.access_token);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-layout">
      <section className="login-intro">
        <Badge variant="info">Operations Platform</Badge>
        <h1 className="login-title">Sign in to the OBVS Operations Platform.</h1>
        <p className="login-copy">
          Coordinate donations, volunteer scheduling, and service requests from one workspace.
        </p>
        <div className="login-highlights">
          <div className="login-highlight">
            <span className="login-highlight-value">Secure access</span>
            <span className="login-highlight-label">Role-based permissions for staff and volunteers</span>
          </div>
          <div className="login-highlight">
            <span className="login-highlight-value">Real-time updates</span>
            <span className="login-highlight-label">Stay informed as requests and donations come in</span>
          </div>
        </div>
      </section>

      <Card className="login-card">
        <CardHeader>
          <Badge variant="default">Sign in</Badge>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Access your organization workspace with your staff credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="login-form" onSubmit={handleSubmit}>
            <Input
              id="username"
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              error={fieldErrors.username}
              autoComplete="username"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={fieldErrors.password}
              autoComplete="current-password"
            />
            {error ? <p className="form-banner form-banner-error">{error}</p> : null}
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="demo-account">
            <div className="demo-account-header">
              <span className="demo-account-title">Demo account</span>
              <Badge variant="info">For presentation</Badge>
            </div>
            <dl className="demo-account-grid">
              <div className="demo-account-field">
                <dt>Username</dt>
                <dd>admin</dd>
              </div>
              <div className="demo-account-field">
                <dt>Password</dt>
                <dd>admin123</dd>
              </div>
            </dl>
            <Button variant="ghost" size="sm" type="button" onClick={handleUseDemoAccount}>
              Use demo account
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default LoginPage;
