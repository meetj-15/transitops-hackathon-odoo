import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="centered-page">
      <section className="message-card">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>The route you opened does not exist in TransitOps.</p>
        <Link className="button" to="/dashboard">
          Return to dashboard
        </Link>
      </section>
    </main>
  );
}
