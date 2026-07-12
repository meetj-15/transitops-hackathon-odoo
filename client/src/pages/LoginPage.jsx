import { useState } from "react";
import { Eye, EyeOff, ShieldCheck, Truck, Users, WalletCards } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InlineError from "../components/feedback/InlineError.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { loginSchema } from "../schemas/loginSchema.js";
import { signupSchema } from "../schemas/signupSchema.js";

const roles = [
  {
    label: "Fleet Manager",
    description: "Full operations control",
    icon: Truck,
  },
  {
    label: "Driver",
    description: "Assigned trips only",
    icon: Users,
  },
  {
    label: "Safety Officer",
    description: "Compliance and licences",
    icon: ShieldCheck,
  },
  {
    label: "Financial Analyst",
    description: "Fuel and expense review",
    icon: WalletCards,
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { authError, login, signup } = useAuth();
  const [mode, setMode] = useState("signin");
  const [selectedRole, setSelectedRole] = useState("Fleet Manager");
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  const [signupValues, setSignupValues] = useState({
    name: "",
    email: "",
    password: "",
    role: "Fleet Manager",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [signupErrors, setSignupErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function updateField(field, value) {
    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: "" }));
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  function updateSignupField(field, value) {
    setSignupErrors((currentErrors) => ({ ...currentErrors, [field]: "" }));
    setSignupValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const parsed = loginSchema.safeParse(formValues);

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ ...parsed.data, demoRole: selectedRole });
      navigate("/dashboard", { replace: true });
    } catch {
      setIsSubmitting(false);
    }
  }

  async function handleSignup(event) {
    event.preventDefault();

    const parsed = signupSchema.safeParse(signupValues);

    if (!parsed.success) {
      setSignupErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(parsed.data);
      navigate("/dashboard", { replace: true });
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-screen compact-login">
      <section className="login-hero professional-hero">
        <p className="eyebrow">Smart Transport Operations</p>
        <h1 className="product-wordmark">TransitOps</h1>
        <p className="hero-tagline">
          A fleet command center for dispatch, driver compliance, maintenance, fuel, expenses, and
          operating visibility.
        </p>
        <div className="hero-summary-grid" aria-label="Platform highlights">
          <div>
            <strong>Dispatch</strong>
            <span>Block invalid vehicle and driver assignments before they happen.</span>
          </div>
          <div>
            <strong>Compliance</strong>
            <span>Surface expired licences, suspended drivers, and maintenance conflicts.</span>
          </div>
          <div>
            <strong>Finance</strong>
            <span>Track fuel logs, expenses, and operational cost by vehicle or trip.</span>
          </div>
        </div>
        <div className="role-preview-panel">
          <span>Preview role-based workspaces</span>
          <div className="role-preview-grid">
            {roles.map((role) => {
              const Icon = role.icon;

              return (
                <button
                  className={`role-card ${selectedRole === role.label ? "active" : ""}`}
                  key={role.label}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.label);
                    setSignupValues((currentValues) => ({ ...currentValues, role: role.label }));
                  }}
                >
                  <Icon size={18} aria-hidden="true" />
                  <strong>{role.label}</strong>
                  <small>{role.description}</small>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="login-card">
        <div className="auth-card-header">
          <div>
            <h1>Welcome</h1>
            <p>{mode === "signin" ? "Sign in to continue." : "Create a backend account."}</p>
          </div>
          <span className="selected-role-pill">
            {mode === "signin" ? selectedRole : signupValues.role}
          </span>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            className={mode === "signin" ? "active" : ""}
            type="button"
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            type="button"
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        {mode === "signin" ? (
          <form className="form-stack" onSubmit={handleSubmit}>
            <InlineError message={authError} />
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                className="input"
                id="email"
                name="email"
                placeholder="fleet.manager@transitops.local"
                type="email"
                value={formValues.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
              <InlineError message={fieldErrors.email?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input
                  className="input"
                  id="password"
                  name="password"
                  placeholder="Enter password"
                  type={showPassword ? "text" : "password"}
                  value={formValues.password}
                  onChange={(event) => updateField("password", event.target.value)}
                />
                <button
                  className="icon-button"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
              <InlineError message={fieldErrors.password?.[0]} />
            </div>
            <button className="button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : `Sign in as ${selectedRole}`}
            </button>
          </form>
        ) : (
          <form className="form-stack" onSubmit={handleSignup}>
            <div className="form-field">
              <label htmlFor="signup_name">Full name</label>
              <input
                className="input"
                id="signup_name"
                value={signupValues.name}
                onChange={(event) => updateSignupField("name", event.target.value)}
              />
              <InlineError message={signupErrors.name?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="signup_email">Email</label>
              <input
                className="input"
                id="signup_email"
                type="email"
                value={signupValues.email}
                onChange={(event) => updateSignupField("email", event.target.value)}
              />
              <InlineError message={signupErrors.email?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="signup_password">Password</label>
              <input
                className="input"
                id="signup_password"
                type="password"
                value={signupValues.password}
                onChange={(event) => updateSignupField("password", event.target.value)}
              />
              <InlineError message={signupErrors.password?.[0]} />
            </div>
            <div className="form-field">
              <label htmlFor="signup_role">Workspace role</label>
              <select
                className="select"
                id="signup_role"
                value={signupValues.role}
                onChange={(event) => {
                  updateSignupField("role", event.target.value);
                  setSelectedRole(event.target.value);
                }}
              >
                {roles.map((role) => (
                  <option key={role.label} value={role.label}>
                    {role.label}
                  </option>
                ))}
              </select>
              <InlineError message={signupErrors.role?.[0]} />
            </div>
            <button className="button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create backend account"}
            </button>
          </form>
        )}

        <div className="demo-credentials">
          <strong>Backend access</strong>
          <span>Use Sign up to create a test account, then sign in with it.</span>
          <small>Offline demo fallback still works only when the backend is unavailable.</small>
        </div>
      </section>
    </main>
  );
}
