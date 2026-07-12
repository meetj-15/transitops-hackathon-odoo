import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ForbiddenPage() {
  const { logout, user } = useAuth();

  return (
    <main className="centered-page">
      <section className="message-card">
        <p className="eyebrow">403</p>
        <h1>Permission required</h1>
        <p>
          Your current role{user?.role ? ` (${user.role})` : ""} does not have access to this
          workspace area.
        </p>
        <Link className="button" to="/dashboard">
          Return to dashboard
        </Link>
        <button className="button secondary" type="button" onClick={logout}>
          Sign in with another account
        </button>
      </section>
    </main>
  );
}
